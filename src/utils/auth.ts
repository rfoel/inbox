import type { AstroCookies } from "astro";
import { decode } from "./jwt";

export const checkAuth = (cookies: AstroCookies) => {
	const cookie = cookies.get("inbox_jwt")?.value;
	if (!cookie) {
		throw new Error("Unauthorized");
	}
	decode(cookie);
};
