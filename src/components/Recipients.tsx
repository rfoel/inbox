import { useQuery } from "@tanstack/react-query";
import type { Recipient } from "../database/recipients";
import { useAppContext } from "./AppContext";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/tailwind";

const Username = ({
	username,
	domain,
}: { username: string; domain: string }) => {
	const query = useQuery<Recipient[]>({
		queryKey: ["recipients"],
		queryFn: () => fetch("/api/recipients").then((response) => response.json()),
		networkMode: "offlineFirst",
	});
	const appContext = useAppContext();

	const recipient = query.data?.find(
		({ address }) => address === `${username}@${domain}`,
	);
	if (!recipient) {
		return null;
	}

	const handleClick = (payload: string) => {
		appContext.dispatch({ type: "setRecipient", payload });
	};

	return (
		<button
			key={`${username}@${domain}`}
			className={cn(
				"p-4 hover:bg-green-100 w-full border-l-4 border-transparent text-left flex items-center gap-2",
				{
					"bg-green-50 border-green-200":
						`${username}@${domain}` === appContext.state.recipient,
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
};

const Domain = ({
	domain,
	usernames,
}: { domain: string; usernames: string[] }) => {
	const query = useQuery<Recipient[]>({
		queryKey: ["recipients"],
		queryFn: () => fetch("/api/recipients").then((response) => response.json()),
		networkMode: "offlineFirst",
	});
	const appContext = useAppContext();
	const [expanded, toggleExpand] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (appContext.state.recipient) {
			toggleExpand(appContext.state.recipient.endsWith(domain));
		}
	}, [appContext.state.recipient]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const unread = useMemo(
		() =>
			query.data
				?.filter((recipient) => recipient.address.endsWith(domain))
				.reduce((acc, recipient) => acc + recipient.unread, 0) ?? 0,
		[query.data],
	);

	return (
		<div key={domain}>
			<div className="flex items-center justify-between font-bold text-sm p-4">
				<div className="flex gap-2 items-center">
					{unread > 0 ? (
						<div className="w-2 h-2 rounded-full bg-red-500" />
					) : null}
					<div>{domain}</div>
				</div>

				<button
					type="button"
					className="h-3 w-3 flex items-center"
					onClick={() => toggleExpand(!expanded)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 320 512"
						className={cn({ "rotate-180": !expanded })}
					>
						<title>Toggle expand</title>
						<path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z" />
					</svg>
				</button>
			</div>
			<div className={cn({ "h-0": !expanded })}>
				{usernames.map((username) => (
					<Username key={username} domain={domain} username={username} />
				))}
			</div>
		</div>
	);
};

export const RecipientsView = () => {
	const query = useQuery<Recipient[]>({
		queryKey: ["recipients"],
		queryFn: () => fetch("/api/recipients").then((response) => response.json()),
	});
	const appContext = useAppContext();

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
							<Domain key={domain} domain={domain} usernames={usernames} />
						))}
				</div>
			) : null}
		</div>
	);
};
