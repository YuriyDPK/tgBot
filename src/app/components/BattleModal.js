import React from "react";
const BattleModal = ({
  showBattleModal,
  onlineUsers,
  username,
  challengeUser,
  closeModal,
}) => {
  if (!showBattleModal) return null;

  return (
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
  );
};

export default BattleModal;
