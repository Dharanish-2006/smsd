import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/geist";
import App from "./App";
import "./index.css";
import "./app.css";
import "./responsive.css";
ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <App />
    </BrowserRouter>
  </React.StrictMode>);
