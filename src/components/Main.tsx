import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecipientsView } from "./Recipients";
import { MessagesView } from "./Messages";
import { MessageView } from "./Message";
import { AppContextProvider } from "./AppContext";

const queryClient = new QueryClient();

export const Main = () => {
	return (
		<AppContextProvider>
			<QueryClientProvider client={queryClient}>
				<div className="flex gap-6 h-screen w-screen bg-gray-100 p-6 items-stretch">
					<RecipientsView />
					<MessagesView />
					<MessageView />
				</div>
			</QueryClientProvider>
		</AppContextProvider>
	);
};
