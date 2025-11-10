import { NextFunction, Request, Response } from "@tinyhttp/app";

export function logSuspiciousRequests(req: Request, _res: Response, next?: NextFunction) {
	if (req.body && typeof req.body === "string" && req.body.length > 0)
		console.warn(`[${new Date()
			.toISOString()}] Suspicious request body from ${req.ip} to ${req.method} ${req.path}:`, req.body.slice(0, 100));

	return next?.();
}
