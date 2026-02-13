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
      
      // Handle show only matches toggle
      if (e.target.matches('#show-only-matches')) {
        window.jobsManager.setFilter('showOnlyMatches', e.target.checked);
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
      
      // Handle slider value update
      if (e.target.matches('#min-match-score')) {
        const valueDisplay = document.getElementById('min-match-score-value');
        if (valueDisplay) {
          valueDisplay.textContent = e.target.value;
        }
      }
    });

    // Initialize preferences in match scorer
    if (window.preferencesManager && window.matchScorer) {
      const prefs = window.preferencesManager.getPreferences();
      window.matchScorer.updatePreferences(prefs);
    }
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
    const hasPreferences = window.preferencesManager ? window.preferencesManager.hasPreferences() : false;
    const prefs = window.preferencesManager ? window.preferencesManager.getPreferences() : null;

    // Banner if no preferences
    let banner = '';
    if (!hasPreferences) {
      banner = `
        <div class="preferences-banner">
          <p class="preferences-banner__text">Set your preferences to activate intelligent matching. <a href="/settings" data-route="/settings" style="color: var(--color-accent); text-decoration: underline;">Go to Settings</a></p>
        </div>
      `;
    }

    // Toggle for show only matches
    let toggleSection = '';
    if (hasPreferences) {
      toggleSection = `
        <div style="padding: var(--spacing-md); background-color: #FFFFFF; border-bottom: 1px solid rgba(17, 17, 17, 0.1);">
          <div class="checkbox-item">
            <input type="checkbox" id="show-only-matches" ${filters.showOnlyMatches ? 'checked' : ''}>
            <label for="show-only-matches" class="checkbox-item-label">Show only jobs above my threshold (${prefs ? prefs.minMatchScore : 40}+)</label>
          </div>
        </div>
      `;
    }

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
            <option value="match" ${filters.sort === 'match' ? 'selected' : ''}>Match Score</option>
            <option value="salary" ${filters.sort === 'salary' ? 'selected' : ''}>Salary (High to Low)</option>
          </select>
        </div>
      </div>
    `;

    let jobsGrid = '';
    if (jobs.length === 0) {
      const emptyMessage = filters.showOnlyMatches && hasPreferences 
        ? 'No roles match your criteria. Adjust filters or lower threshold.'
        : 'Try adjusting your filters to see more results.';
      jobsGrid = `
        <div class="empty-state">
          <div class="empty-state__title">No jobs found</div>
          <div class="empty-state__message">${emptyMessage}</div>
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
        ${banner}
        ${toggleSection}
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
    
    // Get match score badge
    const matchScore = job.matchScore || 0;
    const badgeStyle = window.matchScorer ? window.matchScorer.getScoreBadgeStyle(matchScore) : {};
    const badgeClass = window.matchScorer ? window.matchScorer.getScoreBadgeClass(matchScore) : 'badge-default';
    const matchScoreBadge = window.preferencesManager && window.preferencesManager.hasPreferences() 
      ? `<span class="badge ${badgeClass}" style="background-color: ${badgeStyle.backgroundColor}; color: ${badgeStyle.color};">Match: ${matchScore}</span>`
      : '';

    return `
      <div class="job-card">
        <div class="job-card__header">
          <div>
            <h3 class="job-card__title">${job.title}</h3>
            <div class="job-card__company">${job.company}</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--spacing-xs); align-items: flex-end;">
            <span class="badge badge-accent">${job.source}</span>
            ${matchScoreBadge}
          </div>
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
            ${window.preferencesManager && window.preferencesManager.hasPreferences() && job.matchScore ? (() => {
              const badgeStyle = window.matchScorer.getScoreBadgeStyle(job.matchScore);
              const badgeClass = window.matchScorer.getScoreBadgeClass(job.matchScore);
              return `<span class="badge ${badgeClass}" style="background-color: ${badgeStyle.backgroundColor}; color: ${badgeStyle.color};">Match: ${job.matchScore}</span>`;
            })() : ''}
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
    const prefs = window.preferencesManager ? window.preferencesManager.getPreferences() : window.preferencesManager.getDefaultPreferences();
    const locations = window.jobsManager ? window.jobsManager.getUniqueLocations() : [];

    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtext">Configure your job tracking preferences.</p>
        </div>
        <div class="card" style="max-width: 700px;">
          <div class="form-section">
            <h2 class="form-section-title">Preferences</h2>
            
            <div class="form-group">
              <label class="form-label" for="role-keywords">Role Keywords</label>
              <input 
                type="text" 
                id="role-keywords" 
                class="form-input" 
                placeholder="e.g., Software Engineer, Product Manager, Developer"
                value="${prefs.roleKeywords || ''}"
              >
              <span class="form-help">Enter comma-separated keywords or job titles you're interested in.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="preferred-locations">Preferred Locations</label>
              <select id="preferred-locations" class="form-select" multiple>
                ${locations.map(loc => `<option value="${loc}" ${prefs.preferredLocations && prefs.preferredLocations.includes(loc) ? 'selected' : ''}>${loc}</option>`).join('')}
              </select>
              <span class="form-help">Hold Ctrl/Cmd to select multiple locations.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Preferred Mode</label>
              <div class="checkbox-group">
                <div class="checkbox-item">
                  <input type="checkbox" id="mode-remote" value="Remote" ${prefs.preferredMode && prefs.preferredMode.includes('Remote') ? 'checked' : ''}>
                  <label for="mode-remote" class="checkbox-item-label">Remote</label>
                </div>
                <div class="checkbox-item">
                  <input type="checkbox" id="mode-hybrid" value="Hybrid" ${prefs.preferredMode && prefs.preferredMode.includes('Hybrid') ? 'checked' : ''}>
                  <label for="mode-hybrid" class="checkbox-item-label">Hybrid</label>
                </div>
                <div class="checkbox-item">
                  <input type="checkbox" id="mode-onsite" value="Onsite" ${prefs.preferredMode && prefs.preferredMode.includes('Onsite') ? 'checked' : ''}>
                  <label for="mode-onsite" class="checkbox-item-label">Onsite</label>
                </div>
              </div>
              <span class="form-help">Select one or more work arrangements.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="experience-level">Experience Level</label>
              <select id="experience-level" class="form-select">
                <option value="">Select experience level</option>
                <option value="Fresher" ${prefs.experienceLevel === 'Fresher' ? 'selected' : ''}>Fresher</option>
                <option value="0-1" ${prefs.experienceLevel === '0-1' ? 'selected' : ''}>0-1 years</option>
                <option value="1-3" ${prefs.experienceLevel === '1-3' ? 'selected' : ''}>1-3 years</option>
                <option value="3-5" ${prefs.experienceLevel === '3-5' ? 'selected' : ''}>3-5 years</option>
              </select>
              <span class="form-help">Select your experience level.</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="skills">Skills</label>
              <input 
                type="text" 
                id="skills" 
                class="form-input" 
                placeholder="e.g., React, Python, Java, Node.js"
                value="${prefs.skills || ''}"
              >
              <span class="form-help">Enter comma-separated skills you have or want to work with.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Minimum Match Score</label>
              <div class="slider-group">
                <div class="slider-container">
                  <input 
                    type="range" 
                    id="min-match-score" 
                    class="slider" 
                    min="0" 
                    max="100" 
                    value="${prefs.minMatchScore || 40}"
                  >
                  <span class="slider-value" id="min-match-score-value">${prefs.minMatchScore || 40}</span>
                </div>
                <span class="form-help">Only show jobs with match score above this threshold.</span>
              </div>
            </div>

            <div style="margin-top: var(--spacing-lg);">
              <button class="btn btn-primary" onclick="window.router.savePreferences()">Save Preferences</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  savePreferences() {
    const roleKeywords = document.getElementById('role-keywords').value.trim();
    const locationsSelect = document.getElementById('preferred-locations');
    const preferredLocations = Array.from(locationsSelect.selectedOptions).map(opt => opt.value);
    const preferredMode = [];
    if (document.getElementById('mode-remote').checked) preferredMode.push('Remote');
    if (document.getElementById('mode-hybrid').checked) preferredMode.push('Hybrid');
    if (document.getElementById('mode-onsite').checked) preferredMode.push('Onsite');
    const experienceLevel = document.getElementById('experience-level').value;
    const skills = document.getElementById('skills').value.trim();
    const minMatchScore = parseInt(document.getElementById('min-match-score').value);

    const preferences = {
      roleKeywords,
      preferredLocations,
      preferredMode,
      experienceLevel,
      skills,
      minMatchScore
    };

    window.preferencesManager.savePreferences(preferences);
    window.matchScorer.updatePreferences(preferences);
    
    // Update match scores for all jobs
    if (window.jobsManager) {
      window.jobsManager.updateMatchScores();
    }

    // Show success message
    alert('Preferences saved successfully!');

    // Navigate to dashboard
    this.navigate('/dashboard');
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
    const hasPreferences = window.preferencesManager ? window.preferencesManager.hasPreferences() : false;
    
    // Check if preferences are set
    if (!hasPreferences) {
      return `
        <div class="page-container">
          <div class="page-header">
            <h1 class="page-title">Digest</h1>
          </div>
          <div class="empty-state">
            <div class="empty-state__title">Set preferences to generate a personalized digest</div>
            <div class="empty-state__message">Configure your job preferences in Settings to receive your daily digest.</div>
            <div class="empty-state__action" style="margin-top: var(--spacing-md);">
              <button class="btn btn-primary" data-route="/settings">Go to Settings</button>
            </div>
          </div>
        </div>
      `;
    }

    // Try to get today's digest
    const digest = window.digestManager ? window.digestManager.getTodayDigest() : null;
    const isGenerated = !!digest;

    // Generate button section
    let generateSection = '';
    if (!isGenerated) {
      generateSection = `
        <div class="digest-generate-section">
          <button class="btn btn-primary" onclick="window.router.generateDigest()">
            Generate Today's 9AM Digest (Simulated)
          </button>
        </div>
      `;
    }

    // Digest content
    let digestContent = '';
    if (isGenerated) {
      if (digest.isEmpty || !digest.jobs || digest.jobs.length === 0) {
        digestContent = `
          <div class="empty-state">
            <div class="empty-state__title">No matching roles today</div>
            <div class="empty-state__message">Check again tomorrow for new opportunities.</div>
          </div>
        `;
      } else {
        // Parse YYYY-MM-DD format
        const [year, month, day] = digest.date.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const date = dateObj.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        digestContent = `
          <div class="digest-container">
            <div class="digest-card">
              <div class="digest-header">
                <h2 class="digest-header__title">Top 10 Jobs For You — 9AM Digest</h2>
                <div class="digest-header__date">${date}</div>
              </div>
              
              <div class="digest-jobs">
                ${digest.jobs.map((job, index) => {
                  const badgeStyle = window.matchScorer ? window.matchScorer.getScoreBadgeStyle(job.matchScore) : {};
                  const badgeClass = window.matchScorer ? window.matchScorer.getScoreBadgeClass(job.matchScore) : 'badge-default';
                  return `
                    <div class="digest-job">
                      <div class="digest-job__title">${index + 1}. ${job.title}</div>
                      <div class="digest-job__company">${job.company}</div>
                      <div class="digest-job__meta">
                        <span class="digest-job__meta-item">📍 ${job.location}</span>
                        <span class="digest-job__meta-item">${job.mode}</span>
                        <span class="digest-job__meta-item">${job.experience}</span>
                        <span class="badge ${badgeClass}" style="background-color: ${badgeStyle.backgroundColor}; color: ${badgeStyle.color};">
                          Match: ${job.matchScore}
                        </span>
                      </div>
                      <div class="digest-job__actions">
                        <button class="btn btn-primary" onclick="window.open('${job.applyUrl}', '_blank')">Apply</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
              
              <div class="digest-footer">
                <p class="digest-footer__text">This digest was generated based on your preferences.</p>
                <p class="digest-footer__note">Demo Mode: Daily 9AM trigger simulated manually.</p>
              </div>
            </div>
            
            <div class="digest-actions">
              <button class="btn btn-secondary" onclick="window.router.copyDigestToClipboard()">
                Copy Digest to Clipboard
              </button>
              <button class="btn btn-secondary" onclick="window.router.createEmailDraft()">
                Create Email Draft
              </button>
            </div>
          </div>
        `;
      }
    } else {
      digestContent = `
        <div class="empty-state">
          <div class="empty-state__title">No digest generated yet</div>
          <div class="empty-state__message">Click the button above to generate today's digest.</div>
        </div>
      `;
    }

    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Digest</h1>
        </div>
        ${generateSection}
        ${digestContent}
      </div>
    `;
  }

  generateDigest() {
    if (!window.digestManager) {
      alert('Digest manager not available.');
      return;
    }

    const digest = window.digestManager.generateDigest();
    
    if (!digest) {
      alert('Please set your preferences first.');
      return;
    }

    if (digest.isEmpty) {
      // Still render the page to show the empty state
      this.render('Digest');
      return;
    }

    // Re-render to show the digest
    this.render('Digest');
  }

  copyDigestToClipboard() {
    const digest = window.digestManager ? window.digestManager.getTodayDigest() : null;
    if (!digest || !digest.jobs || digest.jobs.length === 0) {
      alert('No digest available to copy.');
      return;
    }

    const text = window.digestManager.formatDigestAsText(digest);
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Digest copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        this.fallbackCopyToClipboard(text);
      });
    } else {
      this.fallbackCopyToClipboard(text);
    }
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Digest copied to clipboard!');
    } catch (err) {
      alert('Failed to copy. Please select and copy manually.');
    }
    document.body.removeChild(textArea);
  }

  createEmailDraft() {
    const digest = window.digestManager ? window.digestManager.getTodayDigest() : null;
    if (!digest || !digest.jobs || digest.jobs.length === 0) {
      alert('No digest available to email.');
      return;
    }

    const subject = encodeURIComponent('My 9AM Job Digest');
    const body = encodeURIComponent(window.digestManager.formatDigestAsEmailBody(digest));
    
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
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
