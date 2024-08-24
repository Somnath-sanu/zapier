import express from "express";
import { zapRouter } from "./router/zap.router";
import { userRouter } from "./router/user.router";
import cors from "cors"
import { triggerRouter } from "./router/trigger.router";
import { actionRouter } from "./router/action.router";

const app = express();
app.use(express.json());
app.use(cors())

app.use("/api/v1/user", userRouter);

app.use("/api/v1/zap", zapRouter);

app.use("/api/v1/trigger", triggerRouter);

app.use("/api/v1/action", actionRouter);

app.listen(3001, () => {
  console.log("Server is running on port:3001");
});
