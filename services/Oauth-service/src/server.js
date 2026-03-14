import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import oauthRoutes from "./routes/oauth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "oauth-service-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

app.use("/oauth", oauthRoutes);
app.use(errorHandler);

const port = 6102;
app.listen(port, () => {
  console.log(`OAuth service started on port ${port}`);
});
