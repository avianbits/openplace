import { NextFunction, Request, Response } from "@tinyhttp/app";

export function handleIP(req: Request, _res: Response, next?: NextFunction) {
	// Ensure req.ip is always a valid IP address
	let ip = req.get("cf-connecting-ip") as string ??
	         req.get("x-forwarded-for") as string ??
	         req.connection?.remoteAddress ??
	         req.ip ??
	         "127.0.0.1";

	// Clean up IP address (remove port, handle multiple IPs)
	if (ip && ip.includes(","))
		ip = ip.split(",")[0]?.trim() ?? "";

	if (ip && ip.includes(":")) {
		const parts = ip.split(":");
		ip = parts.length > 2
			? parts.join(":") // IPv6
			: parts[0] ?? ""; // IPv4 with port
	}

	// Validate IP format
	if (!ip || ip.length < 7 || (!ip.includes(".") && !ip.includes(":")))
		ip = "127.0.0.1";

	req.ip = ip;
	next?.();
}
