import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "./AppContext";
import type { Message } from "../database/messages";
import { useEffect } from "react";
import { cn } from "../utils/tailwind";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { fromNow } from "../utils/fromNow";

dayjs.extend(relativeTime);

export const MessagesView = () => {
	const appContext = useAppContext();
	const query = useQuery<Message[]>({
		queryKey: ["messages", appContext.state.recipient],
		queryFn: () =>
			fetch(`/api/messages/${appContext.state.recipient}`).then((response) =>
				response.json(),
			),
		enabled: !!appContext.state.recipient,
	});

	const handleClick = (payload: string) => {
		appContext.dispatch({ type: "setMessage", payload });
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: no
	useEffect(() => {
		if (query.data?.length) {
			appContext.dispatch({
				type: "setMessage",
				payload: query.data[0].key,
			});
		}
	}, [query.data]);

	return (
		<div className="flex flex-col bg-white rounded-xl w-[352px] min-w-[352px]">
			<h1 className="text-2xl font-black p-4">Messages</h1>
			{query.data?.length ? (
				<div className="flex flex-col">
					{query.data.map((message) => (
						<button
							key={message.key}
							className={cn(
								"p-4 hover:bg-green-100 w-full border-l-4 border-transparent text-left flex items-center gap-4",
								{
									"bg-green-50 border-green-200":
										message.key === appContext.state.message,
									"font-bold": !message.read,
								},
							)}
							onClick={() => handleClick(message.key)}
							type="button"
						>
							<div className="w-full">
								<p className="text-gray-700">
									{message.from.name ?? message.from.address}
								</p>
								<p className="text-lg whitespace-nowrap	 text-ellipsis overflow-hidden">
									{message.subject}
								</p>
								<p className="text-gray-700">{fromNow(message.date)}</p>
							</div>
						</button>
					))}
				</div>
			) : (
				<div />
			)}
		</div>
	);
};
