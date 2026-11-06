import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function OverdueView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOverdue = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getOverdue();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverdue();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Libros Vencidos</h2>
        <button className="btn-secondary" onClick={loadOverdue}>
          ↻ Actualizar
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Libro</th>
              <th>Socio en Mora</th>
              <th>Fecha Límite</th>
              <th>Días de Retraso</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '30px' }}>
                  Consultando libros vencidos...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'var(--success)' }}>
                  ✓ No hay libros en mora. Todos los préstamos están al día.
                </td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.item_id}>
                  <td><strong>{it.book_title}</strong></td>
                  <td>{it.member_name}</td>
                  <td>{new Date(it.due_at).toLocaleDateString()}</td>
                  <td>
                    <span className="status-badge overdue">
                      {it.days_late} días de mora
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
