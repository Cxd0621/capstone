// Single place that knows how to talk to the API.
// The URL comes from VITE_API_URL so the deployed build can point at the deployed server.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/$/, '');

// Builds "?page=2&limit=6" for the paginated list endpoints (omitted when empty).
function query(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

// Accepts both the paginated envelope and a plain array, so the UI keeps
// working if an older API build is still serving traffic during a deploy.
function asPage(data) {
  if (Array.isArray(data)) {
    return { items: data, page: 1, pages: 1, total: data.length, limit: data.length };
  }
  return data;
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(API_URL + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  // authentication
  register: (body) => request('/users/register', { method: 'POST', body }),
  login: (body) => request('/users/login', { method: 'POST', body }),
  me: (token) => request('/users/me', { token }),

  // projects (public reads, protected writes)
  getProjects: (params) => request('/projects' + query(params)).then(asPage),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (body, token) => request('/projects', { method: 'POST', body, token }),
  updateProject: (id, body, token) => request(`/projects/${id}`, { method: 'PUT', body, token }),
  deleteProject: (id, token) => request(`/projects/${id}`, { method: 'DELETE', token }),

  // blog posts
  getPosts: (params) => request('/blog' + query(params)).then(asPage),
  getPost: (id) => request(`/blog/${id}`),
  createPost: (body, token) => request('/blog', { method: 'POST', body, token }),
  updatePost: (id, body, token) => request(`/blog/${id}`, { method: 'PUT', body, token }),
  deletePost: (id, token) => request(`/blog/${id}`, { method: 'DELETE', token }),

  // comments
  getComments: (postId) => request(`/blog/${postId}/comments`),
  createComment: (postId, body, token) =>
    request(`/blog/${postId}/comments`, { method: 'POST', body, token }),
  deleteComment: (postId, commentId, token) =>
    request(`/blog/${postId}/comments/${commentId}`, { method: 'DELETE', token }),

  // contact messages
  sendMessage: (body) => request('/contact', { method: 'POST', body }),
  getMessages: (token, params) => request('/contact' + query(params), { token }).then(asPage),
  deleteMessage: (id, token) => request(`/contact/${id}`, { method: 'DELETE', token }),
};

export { API_URL };
