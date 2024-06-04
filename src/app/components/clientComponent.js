"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const ClientComponent = ({ initialClicks }) => {
  const [clicks, setClicks] = useState(initialClicks || 0);
  const [username, setUsername] = useState("");
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [battleOpponent, setBattleOpponent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [battleActive, setBattleActive] = useState(false);
  const [battleMessage, setBattleMessage] = useState("");
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentConfirmed, setOpponentConfirmed] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlUsername = searchParams.get("username") || "default_username";
    setUsername(urlUsername);

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/user/${urlUsername}`);
        if (res.status === 404) {
          console.log("User not found, creating user...");
          const createUserRes = await fetch(`/api/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: urlUsername }),
          });
          const newUser = await createUserRes.json();
          setClicks(newUser.clicks || 0);
        } else {
          const user = await res.json();
          setClicks(user?.clicks || 0);
        }
        // Устанавливаем пользователя онлайн
        await fetch(`/api/user/online/${urlUsername}`, {
          method: "PATCH",
        });
        fetchOnlineUsers();
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [searchParams]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (username) {
        try {
          const res = await fetch(`/api/battle/check?target=${username}`);
          const battle = await res.json();
          if (battle && battle.status === "pending") {
            setBattleOpponent(battle.initiator.username);
            setBattleActive(true);
            setWaitingForOpponent(false);
          } else if (battle && battle.status === "active") {
            setOpponentConfirmed(true);
            fetchQuestions();
            setBattleActive(true);
          }
        } catch (error) {
          console.error("Error checking for battle:", error);
        }
      }
    }, 1000); // Проверка каждую секунду

    return () => clearInterval(intervalId);
  }, [username]);

  const fetchOnlineUsers = async () => {
    try {
      const res = await fetch("/api/user/online-users");
      const users = await res.json();
      setOnlineUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error("Error fetching online users:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions");
      const questions = await res.json();
      setQuestions(questions);
      setCurrentQuestion(questions[0]);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleClick = async () => {
    if (username) {
      try {
        const res = await fetch(`/api/user/${username}`, {
          method: "PATCH",
        });
        const user = await res.json();
        setClicks(user.clicks);
      } catch (error) {
        console.error("Error updating clicks:", error);
      }
    } else {
      console.error("Username is not set");
    }
  };

  const setOffline = async () => {
    if (username) {
      try {
        const res = await fetch(`/api/user/offline/${username}`, {
          method: "PATCH",
        });
        if (res.status === 200) {
          setOnlineStatus(false);
          console.log("User is now offline");
        }
      } catch (error) {
        console.error("Error setting user offline:", error);
      }
    } else {
      console.error("Username is not set");
    }
  };

  const setOnline = async () => {
    if (username) {
      try {
        const res = await fetch(`/api/user/online/${username}`, {
          method: "PATCH",
        });
        if (res.status === 200) {
          setOnlineStatus(true);
          console.log("User is now online");
          fetchOnlineUsers();
        }
      } catch (error) {
        console.error("Error setting user online:", error);
      }
    } else {
      console.error("Username is not set");
    }
  };

  const startBattle = () => {
    setShowBattleModal(true);
  };

  const closeModal = () => {
    setShowBattleModal(false);
  };

  const challengeUser = async (challengedUser) => {
    setBattleOpponent(challengedUser);
    setWaitingForOpponent(true);
    setShowBattleModal(false);

    const res = await fetch(`/api/battle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initiator: username,
        target: challengedUser,
        status: "pending",
      }),
    });

    const battle = await res.json();
    if (battle.error) {
      console.error(battle.error);
      setWaitingForOpponent(false);
    } else {
      console.log("Battle request sent, waiting for opponent to confirm...");
    }
  };

  const confirmBattle = async () => {
    setOpponentConfirmed(true);
    fetchQuestions().then(() => {
      setCurrentQuestion(questions[0]);
      setBattleActive(true);
    });

    await fetch(`/api/battle/confirm`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initiator: battleOpponent,
        target: username,
        status: "active",
      }),
    });
  };

  const declineBattle = async () => {
    setBattleActive(false);
    await fetch(`/api/battle/decline`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initiator: battleOpponent,
        target: username,
        status: "declined",
      }),
    });
  };

  const handleAnswer = async (answer) => {
    if (!currentQuestion) return;

    const correctAnswer = currentQuestion.correct;
    if (answer === correctAnswer) {
      setBattleMessage(`Правильно! Вы победили в этом раунде.`);
      await fetch(`/api/battle/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          initiator: username,
          target: battleOpponent,
          winner: username,
        }),
      });
    } else {
      setBattleMessage(`Неправильно. Ваш противник победил в этом раунде.`);
      await fetch(`/api/battle/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          initiator: username,
          target: battleOpponent,
          winner: battleOpponent,
        }),
      });
    }

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(questionIndex + 1);
      setCurrentQuestion(questions[questionIndex + 1]);
    } else {
      setBattleActive(false);
      setBattleMessage("Битва завершена.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Нанять дружину</h1>
      <p className="text-2xl mb-4">
        Твоя дружина: <span id="click-count">{clicks}</span>
      </p>
      <button
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Нанять воина
      </button>
      <button
        onClick={setOffline}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition mt-4"
        disabled={!onlineStatus}
      >
        Стать offline
      </button>
      <button
        onClick={setOnline}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition mt-4"
        disabled={onlineStatus}
      >
        Стать online
      </button>
      {onlineStatus && (
        <button
          onClick={startBattle}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-700 transition mt-4"
        >
          Начать битву
        </button>
      )}

      {showBattleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl mb-4">Выберите противника</h2>
            <ul>
              {onlineUsers.length > 0 ? (
                onlineUsers.map(
                  (user) =>
                    user.username !== username && (
                      <li key={user.username} className="mb-2">
                        {user.username}
                        <button
                          onClick={() => challengeUser(user.username)}
                          className="bg-blue-500 text-white px-2 py-1 rounded ml-4 hover:bg-blue-700 transition"
                        >
                          Вызвать на дуэль
                        </button>
                      </li>
                    )
                )
              ) : (
                <li>Нет онлайн пользователей</li>
              )}
            </ul>
            <button
              onClick={closeModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition mt-4"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {waitingForOpponent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl mb-4">
              Ожидание подтверждения от {battleOpponent}
            </h2>
            <button
              onClick={() => setWaitingForOpponent(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700 transition mt-4"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {battleActive && !opponentConfirmed && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl mb-4">Вызов от {battleOpponent}</h2>
            <button
              onClick={confirmBattle}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition mt-4"
            >
              Принять вызов
            </button>
            <button
              onClick={declineBattle}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition mt-4"
            >
              Отклонить вызов
            </button>
          </div>
        </div>
      )}

      {battleActive && opponentConfirmed && questions.length > 0 && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl mb-4">Вопрос {questionIndex + 1}</h2>
            {currentQuestion && (
              <>
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
              </>
            )}
            <p>{battleMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientComponent;
