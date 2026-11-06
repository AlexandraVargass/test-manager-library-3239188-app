import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function LoansView() {
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // New Loan Form
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBooks, setSelectedBooks] = useState(['']);
  const [formError, setFormError] = useState('');

  const loadLoans = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getLoans();
      setLoans(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const memData = await api.getMembers('', 1, 100);
      setMembers(memData.items || []);
      const bookData = await api.getBooks('', '', 1, 100);
      setAvailableBooks((bookData.items || []).filter((b) => b.available_copies > 0));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const openNewLoanModal = () => {
    setFormError('');
    setSelectedMember('');
    setSelectedBooks(['']);
    loadFormData();
    setShowModal(true);
  };

  const handleBookChange = (index, value) => {
    const updated = [...selectedBooks];
    updated[index] = value;
    setSelectedBooks(updated);
  };

  const addBookSlot = () => {
    if (selectedBooks.length < 3) {
      setSelectedBooks([...selectedBooks, '']);
    }
  };

  const removeBookSlot = (index) => {
    if (selectedBooks.length > 1) {
      setSelectedBooks(selectedBooks.filter((_, i) => i !== index));
    }
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanBooks = selectedBooks.filter((b) => b.trim() !== '');
    if (cleanBooks.length === 0) {
      setFormError('Debe seleccionar al menos un libro.');
      return;
    }

    try {
      const items = cleanBooks.map((bookId) => ({ book_id: bookId }));
      await api.createLoan(selectedMember, items);
      setShowModal(false);
      loadLoans();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleReturnItem = async (loanId, itemId, bookTitle) => {
    if (!window.confirm(`¿Confirmar devolución de «${bookTitle}»?`)) return;
    try {
      await api.returnLoanItem(loanId, itemId);
      loadLoans();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Gestión de Préstamos</h2>
        <button className="btn-primary" onClick={openNewLoanModal}>
          + Registrar Préstamo
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID Préstamo</th>
              <th>Fecha del Préstamo</th>
              <th>Estado</th>
              <th>Libros Prestados (Líneas)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '30px' }}>
                  Cargando préstamos...
                </td>
              </tr>
            ) : loans.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '30px' }}>
                  No hay préstamos registrados.
                </td>
              </tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan.id}>
                  <td><code>{loan.id.substring(0, 8)}...</code></td>
                  <td>{new Date(loan.loaned_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${loan.status}`}>
                      {loan.status === 'open' ? 'Abierto' : loan.status === 'closed' ? 'Cerrado' : 'Vencido'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {loan.items.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.2)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                          }}
                        >
                          <div>
                            <strong>{item.book_title}</strong> · <em>{item.category_name}</em>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Vence: {new Date(item.due_at).toLocaleDateString()}
                              {item.returned_at && ` · Devuelto: ${new Date(item.returned_at).toLocaleDateString()}`}
                            </div>
                          </div>
                          {!item.returned_at && (
                            <button
                              className="btn-success"
                              onClick={() => handleReturnItem(loan.id, item.id, item.book_title)}
                            >
                              Devolver
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
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
              <h3>Registrar Préstamo</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            {formError && <div className="alert-error">{formError}</div>}
            <form onSubmit={handleCreateLoan}>
              <div className="form-group">
                <label>Socio Solicitante</label>
                <select
                  required
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">Seleccione un socio</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.document_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Libros (De 1 a 3 ejemplares disponibles)</label>
                {selectedBooks.map((bookId, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <select
                      required
                      value={bookId}
                      onChange={(e) => handleBookChange(idx, e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="">Seleccione un libro</option>
                      {availableBooks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({b.available_copies} disp.)
                        </option>
                      ))}
                    </select>
                    {selectedBooks.length > 1 && (
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => removeBookSlot(idx)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {selectedBooks.length < 3 && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', marginTop: '6px' }}
                    onClick={addBookSlot}
                  >
                    + Añadir otro libro
                  </button>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Confirmar Préstamo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
