import Dinamo from "dinamo";

export const dinamo = new Dinamo({
	tableName: "dev-inbox-table",
	region: "us-east-1",
});

const relations = await dinamo.query<{ source: string; target: string }>({
	key: { source: "recipient#root", target: { beginsWith: "recipient#" } },
});

const recipients = relations.data.map((relation) => relation.target);

for (const recipient of recipients) {
	const relations = await dinamo.query<{ source: string; target: string }>({
		key: { source: recipient, target: { beginsWith: "message#" } },
	});

	await Promise.all(
		relations.data.flatMap((relation) => [
			dinamo.update({
				key: { source: relation.source, target: relation.target },
				item: { read: false },
			}),
			dinamo.update({
				key: { source: relation.target, target: relation.target },
				item: { read: false },
			}),
		]),
	);
}
