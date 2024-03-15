import type { SSTConfig } from "sst";
import * as sst from "sst/constructs";
import { aws_ses, aws_ses_actions, aws_iam, aws_route53 } from "aws-cdk-lib";

export default {
	config(_input) {
		return {
			name: "inbox",
			region: "us-east-1",
		};
	},
	stacks(app) {
		app.stack(async function Inbox({ stack }) {
			const prefix = stack.stage === "prod" ? "" : `${stack.stage}.`;

			const table = new sst.Table(stack, "table", {
				fields: {
					source: "string",
					target: "string",
				},
				primaryIndex: { partitionKey: "source", sortKey: "target" },
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

			const hostedZone = aws_route53.HostedZone.fromLookup(
				stack,
				"hosted-zone",
				{
					domainName: process.env.DOMAIN_NAME,
				},
			);

			const recipient = `${prefix}${process.env.DOMAIN_NAME}`;

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

			new aws_ses.ReceiptRuleSet(stack, "receipt-rule-set", {
				rules: [
					{
						receiptRuleName: stack.stage,
						enabled: true,
						recipients: [recipient],
						actions: [action],
					},
				],
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

			const existingIdentity = aws_ses.EmailIdentity.fromEmailIdentityName(
				stack,
				"existing-identity",
				process.env.DOMAIN_NAME,
			);

			if (!existingIdentity) {
				new aws_ses.EmailIdentity(stack, "identity", {
					identity: aws_ses.Identity.domain(process.env.DOMAIN_NAME),
				});
			}

			bucket.attachPermissions([statement]);
			handleObjectCreated.bind([bucket, table]);

			const domainName = `${prefix}inbox.${process.env.DOMAIN_NAME}`;
			const site = new sst.AstroSite(stack, "site", {
				customDomain: {
					hostedZone: process.env.DOMAIN_NAME,
					domainName,
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
