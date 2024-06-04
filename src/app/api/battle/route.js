import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  const { initiator, target, status } = await request.json();

  try {
    const initiatorUser = await prisma.user.findUnique({
      where: { username: initiator },
    });

    const targetUser = await prisma.user.findUnique({
      where: { username: target },
    });

    if (!initiatorUser || !targetUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const battle = await prisma.battle.create({
      data: {
        initiatorId: initiatorUser.id,
        targetId: targetUser.id,
        status: status,
      },
    });

    return new Response(JSON.stringify(battle), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating battle:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(request) {
  const { initiator, target, status } = await request.json();

  try {
    const battle = await prisma.battle.updateMany({
      where: {
        initiatorId: initiator,
        targetId: target,
        status: "pending",
      },
      data: {
        status: status,
      },
    });

    return new Response(JSON.stringify(battle), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating battle status:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
