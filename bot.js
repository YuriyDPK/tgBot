const { Telegraf } = require("telegraf");

const BOT_TOKEN = "5971440391:AAH4FO__eJi54bM2JYJLKzMJnO3dVQQbSuk"; // Замените на ваш токен

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("Добро пожаловать, князь!", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Инфо", callback_data: "info" },
          { text: "Открыть игру", callback_data: "start_game" },
        ],
      ],
    },
  });
});

bot.action("info", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply("Это игра-кликер. Нажимайте на кнопку, чтобы набрать очки!");
});

bot.action("start_game", (ctx) => {
  ctx.answerCbQuery();
  const username = ctx.from.username;
  ctx.reply("Запускаем игру!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Открыть игру",
            web_app: {
              url: `https://0bc4-2-63-250-130.ngrok-free.app?username=${username}`, // Замените на ваш домен
            },
          },
        ],
      ],
    },
  });
});

bot
  .launch()
  .then(() => {
    console.log("Bot is running");
  })
  .catch((error) => {
    console.error("Failed to launch bot:", error);
  });
