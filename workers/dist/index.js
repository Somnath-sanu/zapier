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
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
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
        yield consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });
        yield consumer.run({
            autoCommit: false,
            //*default true -> means whenerver you run a consumer its autoCommit means said to kafkajs i am done , i acknowledged it , move on to the next offset
            eachMessage: ({ topic, partition, message }) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                console.log({
                    partition,
                    offset: message.offset,
                    value: (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString(),
                });
                yield new Promise((res) => setTimeout(res, 5000));
                // what if worker picked a message and dies(server crash) before processing that
                // who know how long will it take to send an email to someone
                // to fix that we need -> manual acknowledgement
                //offset -> id of an message (indexes like)
                console.log("Processing Done");
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
