"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import UserStatus from "./UserStatus";
import BattleModal from "./BattleModal";
import Battle from "./Battle";

const MainGame = ({ initialClicks, initialRep }) => {
  const [clicks, setClicks] = useState(initialClicks || 0);
  const [rep, setRep] = useState(initialRep || 0);
  const [username, setUsername] = useState("");
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [battleOpponent, setBattleOpponent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [battleMessage, setBattleMessage] = useState("");
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentConfirmed, setOpponentConfirmed] = useState(false);
  const [battleActive, setBattleActive] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const searchParams = useSearchParams();
  const [battleId, setBattleId] = useState(null);

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

  useEffect(() => {
    const checkBattleStatus = async () => {
      if (battleId && waitingForOpponent) {
        try {
          const res = await fetch(`/api/battle/${battleId}`);
          const battle = await res.json();
          if (battle.status === "active") {
            setOpponentConfirmed(true);
            fetchQuestions();
            setBattleActive(true);
            setWaitingForOpponent(false); // Останавливаем проверку
          }
        } catch (error) {
          console.error("Error checking battle status:", error);
        }
      }
    };

    const intervalId = setInterval(checkBattleStatus, 1000);

    return () => clearInterval(intervalId);
  }, [battleId, waitingForOpponent]);

  const fetchOnlineUsers = async () => {
    try {
      const res = await fetch("/api/user/online-users");
      const users = await res.json();
      setOnlineUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error("Error fetching online users:", error);
    }
  };
  useEffect(() => {
    fetchOnlineUsers();
    // Установка интервала для периодической проверки новых данных
    const interval = setInterval(() => {
      fetchOnlineUsers();
    }, 5000); // Проверка каждые 5 секунд
    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/questions");
      const questions = await res.json();
      setQuestions(questions);
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
      setBattleId(battle.id); // Сохраняем идентификатор битвы
    }
  };

  const confirmBattle = async () => {
    setOpponentConfirmed(true);
    fetchQuestions().then(() => {
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

    await fetch(`/api/battle/confirm`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initiator: username,
        target: battleOpponent,
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
    const correctAnswer = questions[questionIndex].correct;
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
    } else {
      setBattleActive(false);
      setBattleMessage("Битва завершена.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-[1em] font-bold mb-4">Репутация</h1>
      <p className="text-2xl mb-4">
        <span id="click-count">{rep}</span>
      </p>
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
      <UserStatus
        username={username}
        onlineStatus={onlineStatus}
        setOffline={setOffline}
        setOnline={setOnline}
        startBattle={startBattle}
      />
      <BattleModal
        showBattleModal={showBattleModal}
        onlineUsers={onlineUsers}
        username={username}
        challengeUser={challengeUser}
        closeModal={closeModal}
      />
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
        <Battle
          username={username}
          battleOpponent={battleOpponent}
          questions={questions}
          questionIndex={questionIndex}
          setQuestionIndex={setQuestionIndex}
          handleAnswer={handleAnswer}
          battleMessage={battleMessage}
        />
      )}
    </div>
  );
};

export default MainGame;
