import React, { useState } from 'react';
import { api } from '../services/api';

export default function ReportsView() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.getMostBorrowedReport(from, to);
      setReportData(data);
    } catch (err) {
      setError(err.message);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Reporte: Libros Más Prestados</h2>
      </div>

      <div className="table-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <form onSubmit={handleGenerateReport} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Fecha Inicial (From)</label>
            <input
              required
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Fecha Final (To)</label>
            <input
              required
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
        </form>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {reportData && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Ranking</th>
                <th>Título del Libro (Congelado)</th>
                <th>Categoría (Congelada)</th>
                <th>Veces Prestado</th>
              </tr>
            </thead>
            <tbody>
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '30px' }}>
                    No se registraron préstamos en el rango de fechas seleccionado.
                  </td>
                </tr>
              ) : (
                reportData.rows.map((row, idx) => (
                  <tr key={row.book_id || idx}>
                    <td><strong>#{idx + 1}</strong></td>
                    <td>{row.book_title}</td>
                    <td><em>{row.category_name}</em></td>
                    <td>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {row.times_borrowed}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
