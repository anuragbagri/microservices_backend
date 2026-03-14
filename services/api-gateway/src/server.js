import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import router from "./routes/routes";
import { errorHandlerMiddleware } from "./middlewares/errorHandler";
import { globalLimiter } from "./middlewares/ratelimiter";

dotenv.config();
const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(globalLimiter);

app.use(router);
app.use(errorHandlerMiddleware);

const port = Number(process.env.PORT) ?? 6100;
app.listen(port, () => {
  console.log("api gateway running on the port 6100");
  console.log("auth service running on the port 6101");
  console.log("oauth service running on the port 6102");
  console.log("user service running on the port 6103");
});
