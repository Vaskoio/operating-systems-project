import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import SwipePage from "./pages/Swipe";
import MatchesPage from "./pages/Matches";
import ChatPage from "./pages/Chat";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import AdminPage from "./pages/Admin";
import Layout from "./components/Layout";
import Toast from "./components/Toast";

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: "center" }} className="muted">Зареждане...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/app/swipe" replace />; 
  return children;
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: "center" }} className="muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app/swipe" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
            <Route path="/admin" element={<AdminOnly><AdminPage /></AdminOnly>} />
            <Route path="/app" element={<Protected><Layout /></Protected>}>
              <Route index element={<Navigate to="swipe" replace />} />
              <Route path="swipe" element={<SwipePage />} />
              <Route path="matches" element={<MatchesPage />} />
              <Route path="chat/:matchId" element={<ChatPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toast />
        </BrowserRouter>
      </AuthProvider>
  );
}
