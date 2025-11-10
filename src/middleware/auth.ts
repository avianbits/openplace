import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.js";
import { prisma } from "../config/database.js";
import { NextFunction, Response } from "@tinyhttp/app";
import { AuthenticatedRequest, UserRole } from "../types/index.js";
import { AuthToken } from "../services/auth.js";

async function validateAuth(req: AuthenticatedRequest): Promise<boolean> {
	const token = req.cookies?.j;
	if (!token) return false;

	const decoded = jwt.verify(token, JWT_SECRET!) as AuthToken;

	if (!decoded.userId || !decoded.sessionId) return false;

	if (decoded.exp && Date.now() >= decoded.exp * 1000) return false;

	const session = await prisma.session.findUnique({
		where: { id: decoded.sessionId }
	});

	if (!session || session.userId !== decoded.userId || session.expiresAt < new Date()) return false;

	req.user = {
		id: decoded.userId,
		sessionId: decoded.sessionId
	};

	return true;
}

export async function optionalAuthMiddleware(req: AuthenticatedRequest, _res: Response, next?: NextFunction) {
	try {
		await validateAuth(req);
	} catch {
		// Ignore
	}
	return next?.();
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next?: NextFunction) {
	try {
		if (!await validateAuth(req)) {
			return res.status(401)
				.json({ error: "Unauthorized", status: 401 });
		}
		return next?.();
	} catch {
		return res.status(401)
			.json({ error: "Unauthorized", status: 401 });
	}
}

export async function adminMiddleware(req: AuthenticatedRequest, res: Response, next?: NextFunction) {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user!.id }
		});
		if (!user || user.role !== UserRole.Admin) {
			return res.status(403)
				.json({ error: "Forbidden", status: 403 });
		}
		return next?.();
	} catch (error) {
		console.error("Error fetching user:", error);
		return res.status(500)
			.json({ error: "Internal Server Error", status: 500 });
	}
};
