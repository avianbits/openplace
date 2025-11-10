import admin from "./routes/admin.js";
import alliance from "./routes/alliance.js";
import auth from "./routes/auth.js";
import discord from "./routes/discord.js";
import favoriteLocation from "./routes/favorite-location.js";
import leaderboard from "./routes/leaderboard.js";
import me from "./routes/me.js";
import moderator from "./routes/moderator.js";
import pixel from "./routes/pixel.js";
import reportUser from "./routes/report-user.js";
import store from "./routes/store.js";
import checkrobots from "./routes/checkrobots.js";

import { App } from "@tinyhttp/app";

const app = new App();

admin(app);
alliance(app);
auth(app);
discord(app);
favoriteLocation(app);
leaderboard(app);
me(app);
moderator(app);
pixel(app);
reportUser(app);
store(app);
checkrobots(app);

export default app;
