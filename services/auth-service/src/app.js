import authRoutes from "./routes/auth.routes.js";
import { app } from "./server.js";

app.use("/auth" , authRoutes);