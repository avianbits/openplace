import { NextFunction, Request, Response } from "@tinyhttp/app";
import { json } from "milliparsec";

const jsonMiddleware = json({
	payloadLimit: 50 * 1024 * 1024 // 50 MB
});

export function parseJSON(req: Request, res: Response, next?: NextFunction) {
	// Hack for paths that use multipart body or don't need JSON parsing
	if (req.path === "/report-user"
        || req.path === "/moderator/timeout-user"
        || req.path === "/admin/ban-user"
        || req.path === "/me/profile-picture"
        || req.path === "/me/sessions")
		return next?.();

	// Wrap JSON middleware with error handling
	try {
		return jsonMiddleware(req, res, next);
	} catch (error) {
		console.warn(`[${new Date()
			.toISOString()}] JSON parsing error for ${req.method} ${req.path} from ${req.ip}:`, error);
		return res.status(400)
			.json({ error: "Invalid JSON format" });
	}
}
