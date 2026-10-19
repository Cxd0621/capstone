// Single place that knows how to talk to the API.
// The URL comes from VITE_API_URL so the deployed build can point at the deployed server.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/$/, '');

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
  getProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (body, token) => request('/projects', { method: 'POST', body, token }),
  updateProject: (id, body, token) => request(`/projects/${id}`, { method: 'PUT', body, token }),
  deleteProject: (id, token) => request(`/projects/${id}`, { method: 'DELETE', token }),

  // blog posts
  getPosts: () => request('/blog'),
  getPost: (id) => request(`/blog/${id}`),
  createPost: (body, token) => request('/blog', { method: 'POST', body, token }),
  updatePost: (id, body, token) => request(`/blog/${id}`, { method: 'PUT', body, token }),
  deletePost: (id, token) => request(`/blog/${id}`, { method: 'DELETE', token }),

  // comments
  getComments: (postId) => request(`/blog/${postId}/comments`),
  createComment: (postId, body, token) =>
    request(`/blog/${postId}/comments`, { method: 'POST', body, token }),

  // contact messages
  sendMessage: (body) => request('/contact', { method: 'POST', body }),
  getMessages: (token) => request('/contact', { token }),
  deleteMessage: (id, token) => request(`/contact/${id}`, { method: 'DELETE', token }),
};

export { API_URL };
