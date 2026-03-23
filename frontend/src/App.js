import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Home from "./components/Home"
import Register from './components/Register'; //todo standardize component and page locations 
import Feed from "./components/Feed";
import SongDetail from "./components/SongDetail";
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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

