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
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </ApolloProvider>
  </StrictMode>
);
