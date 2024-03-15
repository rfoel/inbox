import { dinamo } from "./dinamo";

export type Recipient = {
	source: string;
	target: string;
	address: string;
	name: string;
	unread: number;
	createdAt: number;
	updatedAt: number;
};

export const recipients = async () => {
	const relations = await dinamo.query<{ source: string; target: string }>({
		key: { source: "recipient#root", target: { beginsWith: "recipient#" } },
	});
	if (!relations.data.length) {
		return [];
	}
	const recipients = await dinamo.batchGet<Recipient>({
		keys: relations.data.map((relation) => ({
			source: relation.target,
			target: relation.target,
		})),
	});

	return Promise.all(
		recipients.map(async (recipient) => {
			const recipientKey = `recipient#${recipient.address}`;
			const unreadMessages = await dinamo.query({
				key: { source: recipientKey, target: { beginsWith: "message#" } },
				query: {
					read: false,
				},
			});
			return {
				address: recipient.address,
				name: recipient.name,
				unread: unreadMessages.data.length,
			};
		}),
	);
};
