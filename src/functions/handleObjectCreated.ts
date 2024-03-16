import type { Readable } from "node:stream";

import type { S3Handler } from "aws-lambda";
import { S3 } from "@aws-sdk/client-s3";
import { simpleParser } from "mailparser";
import { dinamo } from "../database/dinamo";

const s3 = new S3();

export const handler: S3Handler = async (event) => {
	await Promise.all(
		event.Records.map(async (record): Promise<void> => {
			try {
				const {
					s3: { bucket, object },
				} = record;
				const file = await s3.getObject({
					Bucket: bucket.name,
					Key: object.key,
				});
				const parsed = await simpleParser(file.Body as Readable);

				const recipients = Array.isArray(parsed.to)
					? parsed.to[0].value.map((value) => ({
							address: value.address as string,
							name: value.name,
					  }))
					: [
							{
								address: parsed.to?.value[0].address as string,
								name: parsed.to?.value[0].name,
							},
					  ];
				const message = {
					date: +(parsed.date as Date),
					from: {
						address: parsed.from?.value[0].address as string,
						name: parsed.from?.value[0].name,
					},
					subject: parsed.subject as string,
					to: recipients,
				};

				await Promise.all(
					recipients.map(async ({ address, name }) => {
						const recipientKey = `recipient#${address}`;
						await dinamo.update({
							key: { source: recipientKey, target: recipientKey },
							item: { address, name },
						});
						await dinamo.update({
							key: { source: "recipient#root", target: recipientKey },
							item: {},
						});
						const messageKey = `message#${object.key}`;
						await dinamo.put({
							item: {
								source: messageKey,
								target: messageKey,
								recipient: address,
								key: object.key,
								read: false,
								...message,
							},
						});
						await dinamo.put({
							item: {
								source: recipientKey,
								target: messageKey,
								read: false,
								date: message.date,
							},
						});
					}),
				);
			} catch (error) {
				console.log(error);
			}
		}),
	);
};
