import { NextFunction, Request, Response } from "@tinyhttp/app";
import { ServerResponse } from "http";
import sirv from "sirv";

export function backCacheControl(_req: Request, res: Response, next?: NextFunction) {
	res.set("cache-control", "private, must-revalidate");
	next?.();
}

export function frontCacheControl(dev = false) {
	return sirv("./frontend", {
		setHeaders: (res: ServerResponse, _pathname, _stats) => {
			if (!dev)
				(res as Response).set("cache-control", `public, maxage=${5 * 60}, s-maxage=${5 * 60}, stale-while-revalidate=${5 * 60}, stale-if-error=${5 * 60}`);
		}
	});
}
