import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from './components/Register'; //todo standardize component and page locations 
import Feed from "./pages/Feed";
import SongDetail from "./pages/SongDetail";
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
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

