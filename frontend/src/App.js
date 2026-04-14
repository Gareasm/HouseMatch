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
import Leaderboard from "./components/Leaderboard";
import AdminDashboard from "./components/AdminDashboard";
import AdminGuard from "./components/AdminGuard";

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const isExpired = payload.exp * 1000 < Date.now();
          if (isExpired) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
          }
        }
        // non-JWT tokens (e.g. dev-bypass) are left alone
      } catch {
        // malformed JWT — leave it, don't wipe dev tokens
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
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
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