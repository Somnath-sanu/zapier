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
exports.zapRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const types_1 = require("../types");
const db_1 = require("../db");
const router = (0, express_1.Router)();
router.post("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const body = req.body;
    const parsedData = types_1.ZapCreateSchema.safeParse(body);
    // console.log(parsedData.error?.message);
    if (!parsedData.success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        });
    }
    try {
        const zapId = yield db_1.prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const zap = yield tx.zap.create({
                data: {
                    userId: parseInt(id),
                    triggerId: "",
                    actions: {
                        create: parsedData.data.actions.map((x, index) => ({
                            actionId: x.availableActionId,
                            sortingOrder: index,
                            metadata: x.actionMetadata,
                        })),
                    },
                },
            });
            const trigger = yield tx.trigger.create({
                data: {
                    triggerId: parsedData.data.availableTriggerId,
                    zapId: zap.id,
                },
            });
            yield tx.zap.update({
                where: {
                    id: zap.id,
                },
                data: {
                    triggerId: trigger.id,
                },
            });
            return zap.id;
        }));
        return res.json({
            zapId,
        });
    }
    catch (error) {
        console.log(error);
    }
}));
router.get("/", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const zaps = yield db_1.prismaClient.zap.findMany({
        where: {
            userId: id,
        },
        select: {
            createdAt: true,
            id: true,
            actions: {
                include: {
                    type: true,
                },
            },
            trigger: {
                include: {
                    type: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return res.json({
        zaps,
    });
}));
/**
 * Use include to fetch related models with all fields.
  Use select to pick specific fields, even within related models.
  You cannot use both include and select at the top level of a Prisma query.
 */
router.get("/:zapId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const id = req.id;
    const zapId = req.params.zapId;
    const zap = yield db_1.prismaClient.zap.findMany({
        where: {
            id: zapId,
            userId: id,
        },
        include: {
            actions: {
                include: {
                    type: true,
                },
            },
            trigger: {
                include: {
                    type: true,
                },
            },
        },
    });
    return res.json({
        zap,
    });
}));
router.delete("/:zapId", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.zapId;
    try {
        const isZapExists = yield db_1.prismaClient.zap.findFirst({
            where: {
                id,
            },
        });
        if (!isZapExists) {
            return res.status(404).json({ message: "Zap doesn't exist" });
        }
        yield db_1.prismaClient.zap.delete({
            where: {
                id,
            },
        });
        return res.status(200).json({ message: "Zap deleted successfully" });
    }
    catch (error) {
        console.log("Error deleting zap :", error);
    }
}));
exports.zapRouter = router;
