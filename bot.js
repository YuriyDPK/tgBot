const { Telegraf } = require("telegraf");

const BOT_TOKEN = "5971440391:AAH4FO__eJi54bM2JYJLKzMJnO3dVQQbSuk"; // Замените на ваш токен
const bot = new Telegraf(BOT_TOKEN);

bot.command("start", (ctx) => {
  const username = ctx.from.username;
  ctx.reply("Добро пожаловать, князь!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть игру",
            web_app: {
              url: `https://e630-2-63-250-130.ngrok-free.app?username=${username}`,
            },
          },
        ],
      ],
    },
  });
});

bot.launch().then(() => {
  console.log("Bot is running");
});
