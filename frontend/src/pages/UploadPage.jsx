import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiUploadCloud, FiFile, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../utils/api';
import styles from './UploadPage.module.css';

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

export default function UploadPage() {
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [lists, setLists] = useState([]);
    const [expanded, setExpanded] = useState({});
    const fileRef = useRef(null);

    useEffect(() => { fetchLists(); }, []);

    const fetchLists = async () => {
        try {
            const res = await api.get('/lists');
            setLists(res.data.lists);
        } catch { }
    };

    const handleFileSelect = (selected) => {
        if (!selected) return;
        const ext = '.' + selected.name.split('.').pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            toast.error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
            return;
        }
        setFile(selected);
        setResult(null);
    };

    const handleInputChange = (e) => handleFileSelect(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault(); setDragOver(false);
        handleFileSelect(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!file) { toast.warning('Please select a file first'); return; }
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(res.data);
            toast.success(res.data.message);
            setFile(null);
            if (fileRef.current) fileRef.current.value = '';
            fetchLists();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    const grouped = lists.reduce((acc, item) => {
        const agentId = item.agent?._id;
        if (!agentId) return acc;
        if (!acc[agentId]) acc[agentId] = { agent: item.agent, batches: [] };
        acc[agentId].batches.push(item);
        return acc;
    }, {});

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h2 className={styles.title}>
                        <FiUploadCloud style={{ verticalAlign: 'middle', marginRight: 10 }} />
                        Upload & Distribute Lists
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                        Upload CSV/XLSX files to distribute tasks equally among agents
                    </p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 32 }}>
                <div
                    className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''} ${file ? styles.dropzoneHasFile : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                >
                    <input
                        ref={fileRef} type="file" accept=".csv,.xlsx,.xls"
                        onChange={handleInputChange} style={{ display: 'none' }}
                    />
                    {file ? (
                        <div className={styles.fileSelected}>
                            <FiFile size={32} color="var(--primary)" />
                            <div>
                                <div className={styles.fileName}>{file.name}</div>
                                <div className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
                            </div>
                            <button className={styles.removeFile} onClick={(e) => {
                                e.stopPropagation(); setFile(null);
                                if (fileRef.current) fileRef.current.value = '';
                            }}>
                                <FiX size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <FiUploadCloud size={40} color="var(--primary)" />
                            <h3 className={styles.dropzoneTitle}>Drop your file here</h3>
                            <p className={styles.dropzoneSubtitle}>or click to browse</p>
                            <div className={styles.allowedTypes}>
                                {ALLOWED_EXTENSIONS.map(ext => (
                                    <span key={ext} className="badge badge-primary">{ext}</span>
                                ))}
                            </div>
                            <p className={styles.csvFormat}>
                                Required columns: <code>FirstName</code>, <code>Phone</code>, <code>Notes</code>
                            </p>
                        </>
                    )}
                </div>

                <button
                    className="btn btn-primary" style={{ marginTop: 20, minWidth: 160 }}
                    onClick={handleUpload} disabled={!file || uploading}
                >
                    <FiUploadCloud size={16} />
                    {uploading ? 'Distributing...' : 'Upload & Distribute'}
                </button>
            </div>

            {result && (
                <div className="card" style={{ marginBottom: 32, borderColor: 'rgba(108,99,255,0.3)' }}>
                    <div className={styles.resultHeader}>
                        <div>
                            <h3 style={{ color: 'var(--primary-light)' }}>Distribution Result</h3>
                            <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
                                {result.totalItems} items distributed across {result.agentCount} agents
                            </p>
                        </div>
                        <span className="badge badge-success">✓ Success</span>
                    </div>
                    <div className={styles.resultGrid}>
                        {result.distribution.map(({ agent, itemCount, items }) => (
                            <div key={agent.id} className={styles.agentBlock}>
                                <div className={styles.agentBlockHeader}>
                                    <div className={styles.agentAvatar}>{agent.name.charAt(0).toUpperCase()}</div>
                                    <div>
                                        <div className={styles.agentName}>{agent.name}</div>
                                        <div className={styles.agentEmail}>{agent.email}</div>
                                    </div>
                                    <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>
                                        {itemCount} items
                                    </span>
                                </div>
                                <div className="table-wrapper" style={{ marginTop: 12 }}>
                                    <table>
                                        <thead>
                                            <tr><th>First Name</th><th>Phone</th><th>Notes</th></tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item, j) => (
                                                <tr key={j}>
                                                    <td style={{ color: 'var(--text-primary)' }}>{item.firstName}</td>
                                                    <td>{item.phone}</td>
                                                    <td>{item.notes || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {Object.keys(grouped).length > 0 && (
                <div>
                    <h3 style={{ marginBottom: 16, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                        All Distributed Lists
                    </h3>
                    <div className={styles.agentAccordions}>
                        {Object.values(grouped).map(({ agent, batches }) => {
                            const totalItems = batches.reduce((s, b) => s + b.items.length, 0);
                            const isOpen = expanded[agent._id];
                            return (
                                <div key={agent._id} className={styles.accordion}>
                                    <button className={styles.accordionHeader} onClick={() => toggle(agent._id)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className={styles.agentAvatar}>{agent.name.charAt(0).toUpperCase()}</div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div className={styles.agentName}>{agent.name}</div>
                                                <div className={styles.agentEmail}>{agent.email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span className="badge badge-accent">{totalItems} total items</span>
                                            {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className={styles.accordionBody}>
                                            {batches.map((batch) => (
                                                <div key={batch._id} className={styles.batchSection}>
                                                    <div className={styles.batchLabel}>
                                                        Upload: {new Date(batch.createdAt).toLocaleString()}
                                                        <span className="badge badge-primary" style={{ marginLeft: 10 }}>
                                                            {batch.items.length} items
                                                        </span>
                                                    </div>
                                                    <div className="table-wrapper">
                                                        <table>
                                                            <thead>
                                                                <tr><th>#</th><th>First Name</th><th>Phone</th><th>Notes</th></tr>
                                                            </thead>
                                                            <tbody>
                                                                {batch.items.map((item, j) => (
                                                                    <tr key={j}>
                                                                        <td>{j + 1}</td>
                                                                        <td style={{ color: 'var(--text-primary)' }}>{item.firstName}</td>
                                                                        <td>{item.phone}</td>
                                                                        <td>{item.notes || '—'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
