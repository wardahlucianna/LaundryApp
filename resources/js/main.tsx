import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

document.documentElement.setAttribute("data-coreui-theme", "light");

const root = document.getElementById("root");

if (root) {
    createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
