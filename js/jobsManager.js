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
      sort: 'latest'
    };
    this.loadJobs();
    this.loadSavedJobs();
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

  applyFilters() {
    let filtered = [...this.jobs];

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

    // Sort
    if (this.filters.sort === 'latest') {
      filtered.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    } else if (this.filters.sort === 'oldest') {
      filtered.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
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
