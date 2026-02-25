/**
 * Agents Page
 * - Lists all agents in a table
 * - Add agent via modal form
 * - Edit / Delete agents
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import api from '../utils/api';
import styles from './AgentsPage.module.css';

// Country code options (common ones)
const COUNTRY_CODES = [
    { code: '+1', label: 'US/CA (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+91', label: 'IN (+91)' },
    { code: '+61', label: 'AU (+61)' },
    { code: '+971', label: 'UAE (+971)' },
    { code: '+49', label: 'DE (+49)' },
    { code: '+33', label: 'FR (+33)' },
    { code: '+81', label: 'JP (+81)' },
    { code: '+86', label: 'CN (+86)' },
    { code: '+65', label: 'SG (+65)' },
];

const EMPTY_FORM = { name: '', email: '', countryCode: '+91', mobileDigits: '', password: '' };

export default function AgentsPage() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editAgent, setEditAgent] = useState(null); // null = add mode
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // ---- Fetch agents ----
    const fetchAgents = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/agents');
            setAgents(res.data.agents);
        } catch (err) {
            toast.error('Failed to load agents');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAgents(); }, [fetchAgents]);

    // ---- Open modal ----
    const openAdd = () => {
        setEditAgent(null);
        setForm(EMPTY_FORM);
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (agent) => {
        setEditAgent(agent);
        // Split mobile into country code + digits for editing
        const known = COUNTRY_CODES.find(c => agent.mobile.startsWith(c.code));
        const cc = known ? known.code : '+91';
        const digits = agent.mobile.replace(cc, '').trim();
        setForm({ name: agent.name, email: agent.email, countryCode: cc, mobileDigits: digits, password: '' });
        setErrors({});
        setShowModal(true);
    };

    // ---- Form validation ----
    const validate = () => {
        const errs = {};
        const emailRegex = /^\S+@\S+\.\S+$/;
        const mobileRegex = /^\d{6,14}$/;

        if (!form.name.trim()) errs.name = 'Name is required';
        if (!form.email) errs.email = 'Email is required';
        else if (!emailRegex.test(form.email)) errs.email = 'Enter a valid email';
        if (!form.mobileDigits) errs.mobileDigits = 'Mobile number is required';
        else if (!mobileRegex.test(form.mobileDigits)) errs.mobileDigits = 'Enter 6-14 digit number';
        if (!editAgent && !form.password) errs.password = 'Password is required';
        else if (form.password && form.password.length < 6) errs.password = 'Min 6 characters';
        return errs;
    };

    // ---- Submit (add or edit) ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSaving(true);
        const payload = {
            name: form.name.trim(),
            email: form.email.trim(),
            mobile: `${form.countryCode}${form.mobileDigits}`,
            ...(form.password ? { password: form.password } : {}),
        };

        try {
            if (editAgent) {
                await api.put(`/agents/${editAgent._id}`, payload);
                toast.success('Agent updated successfully');
            } else {
                await api.post('/agents', payload);
                toast.success('Agent added successfully');
            }
            setShowModal(false);
            fetchAgents();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save agent';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    // ---- Delete ----
    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete agent "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/agents/${id}`);
            toast.success('Agent deleted');
            setAgents(prev => prev.filter(a => a._id !== id));
        } catch (err) {
            toast.error('Failed to delete agent');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    };

    return (
        <div>
            {/* Page Header */}
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>
                        <FiUsers style={{ verticalAlign: 'middle', marginRight: 10 }} />
                        Agents
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                        Manage your agent team
                    </p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    <FiPlus size={16} /> Add Agent
                </button>
            </div>

            {/* Agents Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div className={styles.loadingRow}>Loading agents...</div>
                ) : agents.length === 0 ? (
                    <div className="empty-state">
                        <FiUsers size={48} />
                        <h3>No Agents Yet</h3>
                        <p>Add your first agent to get started</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agents.map((agent, i) => (
                                    <tr key={agent._id}>
                                        <td>{i + 1}</td>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{agent.name}</td>
                                        <td>{agent.email}</td>
                                        <td><span className="badge badge-accent">{agent.mobile}</span></td>
                                        <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => openEdit(agent)}>
                                                    <FiEdit2 size={13} /> Edit
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(agent._id, agent.name)}>
                                                    <FiTrash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Agent Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editAgent ? 'Edit Agent' : 'Add New Agent'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    name="name" type="text"
                                    className={`form-control ${errors.name ? 'error' : ''}`}
                                    placeholder="Full name"
                                    value={form.name} onChange={handleChange}
                                />
                                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    name="email" type="email"
                                    className={`form-control ${errors.email ? 'error' : ''}`}
                                    placeholder="agent@example.com"
                                    value={form.email} onChange={handleChange}
                                />
                                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                            </div>

                            {/* Mobile: country code dropdown + number input */}
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <div className={styles.mobileRow}>
                                    <select
                                        name="countryCode"
                                        className={`form-control ${styles.codeSelect}`}
                                        value={form.countryCode} onChange={handleChange}
                                    >
                                        {COUNTRY_CODES.map(({ code, label }) => (
                                            <option key={code} value={code}>{label}</option>
                                        ))}
                                    </select>
                                    <input
                                        name="mobileDigits" type="tel"
                                        className={`form-control ${errors.mobileDigits ? 'error' : ''}`}
                                        placeholder="9876543210"
                                        value={form.mobileDigits} onChange={handleChange}
                                    />
                                </div>
                                {errors.mobileDigits && <span className={styles.fieldError}>{errors.mobileDigits}</span>}
                            </div>

                            <div className="form-group">
                                <label>{editAgent ? 'New Password (leave blank to keep)' : 'Password'}</label>
                                <input
                                    name="password" type="password"
                                    className={`form-control ${errors.password ? 'error' : ''}`}
                                    placeholder={editAgent ? 'Leave blank to keep current' : 'Min 6 characters'}
                                    value={form.password} onChange={handleChange}
                                />
                                {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                            </div>

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editAgent ? 'Save Changes' : 'Add Agent'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
