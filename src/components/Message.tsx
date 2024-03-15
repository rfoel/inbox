import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "./AppContext";
import type { MessageWithContent } from "../database/messages";

export const MessageView = () => {
	const appContext = useAppContext();
	const query = useQuery<MessageWithContent>({
		queryKey: ["message", appContext.state.message],
		queryFn: () =>
			fetch(`/api/message/${appContext.state.message}`).then((response) =>
				response.json(),
			),
		enabled: !!appContext.state.message,
	});

	return (
		<div className="flex flex-col gap-4 flex-grow">
			<div className="flex flex-col bg-white rounded-xl">
				<h1 className="text-2xl font-black p-4">{query.data?.subject}</h1>
				<div className="p-4">
					<div className="flex gap-2 items-center">
						<p className="font-bold">
							{query.data?.from.name ?? query.data?.from.address}
						</p>
						<p className="text-sm text-gray-700">{`<${query.data?.from.address}>`}</p>
					</div>
					<div className="flex gap-2 items-center text-gray-700">
						to {query.data?.to.map((recipient) => recipient.address).join(", ")}
					</div>
				</div>
			</div>
			<div className="flex p-4 overflow-y-scroll overflow-x-hidden bg-white rounded-xl flex-grow">
				{query.data?.html ? (
					<iframe
						title={query.data.subject}
						src={`data:text/html,${encodeURIComponent(
							`<base target="_blank" />${query.data.html}`,
						)}`}
						className="w-full flex-grow"
					/>
				) : null}
				{!query.data?.html && query.data?.text ? (
					<iframe
						title={query.data.subject}
						src={`data:text/html,${encodeURIComponent(
							`<base target="_blank" />${query.data.text}`,
						)}`}
						className="w-full flex-grow"
					/>
				) : null}
			</div>
		</div>
	);
};
