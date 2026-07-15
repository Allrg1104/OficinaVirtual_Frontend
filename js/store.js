// OFICINA VIRTUAL - STATE STORE (VANILLA JS)

const store = {
  // 1. Core State
  state: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    theme: 'light',
    notifications: []
  },

  // 2. State Listeners (for reactive updates)
  listeners: [],

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  },

  // 3. Load state from storage
  loadFromStorage() {
    try {
      const userStr = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const savedTheme = localStorage.getItem('theme') || 'light';

      this.state.theme = savedTheme;
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      if (userStr && accessToken && refreshToken) {
        this.state.user = JSON.parse(userStr);
        this.state.accessToken = accessToken;
        this.state.refreshToken = refreshToken;
        this.state.isAuthenticated = true;
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
    this.notify();
  },

  // 4. Save Auth credentials
  setAuth(user, accessToken, refreshToken) {
    this.state.user = user;
    this.state.accessToken = accessToken;
    this.state.refreshToken = refreshToken;
    this.state.isAuthenticated = true;

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    this.notify();
  },

  // 5. Update user profile snapshot
  updateUser(userData) {
    if (!this.state.user) return;
    this.state.user = { ...this.state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(this.state.user));
    this.notify();
  },

  // 6. Clear Auth (logout)
  clearAuth() {
    this.state.user = null;
    this.state.accessToken = null;
    this.state.refreshToken = null;
    this.state.isAuthenticated = false;

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    this.notify();
  },

  // 7. Theme Control
  toggleTheme() {
    const nextTheme = this.state.theme === 'light' ? 'dark' : 'light';
    this.state.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    this.notify();
  },

  // 8. Custom Toast Alerts
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${icon}" style="width: 20px; height: 20px; flex-shrink: 0;"></i>
      <span style="font-size: 13px; font-weight: 500;">${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }
};

// Initialize Store
store.loadFromStorage();
window.store = store; // Expose globally
