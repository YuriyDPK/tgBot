import { useEffect, useState } from "react";

const Battle = ({
  username,
  battleOpponent,
  questions,
  questionIndex,
  setQuestionIndex,
  handleAnswer,
  battleMessage,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    if (questions.length > 0) {
      setCurrentQuestion(questions[questionIndex]);
    }
  }, [questionIndex, questions]);

  if (!currentQuestion) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-2xl mb-4">Вопрос {questionIndex + 1}</h2>
        <p className="mb-4">{currentQuestion.question}</p>
        {["answerA", "answerB", "answerC", "answerD"].map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(currentQuestion[option])}
            className="block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition mb-2"
          >
            {currentQuestion[option]}
          </button>
        ))}
        <p>{battleMessage}</p>
      </div>
    </div>
  );
};

export default Battle;
