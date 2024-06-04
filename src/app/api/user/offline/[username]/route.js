import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request) {
  const url = new URL(request.url);
  const username = url.pathname.split("/").pop();

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { username },
      data: { online: false },
    });

    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error setting user offline:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
