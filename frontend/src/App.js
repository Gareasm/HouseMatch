import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Feed from './pages/Feed';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/feed" element={
            <AuthGuard>
              <Feed />
            </AuthGuard>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;