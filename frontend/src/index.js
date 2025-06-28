// src/index.js
import React from "react";
import ReactDOM from "react-dom/client"; // ← important : ".client"
import App from "./App";
import "./index.css";
import './App.css'; // Doit être avant App.js
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
