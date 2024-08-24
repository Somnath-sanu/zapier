import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(express.json());
const client = new PrismaClient();

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const userId = req.params.userId;
  const zapId = req.params.zapId;
  const body = req.body;

  //* store in db a new trigger
  await client.$transaction(async (tx) => {
    const run = await tx.zapRun.create({
      data: {
        zapId: zapId,
        metadata: body,
      },
    });

    await tx.zapRunOutbox.create({
      data: {
        zapRunId: run.id,
      },
    });
  });

  //* push it on to a queue (kafka/redis)

  res.json({
    message: "Webhook received"
  })
});

app.listen(3000, () => {
  console.log("Running at port 3000");
});
