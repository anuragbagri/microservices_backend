import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.listen("6100", () => {
  console.log("server listening on the port 6100");
});
