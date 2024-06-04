"use client";
import { useEffect, useState } from "react";

const RatingComponent = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch("/api/ranking");
        const data = await res.json();
        setRanking(data);
      } catch (error) {
        console.error("Error fetching ranking:", error);
      }
    };

    fetchRanking();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Рейтинг</h1>
      <ul>
        {ranking.map((user, index) => (
          <li key={index}>
            {user.username}: {user.clicks} войск
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RatingComponent;
