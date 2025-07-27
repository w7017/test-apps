import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClientProvider } from './contexts/ClientContext';
import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import Audits from './pages/Audits';
import Deliverables from './pages/Deliverables';
import DataManagement from './pages/DataManagement';
import Settings from './pages/Settings';
import AIAssistant from './components/AIAssistant';
import Clients from './pages/Clients';
import AuditLivrable from './pages/AuditLivrable';
import PPA from './pages/PPA';
import GPA from './pages/GPA';
import OPLOPR from './pages/OPLOPR';
import PreparationEquipement from './pages/PreparationEquipement';
import PlanificationPrev from './pages/PlanificationPrev';
import LivrableGMAO from './pages/LivrableGMAO';

function AppContent() {
  const { isAuthenticated, login } = useAuth();
  const [showAssistant, setShowAssistant] = useState(false);
  const [showLogin, setShowLogin] = useState(!isAuthenticated);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    await login(credentials);
    setShowLogin(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
          />
        )}
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">GMAO Pro</h1>
            <p className="text-gray-600 mb-6">Maintenance Assistée par IA</p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/audits" element={<Audits />} />
          <Route path="/deliverables" element={<Deliverables />} />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/arborescence" element={<Sites />} />
          <Route path="/audits" element={<Audits />} />
          <Route path="/audit-livrable" element={<AuditLivrable />} />
          <Route path="/ppa" element={<PPA />} />
          <Route path="/gpa" element={<GPA />} />
          <Route path="/opl-opr" element={<OPLOPR />} />
          <Route path="/preparation-equipement" element={<PreparationEquipement />} />
          <Route path="/planification-prev" element={<PlanificationPrev />} />
          <Route path="/livrable-gmao" element={<LivrableGMAO />} />
        </Routes>
      </main>
      
      {/* Assistant IA persistant */}
      <button
        onClick={() => setShowAssistant(!showAssistant)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {showAssistant && (
        <AIAssistant onClose={() => setShowAssistant(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ClientProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ClientProvider>
    </AuthProvider>
  );
}

export default App;