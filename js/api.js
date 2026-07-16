// OFICINA VIRTUAL - SECURE API CLIENT (VANILLA JS)

const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:4000/api';

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
}

async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set headers
  options.headers = options.headers || {};
  if (!(options.body instanceof FormData)) {
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
  }

  // Attach access token
  const token = store.state.accessToken;
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, options);

    // 401 Unauthorized handling
    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            options.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(apiFetch(endpoint, options));
          });
        });
      }

      isRefreshing = true;
      const rToken = store.state.refreshToken;

      if (!rToken) {
        store.clearAuth();
        window.location.hash = '#/login';
        throw new Error('Sesión expirada');
      }

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rToken })
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh token invalid');
        }

        const data = await refreshResponse.json();
        
        // Save new auth tokens
        store.setAuth(store.state.user, data.accessToken, data.refreshToken);
        
        onRefreshed(data.accessToken);
        isRefreshing = false;

        // Retry original request
        options.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return await apiFetch(endpoint, options);

      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        store.clearAuth();
        window.location.hash = '#/login';
        store.showToast('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'error');
        throw new Error('Sesión expirada');
      }
    }

    // Parse Response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }
      return data;
    } else {
      // Return blob/buffer for downloads
      if (!response.ok) {
        throw new Error('Error al procesar archivo');
      }
      return response;
    }

  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// Global API object
window.apiFetch = apiFetch;
