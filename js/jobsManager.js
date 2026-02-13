// Job Management Module

class JobsManager {
  constructor() {
    this.jobs = [];
    this.filteredJobs = [];
    this.filters = {
      keyword: '',
      location: '',
      mode: '',
      experience: '',
      source: '',
      sort: 'latest',
      showOnlyMatches: false
    };
    this.loadJobs();
    this.loadSavedJobs();
    this.updateMatchScores();
  }

  loadJobs() {
    // Jobs are loaded from data/jobs.js
    if (typeof jobs !== 'undefined') {
      this.jobs = jobs;
      this.applyFilters();
    }
  }

  loadSavedJobs() {
    const saved = localStorage.getItem('savedJobs');
    this.savedJobIds = saved ? JSON.parse(saved) : [];
  }

  saveJob(jobId) {
    if (!this.savedJobIds.includes(jobId)) {
      this.savedJobIds.push(jobId);
      localStorage.setItem('savedJobs', JSON.stringify(this.savedJobIds));
    }
  }

  unsaveJob(jobId) {
    this.savedJobIds = this.savedJobIds.filter(id => id !== jobId);
    localStorage.setItem('savedJobs', JSON.stringify(this.savedJobIds));
  }

  isSaved(jobId) {
    return this.savedJobIds.includes(jobId);
  }

  getSavedJobs() {
    return this.jobs.filter(job => this.savedJobIds.includes(job.id));
  }

  setFilter(key, value) {
    this.filters[key] = value;
    this.applyFilters();
  }

  updateMatchScores() {
    // Calculate match scores for all jobs
    if (window.matchScorer && window.preferencesManager) {
      const prefs = window.preferencesManager.getPreferences();
      window.matchScorer.updatePreferences(prefs);
      
      this.jobs.forEach(job => {
        job.matchScore = window.matchScorer.calculateMatchScore(job);
      });
    } else {
      this.jobs.forEach(job => {
        job.matchScore = 0;
      });
    }
  }

  applyFilters() {
    let filtered = [...this.jobs];

    // Update match scores before filtering
    this.updateMatchScores();

    // Keyword filter (title/company)
    if (this.filters.keyword) {
      const keyword = this.filters.keyword.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword)
      );
    }

    // Location filter
    if (this.filters.location) {
      filtered = filtered.filter(job => job.location === this.filters.location);
    }

    // Mode filter
    if (this.filters.mode) {
      filtered = filtered.filter(job => job.mode === this.filters.mode);
    }

    // Experience filter
    if (this.filters.experience) {
      filtered = filtered.filter(job => job.experience === this.filters.experience);
    }

    // Source filter
    if (this.filters.source) {
      filtered = filtered.filter(job => job.source === this.filters.source);
    }

    // Show only matches filter
    if (this.filters.showOnlyMatches && window.preferencesManager) {
      const prefs = window.preferencesManager.getPreferences();
      const minScore = prefs.minMatchScore || 40;
      filtered = filtered.filter(job => (job.matchScore || 0) >= minScore);
    }

    // Sort
    if (this.filters.sort === 'latest') {
      filtered.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else if (this.filters.sort === 'oldest') {
      filtered.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
    } else if (this.filters.sort === 'match') {
      filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (this.filters.sort === 'salary') {
      filtered.sort((a, b) => {
        const extractSalary = (str) => {
          const match = str.match(/(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };
        return extractSalary(b.salaryRange) - extractSalary(a.salaryRange);
      });
    }

    this.filteredJobs = filtered;
    return this.filteredJobs;
  }

  getUniqueLocations() {
    return [...new Set(this.jobs.map(job => job.location))].sort();
  }

  getUniqueSources() {
    return [...new Set(this.jobs.map(job => job.source))].sort();
  }

  getJobById(id) {
    return this.jobs.find(job => job.id === parseInt(id));
  }
}

// Initialize jobs manager
window.jobsManager = new JobsManager();

// Update match scores after preferences are loaded
document.addEventListener('DOMContentLoaded', () => {
  if (window.jobsManager && window.preferencesManager && window.matchScorer) {
    const prefs = window.preferencesManager.getPreferences();
    window.matchScorer.updatePreferences(prefs);
    window.jobsManager.updateMatchScores();
  }
});
