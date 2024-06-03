"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const ClientComponent = ({ initialClicks }) => {
  const [clicks, setClicks] = useState(initialClicks || 0);
  const [username, setUsername] = useState("");
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
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [searchParams]);

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
    </div>
  );
};

export default ClientComponent;
