import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Home from "./components/Home";
import Register from './components/Register';
import Feed from "./components/Feed";
import SongDetail from "./components/SongDetail";
import AuthGuard from "./components/AuthGuard";
import Profile from "./components/Profile";

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('role');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
        <Route
          path="/feed"
          element={
            <AuthGuard>
              <Feed />
            </AuthGuard>
          }
        />
        <Route
          path="/songs/:id"
          element={
            <AuthGuard>
              <SongDetail />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;