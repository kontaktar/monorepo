import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./app";
import "./index.css";

// Get your API key from environment variables
const PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_ADMIN_KEY || "";

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const el = document.getElementById("root");
if (el) {
  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>,
  );
} else {
  throw new Error("Could not find root element");
}
