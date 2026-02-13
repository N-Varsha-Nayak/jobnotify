// Match Score Engine

class MatchScorer {
  constructor() {
    this.preferences = null;
  }

  init() {
    // Initialize with preferences if available (called after preferencesManager is ready)
    if (window.preferencesManager) {
      this.preferences = window.preferencesManager.getPreferences();
    }
  }

  updatePreferences(preferences) {
    this.preferences = preferences;
  }

  calculateMatchScore(job) {
    if (!this.preferences || !window.preferencesManager.hasPreferences()) {
      return 0;
    }

    let score = 0;
    const prefs = this.preferences;

    // +25 if any roleKeyword appears in job.title (case-insensitive)
    if (prefs.roleKeywords) {
      const keywords = prefs.roleKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      const titleLower = job.title.toLowerCase();
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        score += 25;
      }
    }

    // +15 if any roleKeyword appears in job.description
    if (prefs.roleKeywords) {
      const keywords = prefs.roleKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      const descLower = job.description.toLowerCase();
      if (keywords.some(keyword => descLower.includes(keyword))) {
        score += 15;
      }
    }

    // +15 if job.location matches preferredLocations
    if (prefs.preferredLocations && prefs.preferredLocations.length > 0) {
      if (prefs.preferredLocations.includes(job.location)) {
        score += 15;
      }
    }

    // +10 if job.mode matches preferredMode
    if (prefs.preferredMode && prefs.preferredMode.length > 0) {
      if (prefs.preferredMode.includes(job.mode)) {
        score += 10;
      }
    }

    // +10 if job.experience matches experienceLevel
    if (prefs.experienceLevel && job.experience === prefs.experienceLevel) {
      score += 10;
    }

    // +15 if overlap between job.skills and user.skills (any match)
    if (prefs.skills) {
      const userSkills = prefs.skills.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
      const jobSkills = job.skills.map(s => s.toLowerCase());
      if (userSkills.some(skill => jobSkills.some(js => js.includes(skill) || skill.includes(js)))) {
        score += 15;
      }
    }

    // +5 if postedDaysAgo <= 2
    if (job.postedDaysAgo <= 2) {
      score += 5;
    }

    // +5 if source is LinkedIn
    if (job.source === 'LinkedIn') {
      score += 5;
    }

    // Cap score at 100
    return Math.min(score, 100);
  }

  getScoreBadgeClass(score) {
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    if (score >= 40) return 'badge-default';
    return 'badge-default';
  }

  getScoreBadgeStyle(score) {
    if (score >= 80) return { backgroundColor: 'rgba(74, 103, 65, 0.1)', color: 'var(--color-success)' };
    if (score >= 60) return { backgroundColor: 'rgba(184, 134, 11, 0.1)', color: 'var(--color-warning)' };
    if (score >= 40) return { backgroundColor: 'rgba(17, 17, 17, 0.1)', color: 'var(--color-text-primary)' };
    return { backgroundColor: 'rgba(17, 17, 17, 0.05)', color: 'rgba(17, 17, 17, 0.5)' };
  }
}

// Initialize match scorer
window.matchScorer = new MatchScorer();

// Initialize after DOM is ready to ensure preferencesManager exists
document.addEventListener('DOMContentLoaded', () => {
  if (window.matchScorer && window.preferencesManager) {
    window.matchScorer.init();
  }
});
