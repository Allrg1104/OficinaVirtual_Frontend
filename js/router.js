// OFICINA VIRTUAL - CLIENT ROUTER (VANILLA JS)

const routes = {
  '#/login': { view: LoginView, auth: false },
  '#/forgot-password': { view: ForgotPasswordView, auth: false },
  '#/dashboard': { view: DashboardView, auth: true, roles: ['administrador', 'autorizador'] },
  '#/requests': { view: RequestsView, auth: true },
  '#/requests/create': { view: RequestCreateView, auth: true, roles: ['medico'] },
  '#/requests/detail': { view: RequestDetailView, auth: true },
  '#/profile': { view: ProfileView, auth: true },
  '#/users': { view: UsersView, auth: true, roles: ['administrador'] },
  '#/audit': { view: AuditView, auth: true, roles: ['administrador'] },
};

// Global active route tracker
let activeViewInstance = null;

async function router() {
  const hash = window.location.hash || '#/login';
  
  // Clean hash for parametrized paths (like #/requests/detail?id=123)
  const baseHash = hash.split('?')[0];
  let route = routes[baseHash];

  // Simple route match check
  if (!route) {
    // Check if it's dynamic path (we can support path parameters using query strings)
    // E.g. #/requests/detail?id=6601283719
    route = routes['#/login'];
    window.location.hash = '#/login';
    return;
  }

  // Auth Guards
  const isAuthenticated = store.state.isAuthenticated;
  
  if (route.auth && !isAuthenticated) {
    store.showToast('Debes iniciar sesión para acceder a esta pantalla.', 'error');
    window.location.hash = '#/login';
    return;
  }

  if (!route.auth && isAuthenticated) {
    // Redirect logged-in users to default page based on role
    const defaultPage = store.state.user.role === 'medico' ? '#/requests' : '#/dashboard';
    window.location.hash = defaultPage;
    return;
  }

  // Role permissions check
  if (route.auth && route.roles && !route.roles.includes(store.state.user.role)) {
    store.showToast('No tienes permisos para acceder a esta pantalla.', 'error');
    const fallback = store.state.user.role === 'medico' ? '#/requests' : '#/dashboard';
    window.location.hash = fallback;
    return;
  }

  // Show/Hide App Layout Root
  const appRoot = document.getElementById('app-root');
  const authRoot = document.getElementById('auth-root');

  if (route.auth) {
    appRoot.classList.remove('hidden');
    authRoot.classList.add('hidden');
    
    // Update User Nav Badge
    document.getElementById('nav-user-name').innerText = store.state.user.name;
    document.getElementById('nav-user-role').innerText = store.state.user.role.toUpperCase();
    document.getElementById('nav-user-avatar').innerText = store.state.user.name.charAt(0).toUpperCase();

    // Render Navigation Sidebar based on user role
    renderSidebarMenu();

    // Update active nav link classes
    updateActiveMenuLink(baseHash);
    
    // Set Page Title
    document.getElementById('page-title').innerText = getPageTitleText(baseHash);

    // Fetch and render recent notifications count
    fetchNotifications();

  } else {
    appRoot.classList.add('hidden');
    authRoot.classList.remove('hidden');
  }

  // Render View HTML
  const contentContainer = route.auth 
    ? document.getElementById('app-content') 
    : document.getElementById('auth-content');

  contentContainer.innerHTML = `<div class="loading-spinner" style="text-align: center; padding: 40px; color: var(--text-muted);">
    <i data-lucide="loader" class="animate-spin" style="width: 32px; height: 32px; margin: 0 auto 10px auto;"></i>
    Cargando contenido...
  </div>`;
  lucide.createIcons();

  try {
    const html = await route.view.render();
    contentContainer.innerHTML = html;
    
    // Run View Post-render Bindings
    if (route.view.afterRender) {
      await route.view.afterRender();
    }
    
    activeViewInstance = route.view;
    lucide.createIcons();
  } catch (err) {
    contentContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: #ef4444; margin: 0 auto 16px auto;"></i>
        <h3 style="margin-bottom: 8px;">Error al cargar pantalla</h3>
        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">${err.message || 'Error desconocido'}</p>
        <button onclick="window.location.reload()" class="btn btn-secondary">Reintentar</button>
      </div>
    `;
    lucide.createIcons();
  }
}

// Helper to render sidebar items according to user role
function renderSidebarMenu() {
  const role = store.state.user.role;
  const menuContainer = document.getElementById('sidebar-menu');
  if (!menuContainer) return;

  let menuHtml = '';

  if (role === 'administrador' || role === 'autorizador') {
    menuHtml += `
      <a href="#/dashboard" class="menu-item" id="link-dashboard">
        <i data-lucide="layout-dashboard"></i> Panel Control (Stats)
      </a>
    `;
  }

  menuHtml += `
    <a href="#/requests" class="menu-item" id="link-requests">
      <i data-lucide="folder-open"></i> Solicitudes PAC
    </a>
  `;

  if (role === 'medico') {
    menuHtml += `
      <a href="#/requests/create" class="menu-item" id="link-requests-create">
        <i data-lucide="file-plus-2"></i> Radicar Solicitud
      </a>
    `;
  }

  if (role === 'administrador') {
    menuHtml += `
      <a href="#/users" class="menu-item" id="link-users">
        <i data-lucide="users"></i> Usuarios
      </a>
      <a href="#/audit" class="menu-item" id="link-audit">
        <i data-lucide="history"></i> Auditoría Sistema
      </a>
    `;
  }

  menuHtml += `
    <a href="#/profile" class="menu-item" id="link-profile">
      <i data-lucide="user-cog"></i> Configurar Perfil
    </a>
  `;

  menuContainer.innerHTML = menuHtml;
  lucide.createIcons();
}

// Highlight active menu item
function updateActiveMenuLink(hash) {
  document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
  
  let linkId = '';
  if (hash === '#/dashboard') linkId = 'link-dashboard';
  else if (hash === '#/requests') linkId = 'link-requests';
  else if (hash === '#/requests/create') linkId = 'link-requests-create';
  else if (hash === '#/requests/detail') linkId = 'link-requests'; // keep Requests highlighted
  else if (hash === '#/users') linkId = 'link-users';
  else if (hash === '#/profile') linkId = 'link-profile';
  else if (hash === '#/audit') linkId = 'link-audit';

  const activeLink = document.getElementById(linkId);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Helper to get friendly titles
function getPageTitleText(hash) {
  switch (hash) {
    case '#/dashboard': return 'Dashboard & Indicadores PAC';
    case '#/requests': return 'Bandeja de Solicitudes';
    case '#/requests/create': return 'Radicar Nueva Solicitud PAC';
    case '#/requests/detail': return 'Detalle de Solicitud de Alto Costo';
    case '#/profile': return 'Configuración de Mi Perfil';
    case '#/users': return 'Administración de Usuarios';
    case '#/audit': return 'Bitácora de Auditoría del Sistema';
    default: return 'Oficina Virtual';
  }
}

// Fetch Notifications and update bell count
async function fetchNotifications() {
  const notifCount = document.getElementById('notif-count');
  const notifList = document.getElementById('notif-list');
  if (!notifCount || !notifList) return;

  try {
    const notifications = await apiFetch('/users/notifications');
    
    if (notifications.length > 0) {
      notifCount.innerText = notifications.length;
      notifCount.classList.remove('hidden');

      notifList.innerHTML = notifications.map(notif => `
        <div class="notif-item unread" onclick="window.location.hash='#/requests/detail?id=${notif.request}'">
          <div class="notif-title">${notif.title}</div>
          <div class="notif-msg">${notif.message}</div>
          <div class="notif-time">${new Date(notif.createdAt).toLocaleTimeString()}</div>
        </div>
      `).join('');
    } else {
      notifCount.classList.add('hidden');
      notifList.innerHTML = '<div class="dropdown-empty">No hay nuevas notificaciones</div>';
    }
    lucide.createIcons();
  } catch (err) {
    console.error('Error fetching notifications:', err);
  }
}

// Global Event Listeners setup
document.addEventListener('DOMContentLoaded', () => {
  // Hash Router bindings
  window.addEventListener('hashchange', router);
  router(); // trigger initial routing

  // Theme Toggler Binding
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      store.toggleTheme();
      const isDark = store.state.theme === 'dark';
      themeIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
      lucide.createIcons();
    });
  }

  // Logout Trigger Binding
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } catch (e) {}
      store.clearAuth();
      window.location.hash = '#/login';
      store.showToast('Has cerrado sesión correctamente.', 'success');
    });
  }

  // Notification toggle dropdown
  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      notifDropdown.classList.add('hidden');
    });
  }

  // Mark all read binding
  const markReadBtn = document.getElementById('mark-all-read');
  if (markReadBtn) {
    markReadBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await apiFetch('/users/notifications/read', { method: 'PUT' });
        fetchNotifications();
        store.showToast('Notificaciones marcadas como leídas.', 'success');
      } catch (err) {}
    });
  }

  // Mobile Menu Drawer Toggle
  const toggleSidebar = document.getElementById('toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  if (toggleSidebar && sidebar) {
    toggleSidebar.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      sidebar.classList.remove('active');
    });
  }

  // Setup periodic notifications fetching (every 30 seconds)
  setInterval(() => {
    if (store.state.isAuthenticated) {
      fetchNotifications();
    }
  }, 30000);
});

// Helper to extract query parameters from location hash (e.g. ?id=123)
function getQueryParams() {
  const hash = window.location.hash;
  const queryStr = hash.split('?')[1];
  const params = {};
  if (!queryStr) return params;

  queryStr.split('&').forEach(pair => {
    const [key, val] = pair.split('=');
    params[key] = decodeURIComponent(val);
  });
  return params;
}

window.getQueryParams = getQueryParams;
