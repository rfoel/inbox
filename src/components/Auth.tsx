import { OTPInput, type SlotProps } from "input-otp";
import { cn } from "../utils/tailwind";
import { useRef, useState } from "react";

function FakeCaret() {
	return (
		<div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
			<div className="w-px h-8 bg-black" />
		</div>
	);
}

function Slot(props: SlotProps) {
	return (
		<div
			className={cn(
				"relative w-10 h-14 text-[2rem]",
				"flex items-center justify-center",
				"border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md",
				"group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20",
				"outline outline-0 outline-accent-foreground/20",
				{ "outline-2 outline-accent-foreground": props.isActive },
			)}
		>
			{props.char !== null && <div>{props.char}</div>}
			{props.hasFakeCaret && <FakeCaret />}
		</div>
	);
}

export const Auth = () => {
	const [error, setError] = useState("");
	const [value, setValue] = useState("");

	const handleComplete = async (otp: string) => {
		try {
			const response = await fetch("/api/authenticate", {
				method: "post",
				body: JSON.stringify({ otp }),
			});

			if (response.status !== 200) {
				throw await response.json();
			}

			window.location.replace("/");
		} catch (error) {
			setValue("");
			if (
				error &&
				typeof error === "object" &&
				"message" in error &&
				typeof error.message === "string"
			) {
				setError(error.message);
			}
		}
	};

	return (
		<div>
			<OTPInput
				maxLength={6}
				containerClassName="group flex items-center has-[:disabled]:opacity-30"
				onComplete={handleComplete}
				onChange={(newValue) => {
					setError("");
					setValue(newValue);
				}}
				autoFocus
				value={value}
				render={({ slots }) => (
					<>
						<div className="flex">
							{slots.slice(0, 3).map((slot, idx) => {
								const key = `slot-${idx}`;
								return <Slot key={key} {...slot} />;
							})}
						</div>
						<div className="flex w-10 justify-center items-center">
							<div className="w-3 h-1 rounded-full bg-black" />
						</div>
						<div className="flex">
							{slots.slice(3).map((slot, idx) => {
								const key = `slot-${idx}`;
								return <Slot key={key} {...slot} />;
							})}
						</div>
					</>
				)}
			/>
			{error ? <p className="text-center text-red-500 mt-4">{error}</p> : null}
		</div>
	);
};
