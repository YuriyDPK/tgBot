import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { username } = await request.json(); // Получаем данные из тела запроса

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 409, // Conflict
        headers: { "Content-Type": "application/json" },
      });
    }

    // Создание нового пользователя
    const user = await prisma.user.create({
      data: { username, clicks: 0 }, // Устанавливаем начальное значение кликов в 0
    });

    return new Response(JSON.stringify(user), {
      status: 201, // Created
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
