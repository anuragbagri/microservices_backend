import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import noteRoutes from "./routes/note.routes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(apiLimiter);

app.use("/", noteRoutes);
app.use(errorHandler);

const port = Number(process.env.PORT) || 6104;
app.listen(port, () => {
  console.log(`Notes service started on port ${port}`);
});
