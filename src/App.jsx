/*
 * IMPORTS
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Chat from "./pages/Chat.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CursorFollow from "./components/CursorFollow.jsx";

/*
 * EXPORTS
 */
export default function App() {
  return (
    <BrowserRouter>
      <CursorFollow />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
