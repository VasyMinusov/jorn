import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import api from "./api";
import type { User } from "./types";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ShootingForm from "./pages/ShootingForm";
import styles from "./styles/App.module.css";
import ResultsPage from "./pages/ResultsPage";
import FinishInvite from "./pages/FinishInvite";

// Компонент мобильной навигации
function MobileNav({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isMobile) return null;

  const navItems = [
    { path: '/', icon: '🏠', label: 'Главная' },
    { path: '/shooting', icon: '🎯', label: 'Стрельба' },
    { path: '/results', icon: '📊', label: 'Результаты' },
  ];

  return (
    <nav className={styles.mobileNav}>
      {navItems.map(item => (
        <Link 
          to={item.path} 
          key={item.path}
          className={`${styles.mobileNavItem} ${location.pathname === item.path ? styles.active : ''}`}
        >
          <span className={styles.mobileNavIcon}>{item.icon}</span>
          <span className={styles.mobileNavLabel}>{item.label}</span>
        </Link>
      ))}
      <button 
        className={styles.mobileNavItem}
        onClick={onLogout}
        aria-label="Выйти"
      >
        <span className={styles.mobileNavIcon}>🚪</span>
        <span className={styles.mobileNavLabel}>Выйти</span>
      </button>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/auth/me")
       .then(r => setUser(r.data))
       .catch(() => {});
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!user)
    return (
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/finish-invite" element={<FinishInvite />} />
        <Route path="*"         element={<Navigate to="/login" />} />
      </Routes>
    );

  return (
    <div className={styles.appContainer}>
      {/* Верхняя навигация для десктопа */}
      {!isMobile && (
        <nav className={styles.desktopNav}>
          <Link to="/" className={styles.navLink}>Главная</Link>
          <Link to="/shooting" className={styles.navLink}>Добавить стрельбу</Link>
          <Link to="/results" className={styles.navLink}>Результаты</Link>
          <button className={styles.logoutBtn} onClick={logout}>Выйти</button>
        </nav>
      )}

      {/* Основной контент */}
      <main className={`${styles.mainContent} ${isMobile ? styles.withMobileNav : ''}`}>
        <Routes>
          <Route path="/" element={user.is_teacher ? <TeacherDashboard /> : <StudentDashboard />} />
          <Route path="/shooting" element={<ShootingForm />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </main>

      {/* Мобильная навигация */}
      <MobileNav onLogout={logout} />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}