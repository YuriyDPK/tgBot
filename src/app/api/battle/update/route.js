import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request) {
  const { initiator, target, questionIndex, pointsIncrement } =
    await request.json();

  try {
    const battle = await prisma.battle.findFirst({
      where: {
        OR: [
          { initiator: { username: initiator }, target: { username: target } },
          { initiator: { username: target }, target: { username: initiator } },
        ],
        status: "active",
      },
      include: {
        initiator: true,
        target: true,
      },
    });

    if (!battle) {
      return new Response(JSON.stringify({ error: "Battle not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isInitiator = battle.initiator.username === initiator;

    if (isInitiator) {
      await prisma.battle.update({
        where: { id: battle.id },
        data: { initiatorPoints: { increment: pointsIncrement } },
      });
    } else {
      await prisma.battle.update({
        where: { id: battle.id },
        data: { targetPoints: { increment: pointsIncrement } },
      });
    }

    return new Response(JSON.stringify(battle), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating battle points:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
