import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BooksView({ role }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [totalCopies, setTotalCopies] = useState(1);
  const [formError, setFormError] = useState('');

  const loadBooks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getBooks(search, selectedCategory);
      setBooks(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.createBook({
        title,
        author,
        isbn,
        category_id: categoryId,
        total_copies: Number(totalCopies),
      });
      setShowModal(false);
      setTitle('');
      setAuthor('');
      setIsbn('');
      setTotalCopies(1);
      loadBooks();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteBook = async (id, bookTitle) => {
    if (!window.confirm(`¿Dar de baja lógica el libro «${bookTitle}»?`)) return;
    try {
      await api.deleteBook(id);
      loadBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Catálogo de Libros</h2>
        {role === 'admin' && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Nuevo Libro
          </button>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por título o autor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Todas las Categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>ISBN</th>
              <th>Categoría</th>
              <th>Disponibles</th>
              <th>Total</th>
              {role === 'admin' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={role === 'admin' ? 7 : 6} style={{ textAlign: 'center', padding: '30px' }}>
                  Cargando catálogo...
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={role === 'admin' ? 7 : 6} style={{ textAlign: 'center', padding: '30px' }}>
                  No se encontraron libros activos.
                </td>
              </tr>
            ) : (
              books.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.title}</strong></td>
                  <td>{b.author}</td>
                  <td><code>{b.isbn}</code></td>
                  <td>{b.category?.name}</td>
                  <td>
                    <span style={{ color: b.available_copies > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                      {b.available_copies}
                    </span>
                  </td>
                  <td>{b.total_copies}</td>
                  {role === 'admin' && (
                    <td>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteBook(b.id, b.title)}
                      >
                        Baja
                      </button>
                    </td>
                  )}
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
              <h3>Registrar Nuevo Libro</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            {formError && <div className="alert-error">{formError}</div>}
            <form onSubmit={handleCreateBook}>
              <div className="form-group">
                <label>Título del Libro</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Cien años de soledad"
                />
              </div>
              <div className="form-group">
                <label>Autor</label>
                <input
                  required
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ej. Gabriel García Márquez"
                />
              </div>
              <div className="form-group">
                <label>ISBN (13 dígitos numéricos)</label>
                <input
                  required
                  type="text"
                  maxLength={13}
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="9780307474728"
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Total de Ejemplares</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Libro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
