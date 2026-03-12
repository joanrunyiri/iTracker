import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import issuesRouter from "./routes/issues";

const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/issues", issuesRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`[server]: API running on port ${port}`);
});
