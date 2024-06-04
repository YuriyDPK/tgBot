import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request) {
  const { initiator, target, winner } = await request.json();

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

    const winnerUser = winner === initiator ? initiatorUser : targetUser;

    await prisma.battle.updateMany({
      where: {
        initiatorId: initiatorUser.id,
        targetId: targetUser.id,
        status: "active",
      },
      data: {
        winnerId: winnerUser.id,
        status: "completed",
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating battle:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
