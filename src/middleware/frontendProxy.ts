import { NextFunction, Request, Response } from "@tinyhttp/app";

const FRONTEND_HOST = process.env["FRONTEND_HOST"] ?? "localhost";
const FRONTEND_PORT = process.env["FRONTEND_PORT"] ?? "3001";

export async function proxyFrontend(req: Request, res: Response, next?: NextFunction) {
	if (req.path.startsWith("/beta") || req.path.startsWith("/_nuxt") || req.path.startsWith("/__nuxt")) {
		try {
			const res2 = await fetch(`http://${FRONTEND_HOST}:${FRONTEND_PORT}${req.url}`, {
				method: req.method as string,
				headers: req.headers as RequestInit["headers"],
				body: ["GET", "HEAD"].includes(req.method as string) ? undefined : JSON.stringify(req.body) as RequestInit["body"]
			} as RequestInit);
            
			res.status(res2.status);

			for (const [key, value] of res2.headers.entries())
				res.set(key, value);

			return res.send(await res2.text());
		} catch (error) {
			console.error("Frontend proxy error:", error);
			return res.status(502)
				.send("Bad Gateway");
		}
	}
	return next?.();
}
