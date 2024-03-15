import type { APIRoute } from "astro";
import { checkAuth } from "../../../utils/auth";
import { Messages } from "../../../database";

export const GET: APIRoute = async ({ cookies, params }) => {
	try {
		checkAuth(cookies);

		if (!params.key) {
			throw Error("Key not found");
		}

		const message = await Messages.message(params.key);

		return new Response(JSON.stringify(message), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			return new Response(JSON.stringify({ message: error.message }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		return new Response(JSON.stringify({ message: "Unknown error" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
};
