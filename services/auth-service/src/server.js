import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use(errorHandler);

const port = Number(process.env.PORT) || 6101;
app.listen(port, () => {
  console.log(`Auth service started on port ${port}`);
});
