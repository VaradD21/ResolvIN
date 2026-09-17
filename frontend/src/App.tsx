import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { TicketsListPage } from './pages/TicketsListPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { EscalationsPage } from './pages/EscalationsPage';
import { NewTicketPage } from './pages/NewTicketPage';
import { useEscalations } from './hooks/useEscalations';

const AppLayout: React.FC = () => {
  const { unresolvedCount } = useEscalations();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Navbar unresolvedEscalationsCount={unresolvedCount} />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<TicketsListPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/escalations" element={<EscalationsPage />} />
          <Route path="/tickets/new" element={<NewTicketPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        ResolveDesk Autonomous D2C Support &bull; Dual Web &amp; Desktop (Tauri) Bundle
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
};

export default App;
