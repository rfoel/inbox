import type { APIRoute } from "astro";
import { totp } from "../../utils/totp";
import { sign } from "../../utils/jwt";

export const POST: APIRoute = async ({ cookies, request }) => {
	try {
		const body = await request.json();
		const otp = totp(process.env.TOTP_KEY);
		if (body.otp !== otp) {
			throw new Error("Invalid one-time password provided");
		}
		const accessToken = await sign();

		cookies.set("inbox_jwt", accessToken, {
			httpOnly: true,
			maxAge: 604800,
			path: "/",
		});

		return new Response(null, {
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
