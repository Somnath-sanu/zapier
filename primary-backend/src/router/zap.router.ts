import { Router } from "express";
import { authMiddleware } from "../middleware";
import { ZapCreateSchema } from "../types";
import { prismaClient } from "../db";

const router = Router();

router.post("/", authMiddleware, async (req, res) => {
  //@ts-ignore

  const id = req.id;

  const body = req.body;
  const parsedData = ZapCreateSchema.safeParse(body);

  // console.log(parsedData.error?.message);

  if (!parsedData.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  try {
    const zapId = await prismaClient.$transaction(async (tx) => {
      const zap = await tx.zap.create({
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

      const trigger = await tx.trigger.create({
        data: {
          triggerId: parsedData.data.availableTriggerId,
          zapId: zap.id,
        },
      });

      await tx.zap.update({
        where: {
          id: zap.id,
        },
        data: {
          triggerId: trigger.id,
        },
      });

      return zap.id;
    });

    return res.json({
      zapId,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/", authMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.id;
  const zaps = await prismaClient.zap.findMany({
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
});

/**
 * Use include to fetch related models with all fields.
  Use select to pick specific fields, even within related models.
  You cannot use both include and select at the top level of a Prisma query.
 */

router.get("/:zapId", authMiddleware, async (req, res) => {
  //@ts-ignore
  const id = req.id;
  const zapId = req.params.zapId;
  const zap = await prismaClient.zap.findMany({
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
});

router.delete("/:zapId", authMiddleware, async (req, res) => {
  const id = req.params.zapId;

  try {
    const isZapExists = await prismaClient.zap.findFirst({
      where: {
        id,
      },
    });

    if (!isZapExists) {
      return res.status(404).json({ message: "Zap doesn't exist" });
    }

    await prismaClient.zap.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: "Zap deleted successfully" });
  } catch (error) {
    console.log("Error deleting zap :", error);
  }
});

export const zapRouter = router;
