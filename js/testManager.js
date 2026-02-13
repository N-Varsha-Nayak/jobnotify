// Test Manager

class TestManager {
  constructor() {
    this.testKey = 'jobTrackerTests';
    this.tests = [
      { id: 'preferences-persist', label: 'Preferences persist after refresh', tooltip: 'Set preferences, refresh page, verify they are still there.' },
      { id: 'match-score-calculates', label: 'Match score calculates correctly', tooltip: 'Set preferences, check job cards show match scores.' },
      { id: 'show-only-matches-toggle', label: '"Show only matches" toggle works', tooltip: 'Enable toggle, verify only jobs above threshold show.' },
      { id: 'save-job-persists', label: 'Save job persists after refresh', tooltip: 'Save a job, refresh page, verify it appears in Saved page.' },
      { id: 'apply-opens-new-tab', label: 'Apply opens in new tab', tooltip: 'Click Apply button, verify new tab opens with job URL.' },
      { id: 'status-update-persists', label: 'Status update persists after refresh', tooltip: 'Change job status, refresh page, verify status remains.' },
      { id: 'status-filter-works', label: 'Status filter works correctly', tooltip: 'Change job statuses, use filter dropdown, verify correct jobs show.' },
      { id: 'digest-generates-top-10', label: 'Digest generates top 10 by score', tooltip: 'Generate digest, verify top 10 jobs sorted by match score.' },
      { id: 'digest-persists-day', label: 'Digest persists for the day', tooltip: 'Generate digest, refresh page, verify it still shows (not regenerated).' },
      { id: 'no-console-errors', label: 'No console errors on main pages', tooltip: 'Open browser console, navigate through pages, verify no errors.' }
    ];
  }

  getTestStatus() {
    const stored = localStorage.getItem(this.testKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return this.getDefaultStatus();
      }
    }
    return this.getDefaultStatus();
  }

  getDefaultStatus() {
    const status = {};
    this.tests.forEach(test => {
      status[test.id] = false;
    });
    return status;
  }

  setTestStatus(testId, passed) {
    const status = this.getTestStatus();
    status[testId] = passed;
    localStorage.setItem(this.testKey, JSON.stringify(status));
    return status;
  }

  getAllTestsPassed() {
    const status = this.getTestStatus();
    return this.tests.every(test => status[test.id] === true);
  }

  getPassedCount() {
    const status = this.getTestStatus();
    return this.tests.filter(test => status[test.id] === true).length;
  }

  resetTests() {
    localStorage.removeItem(this.testKey);
  }

  getTests() {
    return this.tests;
  }
}

// Initialize test manager
window.testManager = new TestManager();
