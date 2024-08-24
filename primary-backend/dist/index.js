"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zap_router_1 = require("./router/zap.router");
const user_router_1 = require("./router/user.router");
const cors_1 = __importDefault(require("cors"));
const trigger_router_1 = require("./router/trigger.router");
const action_router_1 = require("./router/action.router");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1/user", user_router_1.userRouter);
app.use("/api/v1/zap", zap_router_1.zapRouter);
app.use("/api/v1/trigger", trigger_router_1.triggerRouter);
app.use("/api/v1/action", action_router_1.actionRouter);
app.listen(3001, () => {
    console.log("Server is running on port:3001");
});
