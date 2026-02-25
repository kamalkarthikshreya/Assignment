import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import styles from './LoginPage.module.css';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validate = () => {
        const errs = {};
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!form.email) errs.email = 'Email is required';
        else if (!emailRegex.test(form.email)) errs.email = 'Enter a valid email address';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
        return errs;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (serverError) setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setLoading(true);
        setServerError('');
        try {
            const res = await api.post('/auth/login', form);
            login(res.data);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setServerError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.blob1} />
            <div className={styles.blob2} />

            <div className={styles.card}>
                <div className={styles.brand}>
                    <div className={styles.logo}>
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="8" fill="url(#g1)" />
                            <path d="M10 22L16 10L22 22M13 18h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="g1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#6C63FF" /><stop offset="1" stopColor="#00D4AA" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h1>Admin Portal</h1>
                    <p>Sign in to manage your workspace</p>
                </div>

                {serverError && <div className="error-msg">{serverError}</div>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email" type="email" name="email"
                            className={`form-control ${errors.email ? 'error' : ''}`}
                            placeholder="admin@example.com"
                            value={form.email} onChange={handleChange}
                            autoComplete="email"
                        />
                        {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password" type="password" name="password"
                            className={`form-control ${errors.password ? 'error' : ''}`}
                            placeholder="Enter your password"
                            value={form.password} onChange={handleChange}
                            autoComplete="current-password"
                        />
                        {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                    </div>

                    <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className={styles.hint}>
                    Default credentials: <code>admin@example.com</code> / <code>Admin@123</code>
                </p>
            </div>
        </div>
    );
}
