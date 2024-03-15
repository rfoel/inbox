import type { APIRoute } from "astro";
import { checkAuth } from "../../utils/auth";
import { Recipients } from "../../database";

export const GET: APIRoute = async ({ cookies }) => {
	try {
		checkAuth(cookies);

		const recipients = await Recipients.recipients();

		return new Response(JSON.stringify(recipients), {
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
