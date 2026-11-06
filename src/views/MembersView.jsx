import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function MembersView() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [fullName, setFullName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [formError, setFormError] = useState('');

  const loadMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMembers(search);
      setMembers(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMembers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateMember = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.createMember({
        full_name: fullName,
        document_number: documentNumber,
      });
      setShowModal(false);
      setFullName('');
      setDocumentNumber('');
      loadMembers();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Directorio de Socios</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nuevo Socio
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre o número de documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Número de Documento</th>
              <th>ID del Socio</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '30px' }}>
                  Cargando socios...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '30px' }}>
                  No se encontraron socios registrados.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.full_name}</strong></td>
                  <td><code>{m.document_number}</code></td>
                  <td><small style={{ color: 'var(--text-muted)' }}>{m.id}</small></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Registrar Nuevo Socio</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            {formError && <div className="alert-error">{formError}</div>}
            <form onSubmit={handleCreateMember}>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div className="form-group">
                <label>Número de Documento</label>
                <input
                  required
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej. 1020304050"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
