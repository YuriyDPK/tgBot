const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const next = require("next");

const prisma = new PrismaClient();
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
const httpServer = http.createServer(server);
const io = new Server(httpServer);

let onlineUsers = [];

io.on("connection", (socket) => {
  socket.on("userOnline", async (username) => {
    onlineUsers.push({ username, socketId: socket.id });
    io.emit("updateOnlineUsers", onlineUsers);

    try {
      await prisma.user.update({
        where: { username },
        data: { online: true },
      });
      console.log(`User ${username} set to online`);
    } catch (error) {
      console.error(`Error setting user ${username} online: `, error);
    }
  });

  socket.on("disconnect", async () => {
    const user = onlineUsers.find((user) => user.socketId === socket.id);
    if (user) {
      try {
        await prisma.user.update({
          where: { username: user.username },
          data: { online: false },
        });
        console.log(`User ${user.username} set to offline`);
      } catch (error) {
        console.error(`Error setting user ${user.username} offline: `, error);
      }

      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      io.emit("updateOnlineUsers", onlineUsers);
    }
  });

  socket.on("startWar", async (data) => {
    const targetUser = onlineUsers.find(
      (user) => user.username === data.target
    );
    if (targetUser) {
      const questions = await prisma.question.findMany({
        take: 10,
        orderBy: { id: "asc" },
      });
      io.to(targetUser.socketId).emit("warRequest", {
        initiator: data.initiator,
        questions,
      });
    }
  });

  socket.on("warResponse", (data) => {
    const opponent = onlineUsers.find(
      (user) => user.username === data.opponent
    );
    if (opponent && data.accept) {
      io.to(opponent.socketId).emit("warStart", { questions: data.questions });
      io.to(data.socketId).emit("warStart", { questions: data.questions });
    }
  });

  socket.on("correctAnswer", async (data) => {
    const targetUser = onlineUsers.find(
      (user) => user.username === data.opponent
    );
    if (targetUser) {
      io.to(targetUser.socketId).emit("loseTroops", { percentage: 5 });
      await prisma.user.update({
        where: { username: data.opponent },
        data: { clicks: { decrement: Math.ceil(data.clicks * 0.05) } },
      });
    }
  });
});

app.prepare().then(() => {
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(3002, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3002");
  });
});
