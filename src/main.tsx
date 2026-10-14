import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// @ts-ignore — Отключаем проверку TS для импорта SCSS, так как стили собирает Vite
import "./styles/index.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
