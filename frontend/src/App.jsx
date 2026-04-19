import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import DecisionDetails from './pages/DecisionDetails';
import Reputation from './pages/Reputation';
import AcceptInvite from './pages/AcceptInvite';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

function PlaceholderPage({ title }) {
  return (
    <AppLayout>
      <div className="p-8">
        <p className="text-xs tracking-widest uppercase text-[#76777d] font-medium mb-2">Coming Soon</p>
        <h1 className="font-display text-3xl font-bold text-[#0F172A]">{title}</h1>
      </div>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
        <Route path="/rooms/:id" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>} />
        <Route path="/decisions/:id" element={<ProtectedRoute><DecisionDetails /></ProtectedRoute>} />
        <Route path="/reputation" element={<ProtectedRoute><Reputation /></ProtectedRoute>} />
        <Route path="/voting" element={<ProtectedRoute><PlaceholderPage title="Voting Gallery" /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><PlaceholderPage title="Analytics" /></ProtectedRoute>} />
        <Route path="/guidelines" element={<ProtectedRoute><PlaceholderPage title="Guidelines" /></ProtectedRoute>} />
        <Route path="/archives" element={<ProtectedRoute><PlaceholderPage title="Archives" /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
