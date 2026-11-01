import * as React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { SidePanel } from "./sidepanel/app";

import "./index.css";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="stay-key.theme"
      >
        <SidePanel />
        <Toaster />
      </ThemeProvider>
    </React.StrictMode>,
  );
}
