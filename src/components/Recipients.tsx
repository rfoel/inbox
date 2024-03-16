import { useQuery } from "@tanstack/react-query";
import type { Recipient } from "../database/recipients";
import { useAppContext } from "./AppContext";
import { useEffect } from "react";
import { cn } from "../utils/tailwind";

export const RecipientsView = () => {
	const query = useQuery<Recipient[]>({
		queryKey: ["recipients"],
		queryFn: () => fetch("/api/recipients").then((response) => response.json()),
	});
	const appContext = useAppContext();

	const handleClick = (payload: string) => {
		appContext.dispatch({ type: "setRecipient", payload });
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: no
	useEffect(() => {
		if (query.data?.length && !appContext.state.recipient) {
			appContext.dispatch({
				type: "setRecipient",
				payload: query.data[0].address,
			});
		}
	}, [query.data]);

	const addresses =
		query.data?.reduce(
			(acc, recipient) => {
				const [username, domain] = recipient.address.split("@");
				if (!acc[domain]) {
					acc[domain] = [];
				}
				acc[domain].push(username);
				return acc;
			},
			{} as { [key: string]: string[] },
		) ?? {};

	return (
		<div className="flex flex-col bg-white rounded-xl w-[256px] min-w-[256px]">
			<h1 className="text-2xl font-black p-4">Recipients</h1>

			{Object.keys(addresses).length ? (
				<div className="flex flex-col overflow-y-scroll overflow-x-hidden">
					{Object.entries(addresses)
						.sort(([a], [b]) => a.localeCompare(b))
						.map(([domain, usernames]) => (
							<div>
								<div className="font-bold text-sm p-4">{domain}</div>
								{usernames.map((username) => {
									const recipient = query.data?.find(
										({ address }) => address === `${username}@${domain}`,
									);
									if (!recipient) {
										return null;
									}
									return (
										<button
											key={`${username}@${domain}`}
											className={cn(
												"p-4 hover:bg-green-100 w-full border-l-4 border-transparent text-left flex items-center gap-2",
												{
													"bg-green-50 border-green-200":
														`${username}@${domain}` ===
														appContext.state.recipient,
												},
											)}
											onClick={() => handleClick(`${username}@${domain}`)}
											type="button"
										>
											<div>{username}</div>
											{recipient.unread > 0 ? (
												<div className="flex items-center justify-center bg-red-500 text-white h-5 w-5 rounded-full text-xs">
													{recipient.unread}
												</div>
											) : null}
										</button>
									);
								})}
							</div>
						))}
				</div>
			) : null}
		</div>
	);
};
