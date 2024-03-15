import * as React from "react";
import { useReducer } from "react";

type Action =
	| { type: "setRecipient"; payload: string }
	| { type: "setMessage"; payload: string };
type Dispatch = (action: Action) => void;
type State = { recipient: string; message: string };
type AppContextProviderProps = { children: React.ReactNode };

const AppContext = React.createContext<
	{ state: State; dispatch: Dispatch } | undefined
>(undefined);

const countReducer = (state: State, action: Action) => {
	switch (action.type) {
		case "setRecipient": {
			return { ...state, recipient: action.payload };
		}
		case "setMessage": {
			return { ...state, message: action.payload };
		}
		default: {
			throw new Error("Unhandled action type");
		}
	}
};

const AppContextProvider = ({ children }: AppContextProviderProps) => {
	const [state, dispatch] = useReducer(countReducer, {
		recipient: "",
		message: "",
	});
	const value = { state, dispatch };
	return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => {
	const context = React.useContext(AppContext);
	if (context === undefined) {
		throw new Error("useAppContext must be used within a AppContextProvider");
	}
	return context;
};

export { AppContextProvider, useAppContext };
