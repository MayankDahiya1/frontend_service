/*
 * IMPORTS
 */
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import _Client from "./lib/apollo.js";
import App from "./App.jsx";
import CursorFollow from "./components/CursorFollow.jsx";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store";

/*
 * RENDERING
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ApolloProvider client={_Client}>
      <Provider store={store}>
        <App />
        <CursorFollow />
      </Provider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: "futuristic-toast",
          style: {
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            color: "#ffffff",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            fontSize: "14px",
            fontWeight: "500",
            padding: "12px 16px",
            animation: "toast-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          },
          success: {
            style: {
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#ffffff",
              boxShadow:
                "0 8px 32px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ffffff",
            },
          },
          error: {
            style: {
              background:
                "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#ffffff",
              boxShadow:
                "0 8px 32px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
          loading: {
            style: {
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#ffffff",
              boxShadow:
                "0 8px 32px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            },
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#ffffff",
            },
          },
        }}
      />
    </ApolloProvider>
  </StrictMode>
);
