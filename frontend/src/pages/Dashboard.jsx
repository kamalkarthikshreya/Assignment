import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiUploadCloud, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import styles from './Dashboard.module.css';

const NAV_ITEMS = [
    { to: 'agents', label: 'Agents', icon: FiUsers },
    { to: 'upload', label: 'Upload Lists', icon: FiUploadCloud },
];

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.info('Logged out successfully');
        navigate('/login');
    };

    return (
        <div className={styles.layout}>
            {sidebarOpen && (
                <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.brand}>
                    <div className={styles.brandIcon}>
                        <svg viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#dg1)" />
                            <path d="M10 22L16 10L22 22M13 18h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="dg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6C63FF" /><stop offset="1" stopColor="#00D4AA" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className={styles.brandName}>Admin</span>
                </div>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <div className={styles.userName}>{user?.name}</div>
                            <div className={styles.userRole}>Administrator</div>
                        </div>
                    </div>
                    <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
                        <FiLogOut size={18} />
                    </button>
                </div>
            </aside>

            <div className={styles.main}>
                <header className={styles.topbar}>
                    <button
                        className={styles.menuBtn}
                        onClick={() => setSidebarOpen(o => !o)}
                        aria-label="Toggle menu"
                    >
                        {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                    <div className={styles.topbarRight}>
                        <span className={styles.topbarUser}>👋 {user?.name}</span>
                    </div>
                </header>

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
