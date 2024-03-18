import type { SSTConfig } from "sst";
import * as sst from "sst/constructs";
import {
	aws_ses,
	aws_ses_actions,
	aws_iam,
	aws_route53,
	aws_certificatemanager,
} from "aws-cdk-lib";

export default {
	config(_input) {
		return {
			name: "inbox",
			region: "us-east-1",
		};
	},
	stacks(app) {
		app.stack(({ stack }) => {
			const prefix = stack.stage === "prod" ? "" : `${stack.stage}.`;

			const table = new sst.Table(stack, "table", {
				fields: {
					source: "string",
					target: "string",
					date: "number",
				},
				primaryIndex: { partitionKey: "source", sortKey: "target" },
				localIndexes: { dateIndex: { sortKey: "date" } },
			});

			const handleObjectCreated = new sst.Function(
				stack,
				"handleObjectCreated",
				{
					handler: "src/functions/handleObjectCreated.handler",
					runtime: "nodejs20.x",
				},
			);

			const bucket = new sst.Bucket(stack, "bucket", {
				blockPublicACLs: true,
				notifications: {
					handleObjectCreated: {
						function: handleObjectCreated,
						events: ["object_created"],
					},
				},
			});

			const action = new aws_ses_actions.S3({
				bucket: bucket.cdk.bucket,
			});

			const isExternalDomain = process.env.IS_EXTERNAL_DOMAIN === "true";

			const hostedZone = isExternalDomain
				? null
				: aws_route53.HostedZone.fromLookup(stack, "hosted-zone", {
						domainName: process.env.DOMAIN_NAME,
				  });

			const recipient = `${prefix}${process.env.DOMAIN_NAME}`;

			if (hostedZone) {
				new aws_route53.MxRecord(stack, "mx", {
					values: [
						{
							hostName: "inbound-smtp.us-east-1.amazonaws.com",
							priority: 10,
						},
					],
					recordName: recipient,
					zone: hostedZone,
					deleteExisting: true,
				});
			}

			const receiptRuleSet = aws_ses.ReceiptRuleSet.fromReceiptRuleSetName(
				stack,
				"receipt-rule-set",
				"inbox",
			);

			receiptRuleSet.addRule(stack.stage, {
				receiptRuleName: stack.stage,
				enabled: true,
				recipients: [recipient],
				actions: [action],
			});

			const statement = new aws_iam.PolicyStatement({
				actions: ["s3:PutObject"],
				effect: aws_iam.Effect.ALLOW,
				resources: [bucket.bucketArn],
				conditions: {
					StringEquals: {
						"AWS:SourceAccount": stack.account,
					},
					StringLike: {
						"AWS:SourceArn": "arn:aws:ses:*",
					},
				},
			});

			bucket.attachPermissions([statement]);
			handleObjectCreated.bind([bucket, table]);

			const domainName = `${prefix}inbox.${process.env.DOMAIN_NAME}`;

			const site = new sst.AstroSite(stack, "site", {
				customDomain: {
					isExternalDomain,
					hostedZone: isExternalDomain ? undefined : process.env.DOMAIN_NAME,
					domainName,
					cdk: {
						certificate: isExternalDomain
							? aws_certificatemanager.Certificate.fromCertificateArn(
									stack,
									"certificate",
									process.env.EXTERNAL_DOMAIN_CERTIFICATE_ARN,
							  )
							: undefined,
					},
				},
				environment: {
					TOTP_KEY: process.env.TOTP_KEY,
					JWT_SECRET: process.env.JWT_SECRET,
				},
				bind: [bucket, table],
			});
			stack.addOutputs({
				url: site.url,
			});
		});
	},
} satisfies SSTConfig;
