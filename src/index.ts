import dotenv from "dotenv";
dotenv.config();

import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { cookieParser } from "@tinyhttp/cookie-parser";

import fs from "fs/promises";

import { handleIP } from "./middleware/ipHandler.js";
import { parseJSON } from "./middleware/jsonParser.js";
import { proxyFrontend } from "./middleware/frontendProxy.js";
import { backCacheControl, frontCacheControl } from "./middleware/cacheControl.js";
import { logSuspiciousRequests } from "./middleware/logging.js";

import router from "./router.js";

import { leaderboardService } from "./services/leaderboard.js";
import { discordBot } from "./discord/bot.js";

const port = Number(process.env["BACKEND_PORT"]) || 3000;
const isDev = process.env["NODE_ENV"] !== "production";
const noMatchPage = await fs.readFile("./frontend/404.html", "utf8");

const app = new App({
	settings: {
		networkExtensions: true
	},

	noMatchHandler: async (_req, res) => {
		return res.status(404)
			.set("Content-Type", "text/html")
			.send(noMatchPage);
	}
});

app.use(handleIP);

app.use(cors());
app.use(cookieParser());

app.use(backCacheControl);

app.use(parseJSON);

app.use(logSuspiciousRequests);

// Strip /api prefix from paths for frontend2
app.use((req, _res, next) => {
	if (req.path.startsWith("/api"))
		req.url = req.url.slice(4);

	return next?.();
});

app.use(router);

app.use(proxyFrontend);

app.use(frontCacheControl(isDev));

app.listen(port, async () => {
	console.log(`Server running on port ${port}`);
	leaderboardService.initializeWarmupScheduler(isDev);
});

async function shutdown() {
	await discordBot.stop();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
