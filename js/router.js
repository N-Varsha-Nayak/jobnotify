// KodNest Premium Build System - Simple Router

class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = '/';
    this.openModalJobId = null;
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

    // Handle filter changes
    document.addEventListener('change', (e) => {
      if (e.target.matches('#filter-keyword, #filter-location, #filter-mode, #filter-experience, #filter-source, #filter-sort')) {
        const filterType = e.target.id.replace('filter-', '');
        window.jobsManager.setFilter(filterType, e.target.value);
        if (this.currentRoute === '/dashboard') {
          this.render('Dashboard');
        }
      }
    });

    // Handle keyword input (debounced)
    let keywordTimeout;
    document.addEventListener('input', (e) => {
      if (e.target.matches('#filter-keyword')) {
        clearTimeout(keywordTimeout);
        keywordTimeout = setTimeout(() => {
          window.jobsManager.setFilter('keyword', e.target.value);
          if (this.currentRoute === '/dashboard') {
            this.render('Dashboard');
          }
        }, 300);
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

    // Store modal state before render
    const modalJobId = this.openModalJobId;

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

    // Re-open modal if it was open
    if (modalJobId) {
      setTimeout(() => this.viewJob(modalJobId), 0);
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
    if (!window.jobsManager) {
      return '<div class="page-container"><p>Loading jobs...</p></div>';
    }

    const jobs = window.jobsManager.applyFilters();
    const locations = window.jobsManager.getUniqueLocations();
    const sources = window.jobsManager.getUniqueSources();
    const filters = window.jobsManager.filters;

    let filterBar = `
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Search</label>
          <input 
            type="text" 
            class="filter-input" 
            id="filter-keyword" 
            placeholder="Title or company..."
            value="${filters.keyword}"
          >
        </div>
        <div class="filter-group">
          <label class="filter-label">Location</label>
          <select class="filter-select" id="filter-location">
            <option value="">All Locations</option>
            ${locations.map(loc => `<option value="${loc}" ${filters.location === loc ? 'selected' : ''}>${loc}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Mode</label>
          <select class="filter-select" id="filter-mode">
            <option value="">All Modes</option>
            <option value="Remote" ${filters.mode === 'Remote' ? 'selected' : ''}>Remote</option>
            <option value="Hybrid" ${filters.mode === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
            <option value="Onsite" ${filters.mode === 'Onsite' ? 'selected' : ''}>Onsite</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Experience</label>
          <select class="filter-select" id="filter-experience">
            <option value="">All Levels</option>
            <option value="Fresher" ${filters.experience === 'Fresher' ? 'selected' : ''}>Fresher</option>
            <option value="0-1" ${filters.experience === '0-1' ? 'selected' : ''}>0-1 years</option>
            <option value="1-3" ${filters.experience === '1-3' ? 'selected' : ''}>1-3 years</option>
            <option value="3-5" ${filters.experience === '3-5' ? 'selected' : ''}>3-5 years</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Source</label>
          <select class="filter-select" id="filter-source">
            <option value="">All Sources</option>
            ${sources.map(src => `<option value="${src}" ${filters.source === src ? 'selected' : ''}>${src}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Sort</label>
          <select class="filter-select" id="filter-sort">
            <option value="latest" ${filters.sort === 'latest' ? 'selected' : ''}>Latest First</option>
            <option value="oldest" ${filters.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
          </select>
        </div>
      </div>
    `;

    let jobsGrid = '';
    if (jobs.length === 0) {
      jobsGrid = `
        <div class="empty-state">
          <div class="empty-state__title">No jobs found</div>
          <div class="empty-state__message">Try adjusting your filters to see more results.</div>
        </div>
      `;
    } else {
      jobsGrid = `
        <div class="jobs-grid">
          ${jobs.map(job => this.renderJobCard(job)).join('')}
        </div>
      `;
    }

    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Dashboard</h1>
        </div>
        ${filterBar}
        ${jobsGrid}
      </div>
    `;
  }

  renderJobCard(job) {
    const isSaved = window.jobsManager.isSaved(job.id);
    const postedText = job.postedDaysAgo === 0 ? 'Today' : 
                      job.postedDaysAgo === 1 ? '1 day ago' : 
                      `${job.postedDaysAgo} days ago`;

    return `
      <div class="job-card">
        <div class="job-card__header">
          <div>
            <h3 class="job-card__title">${job.title}</h3>
            <div class="job-card__company">${job.company}</div>
          </div>
          <span class="badge badge-accent">${job.source}</span>
        </div>
        <div class="job-card__meta">
          <span class="job-card__meta-item">📍 ${job.location}</span>
          <span class="job-card__meta-item">${job.mode}</span>
          <span class="job-card__meta-item">${job.experience}</span>
        </div>
        <div class="job-card__footer">
          <div>
            <div class="job-card__salary">${job.salaryRange}</div>
            <div class="job-card__posted">${postedText}</div>
          </div>
          <div class="job-card__actions">
            <button class="btn btn-secondary" style="font-size: var(--font-size-sm); padding: var(--spacing-xs) var(--spacing-sm);" onclick="window.router.viewJob(${job.id})">View</button>
            <button class="btn ${isSaved ? 'btn-primary' : 'btn-secondary'}" style="font-size: var(--font-size-sm); padding: var(--spacing-xs) var(--spacing-sm);" onclick="window.router.toggleSave(${job.id})">${isSaved ? 'Saved' : 'Save'}</button>
            <button class="btn btn-primary" style="font-size: var(--font-size-sm); padding: var(--spacing-xs) var(--spacing-sm);" onclick="window.open('${job.applyUrl}', '_blank')">Apply</button>
          </div>
        </div>
      </div>
    `;
  }

  viewJob(jobId) {
    // Close existing modal if any
    this.closeModal();
    this.openModalJobId = jobId;
    
    const job = window.jobsManager.getJobById(jobId);
    if (!job) return;

    const modal = `
      <div class="modal-overlay modal-overlay--visible" id="job-modal" onclick="if(event.target.id === 'job-modal') window.router.closeModal()">
        <div class="modal">
          <div class="modal__header">
            <div>
              <h2 class="modal__title">${job.title}</h2>
              <div class="modal__company">${job.company}</div>
            </div>
            <button class="modal__close" onclick="window.router.closeModal()">&times;</button>
          </div>
          <div class="modal__meta">
            <span class="modal__meta-item">📍 ${job.location}</span>
            <span class="modal__meta-item">${job.mode}</span>
            <span class="modal__meta-item">${job.experience}</span>
            <span class="modal__meta-item">${job.salaryRange}</span>
            <span class="badge badge-accent">${job.source}</span>
          </div>
          <div class="modal__section">
            <div class="modal__section-title">Description</div>
            <div class="modal__description">${job.description}</div>
          </div>
          <div class="modal__section">
            <div class="modal__section-title">Skills</div>
            <div class="modal__skills">
              ${job.skills.map(skill => `<span class="modal__skill">${skill}</span>`).join('')}
            </div>
          </div>
          <div class="modal__actions">
            <button class="btn btn-secondary" onclick="window.router.toggleSave(${job.id})">${window.jobsManager.isSaved(job.id) ? 'Unsave' : 'Save'}</button>
            <button class="btn btn-primary" onclick="window.open('${job.applyUrl}', '_blank')">Apply Now</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modal);
  }

  closeModal() {
    const modal = document.getElementById('job-modal');
    if (modal) {
      modal.remove();
    }
    this.openModalJobId = null;
  }

  toggleSave(jobId) {
    const wasModalOpen = this.openModalJobId === jobId;
    
    if (window.jobsManager.isSaved(jobId)) {
      window.jobsManager.unsaveJob(jobId);
    } else {
      window.jobsManager.saveJob(jobId);
    }
    
    // Re-render current page
    const path = window.location.pathname;
    const route = this.routes[path] || this.routes['/'];
    this.render(route);
    
    // Re-open modal if it was open
    if (wasModalOpen) {
      setTimeout(() => this.viewJob(jobId), 0);
    }
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
    if (!window.jobsManager) {
      return '<div class="page-container"><p>Loading...</p></div>';
    }

    const savedJobs = window.jobsManager.getSavedJobs();

    let jobsGrid = '';
    if (savedJobs.length === 0) {
      jobsGrid = `
        <div class="empty-state">
          <div class="empty-state__title">No saved jobs</div>
          <div class="empty-state__message">Jobs you save will appear here.</div>
        </div>
      `;
    } else {
      jobsGrid = `
        <div class="jobs-grid">
          ${savedJobs.map(job => this.renderJobCard(job)).join('')}
        </div>
      `;
    }

    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Saved</h1>
        </div>
        ${jobsGrid}
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
