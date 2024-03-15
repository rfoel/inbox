import { dinamo } from "./dinamo";

export type Recipient = {
	source: string;
	target: string;
	address: string;
	name: string;
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
	return recipients.map((recipient) => ({
		address: recipient.address,
		name: recipient.name,
	}));
};
