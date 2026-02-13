// Status Manager

class StatusManager {
  constructor() {
    this.statusKey = 'jobTrackerStatus';
    this.statusHistoryKey = 'jobTrackerStatusHistory';
  }

  getStatus(jobId) {
    const statuses = this.getAllStatuses();
    return statuses[jobId] || 'Not Applied';
  }

  setStatus(jobId, status) {
    const statuses = this.getAllStatuses();
    const oldStatus = statuses[jobId] || 'Not Applied';
    
    statuses[jobId] = status;
    localStorage.setItem(this.statusKey, JSON.stringify(statuses));

    // Track status history for digest
    if (oldStatus !== status) {
      this.addToHistory(jobId, status);
    }

    return status;
  }

  getAllStatuses() {
    const stored = localStorage.getItem(this.statusKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  addToHistory(jobId, status) {
    const history = this.getHistory();
    const entry = {
      jobId: parseInt(jobId),
      status: status,
      date: new Date().toISOString()
    };
    
    // Add to beginning of array
    history.unshift(entry);
    
    // Keep only last 50 entries
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem(this.statusHistoryKey, JSON.stringify(history));
  }

  getHistory() {
    const stored = localStorage.getItem(this.statusHistoryKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  getRecentStatusUpdates(limit = 10) {
    const history = this.getHistory();
    return history.slice(0, limit);
  }

  getStatusBadgeClass(status) {
    switch (status) {
      case 'Applied':
        return 'badge-applied';
      case 'Rejected':
        return 'badge-rejected';
      case 'Selected':
        return 'badge-success';
      default:
        return 'badge-default';
    }
  }

  getStatusBadgeStyle(status) {
    switch (status) {
      case 'Applied':
        return { backgroundColor: 'rgba(0, 100, 200, 0.1)', color: '#0064C8' };
      case 'Rejected':
        return { backgroundColor: 'rgba(139, 0, 0, 0.1)', color: 'var(--color-accent)' };
      case 'Selected':
        return { backgroundColor: 'rgba(74, 103, 65, 0.1)', color: 'var(--color-success)' };
      default:
        return { backgroundColor: 'rgba(17, 17, 17, 0.1)', color: 'var(--color-text-primary)' };
    }
  }
}

// Initialize status manager
window.statusManager = new StatusManager();
