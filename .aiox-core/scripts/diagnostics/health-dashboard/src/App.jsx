import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DomainDetail from './pages/DomainDetail';
import Header from './components/shared/Header';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/domain/:domainId" element={<DomainDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
