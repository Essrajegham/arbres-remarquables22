import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DashboardContent() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/protected/admin-only", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage(res.data.message);
      } catch (err) {
        setMessage("Erreur : " + (err.response?.data?.error || err.message));
      }
    };

    fetchData();
  }, []);

  return <div>{message}</div>;
}
