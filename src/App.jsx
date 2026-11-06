import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import LoginView from './views/LoginView';
import BooksView from './views/BooksView';
import MembersView from './views/MembersView';
import LoansView from './views/LoansView';
import OverdueView from './views/OverdueView';
import ReportsView from './views/ReportsView';

export default function App() {
  const [token, setToken] = useState(api.getToken());
  const [role, setRole] = useState(api.getRole());
  const [activeTab, setActiveTab] = useState('books');

  const handleLoginSuccess = (userRole) => {
    setToken(api.getToken());
    setRole(userRole);
  };

  const handleLogout = () => {
    api.clearToken();
    setToken(null);
    setRole('');
  };

  if (!token) {
    return (
      <div className="app-container">
        <LoginView onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-area">
          <span>📚</span>
          <div>Manager<strong>Library</strong></div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Catálogo
          </button>
          <button
            className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Socios
          </button>
          <button
            className={`tab-btn ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            Préstamos
          </button>
          <button
            className={`tab-btn ${activeTab === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            Vencidos
          </button>
          {role === 'admin' && (
            <button
              className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Reportes
            </button>
          )}
        </nav>

        <div className="user-area">
          <span className="user-badge">{role}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>

      <main className="content">
        {activeTab === 'books' && <BooksView role={role} />}
        {activeTab === 'members' && <MembersView />}
        {activeTab === 'loans' && <LoansView />}
        {activeTab === 'overdue' && <OverdueView />}
        {activeTab === 'reports' && role === 'admin' && <ReportsView />}
      </main>
    </div>
  );
}
