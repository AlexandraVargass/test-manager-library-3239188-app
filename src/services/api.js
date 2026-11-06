const BASE_URL = '/api/v1';

export const api = {
  getToken: () => localStorage.getItem('access_token'),
  setToken: (token, role) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_role', role);
  },
  clearToken: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
  },
  getRole: () => localStorage.getItem('user_role') || '',

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.message || 'Error en la petición');
      err.code = data.code;
      err.details = data.details || [];
      err.status = response.status;
      throw err;
    }

    return data;
  },

  // Auth
  login: (username, password) =>
    api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Categories
  getCategories: () => api.request('/categories'),

  // Books
  getBooks: (q = '', categoryId = '', page = 1, size = 20) => {
    const params = new URLSearchParams({ page, size });
    if (q) params.append('q', q);
    if (categoryId) params.append('category_id', categoryId);
    return api.request(`/books?${params.toString()}`);
  },
  createBook: (bookData) =>
    api.request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),
  deleteBook: (id) =>
    api.request(`/books/${id}`, {
      method: 'DELETE',
    }),

  // Members
  getMembers: (q = '', page = 1, size = 20) => {
    const params = new URLSearchParams({ page, size });
    if (q) params.append('q', q);
    return api.request(`/members?${params.toString()}`);
  },
  getMember: (id) => api.request(`/members/${id}`),
  createMember: (memberData) =>
    api.request('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    }),

  // Loans
  createLoan: (memberId, items) =>
    api.request('/loans', {
      method: 'POST',
      body: JSON.stringify({ member_id: memberId, items }),
    }),
  getLoans: (status = '', page = 1, size = 20) => {
    const params = new URLSearchParams({ page, size });
    if (status) params.append('status', status);
    return api.request(`/loans?${params.toString()}`);
  },
  returnLoanItem: (loanId, itemId) =>
    api.request(`/loans/${loanId}/items/${itemId}/return`, {
      method: 'POST',
    }),
  getOverdue: () => api.request('/loans/overdue'),

  // Reports
  getMostBorrowedReport: (from, to) =>
    api.request(`/reports/most-borrowed?from=${from}&to=${to}`),
};
