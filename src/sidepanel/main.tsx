import * as React from "react";
import { createRoot } from "react-dom/client";

import { SidePanel } from "./app";

import "./index.css";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <SidePanel />
    </React.StrictMode>,
  );
}
