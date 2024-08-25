"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const parser_1 = require("./parser");
const email_1 = require("./email");
const TOPIC_NAME = "zap-events";
const client = new client_1.PrismaClient();
const kafka = new kafkajs_1.Kafka({
    clientId: "outbox-processor",
    brokers: ["localhost:9092"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const consumer = kafka.consumer({ groupId: "main-worker" });
        yield consumer.connect();
        const producer = kafka.producer();
        yield producer.connect();
        yield consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });
        yield consumer.run({
            autoCommit: false,
            //*default true -> means whenerver you run a consumer its autoCommit means said to kafkajs i am done , i acknowledged it , move on to the next offset
            eachMessage: ({ topic, partition, message }) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                console.log({
                    topic,
                    partition,
                    offset: message.offset,
                    value: (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString(),
                });
                const parsedValue = JSON.parse((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString());
                const zapRunId = parsedValue.zapRunId;
                const stage = parsedValue.stage;
                //? no we need to find the zap associated with the zapRunId
                const zapRunDetails = yield client.zapRun.findFirst({
                    where: {
                        id: zapRunId,
                    },
                    include: {
                        zap: {
                            include: {
                                trigger: true,
                                actions: true,
                            },
                        },
                    },
                });
                const currentAction = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.find((x) => x.sortingOrder === stage);
                if (!currentAction) {
                    console.log("Current action not found?");
                    return;
                }
                const zapRunMetadata = zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.metadata;
                if (currentAction.actionId === "email") {
                    //* parse("my name is {comment.name} address is {comment.address}" , { comment: { name : "sanu" , address: "sanu@gmail.com"} })
                    // console.log("Sending out an email");
                    const body = (0, parser_1.parse)((_c = currentAction.metadata) === null || _c === void 0 ? void 0 : _c.body, zapRunMetadata);
                    const to = (0, parser_1.parse)((_d = currentAction.metadata) === null || _d === void 0 ? void 0 : _d.email, zapRunMetadata);
                    console.log(`Sending out email to ${to} body is ${body}`);
                    yield (0, email_1.sendEmail)(to, body);
                }
                if (currentAction.actionId === "sol") {
                    const amount = (0, parser_1.parse)((_e = currentAction.metadata) === null || _e === void 0 ? void 0 : _e.amount, zapRunMetadata);
                    const address = (0, parser_1.parse)((_f = currentAction.metadata) === null || _f === void 0 ? void 0 : _f.address, zapRunMetadata);
                    console.log(`Sending out SOL of ${amount} to address ${address}`);
                    // await sendSol(address, amount);
                }
                yield new Promise((res) => setTimeout(res, 5000));
                // what if worker picked a message and dies(server crash) before processing that
                // who know how long will it take to send an email to someone
                // to fix that we need -> manual acknowledgement
                //offset -> id of an message (indexes like)
                // console.log("Processing Done");
                const lastStage = ((zapRunDetails === null || zapRunDetails === void 0 ? void 0 : zapRunDetails.zap.actions.length) || 1) - 1;
                if (lastStage !== stage) {
                    yield producer.send({
                        topic: TOPIC_NAME,
                        messages: [
                            {
                                value: JSON.stringify({
                                    stage: stage + 1,
                                    zapRunId,
                                }),
                            },
                        ],
                    });
                }
                yield consumer.commitOffsets([
                    {
                        topic: TOPIC_NAME,
                        partition: partition,
                        offset: (parseInt(message.offset) + 1).toString(), // 5
                    },
                ]);
            }),
        });
    });
}
main().catch(console.error);
/**
 * kafka.consumer({ groupId: 'main-worker' }), is used to manage consumer groups, which are a fundamental feature of Kafka's scalability and fault tolerance mechanisms
 * ?Consumer Group Management:
 * A groupId uniquely identifies a consumer group. Multiple consumers that share the same groupId are considered part of the same consumer group.
 * Kafka distributes the partitions of a topic among all the consumers in a group, ensuring that each partition is consumed by only one consumer within that group.
 *
 * ?Load Balancing:
 * When consumers share the same groupId, Kafka automatically balances the load by assigning each partition of the topic to one consumer in the group.
 * If a new consumer joins the group, Kafka will rebalance the partitions so that the load is evenly distributed across the consumers.
 * Conversely, if a consumer leaves the group, Kafka reassigns its partitions to the remaining consumers, ensuring continuous data consumption.
 * ?Fault Tolerance:
 * If a consumer in the group fails, Kafka will detect the failure and redistribute the partitions that the failed consumer was handling to other consumers in the group.
 * This ensures that even if a consumer goes down, the system continues to process messages without interruption.
 *
 * *If you have a Kafka topic with 10 partitions and 5 consumers in a consumer group with groupId: 'main-worker', Kafka will assign 2 partitions to each consumer. If one consumer fails, Kafka will redistribute the partitions it was handling to the remaining 4 consumers.
 * *The groupId is crucial for managing how Kafka consumers work together to process messages from topics. It enables load balancing, fault tolerance, and consistent processing, making it a key part of building scalable and reliable Kafka-based systems.
 *
 *
 * ?what if we have 10 partitions and 5 consumers in a consumer group with different groupId: '
 * When consumers have different groupIds, they work independently, consuming the entire stream of data from all partitions. This can be useful in specific scenarios where independent processing is required, but it leads to duplicate processing and does not leverage Kafka's load balancing features.
 * 5 consumers, each with a unique groupId (e.g., groupId: 'worker1', groupId: 'worker2', etc.).
 * Consumer worker1 will read from all 10 partitions.
 * Consumer worker2 will also read from all 10 partitions.
 * And so on for the other consumers.
 * No Load Balancing Across Consumers:: Kafka will not distribute the partitions among the consumers because each consumer is seen as the only member of its group.Therefore, each consumer will handle all 10 partitions independently, which may lead to redundant work and inefficient resource use.
 */
