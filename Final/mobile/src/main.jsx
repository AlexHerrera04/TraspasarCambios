import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename="/mobile">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Registrar el Service Workers
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/mobile/service-worker.js", { scope: "/mobile/" })
      .then(() => console.log("Service Worker registrat"))
      .catch(err => console.log("Error registrant SW:", err));
  });
}

