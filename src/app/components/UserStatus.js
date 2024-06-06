import React from "react";
const UserStatus = ({
  username,
  onlineStatus,
  setOffline,
  setOnline,
  startBattle,
}) => {
  return (
    <div className="mt-1 flex flex-col">
      <p className="mt-2">Ваш статус: {onlineStatus ? "Online" : "Offline"}</p>
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
    </div>
  );
};

export default UserStatus;