/**
 * in kafka data remains forever ,  u picked a task from queue , process it and keep it again in the queue (u can replay it )
 * reson to use kafka over redis -> we have to perform asction sequentially ,
 * first send mail , then money , the output of fisrt action we need to process second action , we cant achive this with one one partition and multiple workers that will pick the message from kafka queue , like redis , so we didn't use redis , in kafka we can have multiple partitions , that process task for one consumer-id , sequentially,
 *
 */
/**
 * ?1. "In Kafka, data remains forever, you pick a task from the queue, process it, and keep it again in the queue (you can replay it)."
Explanation:

Kafka Retention: In Kafka, data doesn't necessarily remain forever by default, but it can be configured to do so depending on the topic's retention policy. Kafka topics can be configured with retention settings, which determine how long messages are kept before they are deleted.
Replaying Messages: Kafka allows consumers to "replay" messages by seeking to a specific offset or starting from the beginning of a partition. This is possible because Kafka stores messages persistently, and consumers can reprocess the data whenever needed.
Re-inserting Data: Your note suggests that after processing, the data is put back into the queue. While this is technically possible, it isn't a common pattern in Kafka because Kafka's strength lies in its ability to replay messages from its log. Typically, once processed, the message is not put back into Kafka, unless there’s a specific need for it.
Correction:

Kafka doesn't inherently "keep" data forever unless configured to do so with infinite retention. It's more about the ability to replay messages rather than re-inserting processed data back into the queue.

*?2. "Reason to use Kafka over Redis: we have to perform actions sequentially."
Explanation:
*Sequential Processing in Kafka: Kafka can be configured to ensure that messages are processed in order by using a single partition for a given consumer group. This ensures that only one consumer processes messages from that partition at any given time, thus maintaining order.
Redis Pub/Sub: Redis, while powerful for certain real-time messaging use cases, doesn’t inherently guarantee message ordering across different consumers. This can be a limitation if sequential processing is required.
Correctness:
This is accurate. Kafka is indeed better suited than Redis for use cases where message order and sequential processing are crucial.
*?3. "First send mail, then money, the output of first action we need to process second action, we can't achieve this with one partition and multiple workers that will pick the message from Kafka queue, like Redis, so we didn't use Redis. In Kafka, we can have multiple partitions that process tasks for one consumer-id, sequentially."
Explanation:
Kafka vs Redis:
Kafka: You can have multiple partitions in Kafka, but for sequential processing, you usually process messages within a single partition per consumer group. This ensures that the actions are performed in order (e.g., first send mail, then process money).
Redis: Redis Pub/Sub or Redis Streams don’t natively support sequential processing in the same way. Redis Streams can be configured to some extent for ordered processing, but Kafka's design makes it easier to manage such scenarios.
Correction:
The concept of "one partition" in Kafka means that only one consumer in a group processes messages from that partition, ensuring order. Multiple partitions would mean parallel processing, which might not be desirable if strict ordering is needed.
You don't need multiple partitions for sequential processing. Instead, you need to ensure that messages for the sequence (mail -> money) are processed within the same partition by the same consumer.
 */
