// Preferences Manager

class PreferencesManager {
  constructor() {
    this.preferences = this.loadPreferences();
  }

  loadPreferences() {
    const stored = localStorage.getItem('jobTrackerPreferences');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return this.getDefaultPreferences();
      }
    }
    return this.getDefaultPreferences();
  }

  getDefaultPreferences() {
    return {
      roleKeywords: '',
      preferredLocations: [],
      preferredMode: [],
      experienceLevel: '',
      skills: '',
      minMatchScore: 40
    };
  }

  savePreferences(prefs) {
    this.preferences = { ...this.preferences, ...prefs };
    localStorage.setItem('jobTrackerPreferences', JSON.stringify(this.preferences));
  }

  getPreferences() {
    return this.preferences;
  }

  hasPreferences() {
    const prefs = this.preferences;
    return !!(prefs.roleKeywords || 
              prefs.preferredLocations.length > 0 || 
              prefs.preferredMode.length > 0 || 
              prefs.experienceLevel || 
              prefs.skills);
  }
}

// Initialize preferences manager
window.preferencesManager = new PreferencesManager();
