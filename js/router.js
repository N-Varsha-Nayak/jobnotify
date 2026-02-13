// KodNest Premium Build System - Simple Router

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = '/';
    this.init();
  }

  init() {
    // Define routes
    this.routes = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/saved': 'Saved',
      '/digest': 'Digest',
      '/settings': 'Settings',
      '/proof': 'Proof'
    };

    // Handle initial route
    this.handleRoute();

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        this.navigate(route);
      }
    });
  }

  navigate(path) {
    if (this.routes[path]) {
      window.history.pushState({}, '', path);
      this.currentRoute = path;
      this.handleRoute();
    }
  }

  handleRoute() {
    const path = window.location.pathname;
    const route = this.routes[path] || this.routes['/'];
    
    this.currentRoute = path;
    this.render(route);
    this.updateNavigation();
  }

  updateNavigation() {
    // Remove active class from all links
    document.querySelectorAll('.nav-bar__link').forEach(link => {
      link.classList.remove('nav-bar__link--active');
    });

    // Normalize root route to dashboard for navigation highlighting
    const navRoute = this.currentRoute === '/' ? '/dashboard' : this.currentRoute;
    
    // Add active class to current route
    const activeLink = document.querySelector(`[data-route="${navRoute}"]`);
    if (activeLink && activeLink.classList.contains('nav-bar__link')) {
      activeLink.classList.add('nav-bar__link--active');
    }
  }

  render(pageName) {
    const container = document.getElementById('page-content');
    if (container) {
      container.innerHTML = `
        <div class="page-container">
          <div class="page-header">
            <h1 class="page-title">${pageName}</h1>
            <p class="page-subtext">This section will be built in the next step.</p>
          </div>
        </div>
      `;
    }
  }
}

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.router = new Router();
});
