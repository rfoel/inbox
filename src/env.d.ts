/// <reference types="astro/client" />

declare namespace NodeJS {
	export interface ProcessEnv {
		TOTP_KEY: string;
		JWT_SECRET: string;
		DOMAIN_NAME: string;
		HAS_ROUTE_53_DOMAIN: string;
		EXTERNAL_DOMAIN_CERTIFICATE_ARN: string;
	}
}
