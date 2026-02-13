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
      '/': 'Landing',
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

    // Don't highlight navigation on landing page
    if (this.currentRoute === '/') {
      return;
    }

    // Normalize dashboard route
    const navRoute = this.currentRoute === '/dashboard' ? '/dashboard' : this.currentRoute;
    
    // Add active class to current route
    const activeLink = document.querySelector(`[data-route="${navRoute}"]`);
    if (activeLink && activeLink.classList.contains('nav-bar__link')) {
      activeLink.classList.add('nav-bar__link--active');
    }
  }

  render(pageName) {
    const container = document.getElementById('page-content');
    if (!container) return;

    switch (pageName) {
      case 'Landing':
        container.innerHTML = this.renderLanding();
        break;
      case 'Dashboard':
        container.innerHTML = this.renderDashboard();
        break;
      case 'Settings':
        container.innerHTML = this.renderSettings();
        break;
      case 'Saved':
        container.innerHTML = this.renderSaved();
        break;
      case 'Digest':
        container.innerHTML = this.renderDigest();
        break;
      case 'Proof':
        container.innerHTML = this.renderProof();
        break;
      default:
        container.innerHTML = this.renderDashboard();
    }
  }

  renderLanding() {
    return `
      <div class="landing-hero">
        <h1 class="landing-hero__headline">Stop Missing The Right Jobs.</h1>
        <p class="landing-hero__subtext">Precision-matched job discovery delivered daily at 9AM.</p>
        <div class="landing-hero__cta">
          <button class="btn btn-primary" data-route="/settings">Start Tracking</button>
        </div>
      </div>
    `;
  }

  renderDashboard() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Dashboard</h1>
        </div>
        <div class="empty-state">
          <div class="empty-state__title">No jobs yet</div>
          <div class="empty-state__message">In the next step, you will load a realistic dataset.</div>
        </div>
      </div>
    `;
  }

  renderSettings() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtext">Configure your job tracking preferences.</p>
        </div>
        <div class="card" style="max-width: 600px;">
          <div class="form-section">
            <h2 class="form-section-title">Preferences</h2>
            
            <div class="form-group">
              <label class="form-label" for="role-keywords">Role Keywords</label>
              <input 
                type="text" 
                id="role-keywords" 
                class="form-input" 
                placeholder="e.g., Software Engineer, Product Manager"
              >
              <span class="form-help">Enter keywords or job titles you're interested in.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="locations">Preferred Locations</label>
              <input 
                type="text" 
                id="locations" 
                class="form-input" 
                placeholder="e.g., San Francisco, New York, Remote"
              >
              <span class="form-help">Enter cities or regions where you'd like to work.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="mode">Mode</label>
              <select id="mode" class="form-select">
                <option value="">Select mode</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
              <span class="form-help">Choose your preferred work arrangement.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="experience">Experience Level</label>
              <select id="experience" class="form-select">
                <option value="">Select experience level</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead / Principal</option>
              </select>
              <span class="form-help">Select your experience level.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSaved() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Saved</h1>
        </div>
        <div class="empty-state">
          <div class="empty-state__title">No saved jobs</div>
          <div class="empty-state__message">Jobs you save will appear here.</div>
        </div>
      </div>
    `;
  }

  renderDigest() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Digest</h1>
        </div>
        <div class="empty-state">
          <div class="empty-state__title">No digest yet</div>
          <div class="empty-state__message">Your daily job digest will appear here.</div>
        </div>
      </div>
    `;
  }

  renderProof() {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Proof</h1>
          <p class="page-subtext">Placeholder for artifact collection.</p>
        </div>
      </div>
    `;
  }
}

// Initialize router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.router = new Router();
});
