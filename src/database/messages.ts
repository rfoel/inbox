import type { Readable } from "node:stream";

import { dinamo } from "./dinamo";
import { S3 } from "@aws-sdk/client-s3";
import { simpleParser } from "mailparser";
import { Bucket } from "sst/node/bucket";

const s3 = new S3();

type Address = {
	address: string;
	name: string | undefined;
};

export type Message = {
	key: string;
	date: number;
	from: Address;
	subject: string;
	to: Address[];
	text?: string;
	html?: string;
	read: boolean;
	source: string;
	target: string;
	createdAt: number;
	updatedAt: number;
};

export type MessageWithContent = Message & {
	text?: string;
	html?: string;
};

export const messages = async (recipient: string) => {
	const relations = await dinamo.query<{ source: string; target: string }>({
		key: {
			source: `recipient#${recipient}`,
		},
		query: {
			target: { beginsWith: "message#" },
		},
		indexName: "dateIndex",
		scanIndexForward: false,
	});
	if (!relations.data.length) {
		return [];
	}
	const messages = await dinamo.batchGet<Message>({
		keys: relations.data.map((relation) => ({
			source: relation.target,
			target: relation.target,
		})),
	});
	return messages.sort((a, b) => b.date - a.date);
};

export const message = async (key: string) => {
	const messageKey = `message#${key}`;
	const message = await dinamo.get<Message>({
		key: { source: messageKey, target: messageKey },
	});
	await dinamo.update({
		key: { source: messageKey, target: messageKey },
		item: { read: true },
	});
	await Promise.all(
		message.to.map((recipient) => {
			const recipientKey = `recipient#${recipient.address}`;
			return dinamo.update({
				key: { source: recipientKey, target: messageKey },
				item: { read: true },
			});
		}),
	);
	await dinamo.update<Message>({
		key: { source: messageKey, target: messageKey },
		item: { read: true },
	});
	const file = await s3.getObject({
		Bucket: Bucket.bucket.bucketName,
		Key: key,
	});
	const parsed = await simpleParser(file.Body as Readable);
	return {
		key: message.key,
		date: message.date,
		from: message.from,
		subject: message.subject,
		to: message.to,
		text: parsed.text,
		html: parsed.html,
		read: message.read,
	};
};
