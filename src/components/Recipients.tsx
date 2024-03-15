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

	return (
		<div className="flex flex-col bg-white rounded-xl w-[256px] min-w-[256px]">
			<h1 className="text-2xl font-black p-4">Recipients</h1>
			{query.data?.length ? (
				<div className="flex flex-col">
					{query.data
						.sort(
							(a, b) =>
								a.name.localeCompare(b.name) ||
								a.address.localeCompare(b.address),
						)
						.map((recipient) => (
							<button
								key={recipient.address}
								className={cn(
									"p-4 hover:bg-green-100 w-full border-l-4 border-transparent text-left",
									{
										"bg-green-50 border-green-200":
											recipient.address === appContext.state.recipient,
									},
								)}
								onClick={() => handleClick(recipient.address)}
								type="button"
							>
								{recipient.address}
							</button>
						))}
				</div>
			) : (
				<div />
			)}
		</div>
	);
};
