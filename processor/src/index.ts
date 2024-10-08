import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const TOPIC_NAME = "zap-events"; //queue create of this name
const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outbox-processor",
  brokers: ["localhost:9092"],
});

async function main() {
  const producer = kafka.producer();
  await producer.connect();
  while (1) {
    const pendingRows = await client.zapRunOutbox.findMany({
      where: {},
      take: 10,
    });
    //send messages in bulk

    console.log(pendingRows);

    producer.send({
      topic: TOPIC_NAME,
      messages: pendingRows.map((r) => ({
        value: JSON.stringify({ zapRunId: r.zapRunId, stage: 0 }),
      })),
    });

    await client.zapRunOutbox.deleteMany({
      where: {
        id: {
          in: pendingRows.map((x) => x.id),
        },
      },
    });

    await new Promise((res) => setTimeout(res, 3000));
  }
}

main();

//since we are not using monorepo , we have to rewite the same code

/**
 * The in keyword is used to specify that the id of the rows to be deleted must match any of the values in the array generated by pendingRows.map(x => x.id).
 * Essentially, it tells Prisma to delete all records where the id field matches any of the IDs in the provided list.
 *
 * ?pendingRows.map(x => x.id)
 * This code generates an array of IDs from the pendingRows array. Each element in pendingRows is an object, and x.id extracts the id property from each object.
 * For example, if pendingRows is [{ id: 1 }, { id: 2 }, { id: 3 }], then pendingRows.map(x => x.id) will result in [1, 2, 3].
 * ?id: { in: ... }:
 * This part of the query specifies that the id of the rows to be deleted should be one of the values in the array [1, 2, 3].
 *
 * * The in keyword is used to match multiple values, making it possible to delete (or filter) rows based on whether their id is in a specified list. This is a common operation when you need to perform batch deletions or updates based on a list of identifiers.
 */
