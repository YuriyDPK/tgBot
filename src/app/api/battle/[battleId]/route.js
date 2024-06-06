import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { battleId } = params;

  try {
    const battle = await prisma.battle.findUnique({
      where: { id: parseInt(battleId) },
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

    return new Response(JSON.stringify(battle), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching battle:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
