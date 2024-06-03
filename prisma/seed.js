const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");

const main = async () => {
  const questions = JSON.parse(fs.readFileSync("questions.json", "utf8"));

  for (const question of questions) {
    await prisma.question.create({
      data: {
        question: question.question,
        answerA: question.answerA,
        answerB: question.answerB,
        answerC: question.answerC,
        answerD: question.answerD,
        correct: question.correct,
      },
    });
  }

  console.log("Questions seeded successfully.");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
