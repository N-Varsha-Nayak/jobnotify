// Proof Manager

class ProofManager {
  constructor() {
    this.artifactsKey = 'jobTrackerProofArtifacts';
    this.steps = [
      { id: 'step1', label: 'Landing page with CTA' },
      { id: 'step2', label: 'Dashboard with job cards and filters' },
      { id: 'step3', label: 'Settings and preferences' },
      { id: 'step4', label: 'Saved jobs' },
      { id: 'step5', label: 'Daily digest' },
      { id: 'step6', label: 'Status tracking' },
      { id: 'step7', label: 'Test checklist' },
      { id: 'step8', label: 'Proof and submission' }
    ];
  }

  getArtifacts() {
    const stored = localStorage.getItem(this.artifactsKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return this.getDefaultArtifacts();
      }
    }
    return this.getDefaultArtifacts();
  }

  getDefaultArtifacts() {
    return {
      projectLink: '',
      githubLink: '',
      deployedUrl: ''
    };
  }

  setArtifacts(artifacts) {
    const current = this.getArtifacts();
    const updated = { ...current, ...artifacts };
    localStorage.setItem(this.artifactsKey, JSON.stringify(updated));
    return updated;
  }

  setArtifact(key, value) {
    const artifacts = this.getArtifacts();
    artifacts[key] = value;
    localStorage.setItem(this.artifactsKey, JSON.stringify(artifacts));
    return artifacts;
  }

  isValidUrl(value) {
    if (!value || typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    try {
      const url = new URL(trimmed);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  allLinksProvided() {
    const a = this.getArtifacts();
    return this.isValidUrl(a.projectLink) &&
           this.isValidUrl(a.githubLink) &&
           this.isValidUrl(a.deployedUrl);
  }

  getShipStatus() {
    const allTestsPassed = window.testManager ? window.testManager.getAllTestsPassed() : false;
    const allLinksProvided = this.allLinksProvided();

    if (allLinksProvided && allTestsPassed) {
      return 'Shipped';
    }
    const hasAnyProgress = allTestsPassed || allLinksProvided ||
      (window.testManager && window.testManager.getPassedCount() > 0) ||
      this.getArtifacts().projectLink ||
      this.getArtifacts().githubLink ||
      this.getArtifacts().deployedUrl;
    return hasAnyProgress ? 'In Progress' : 'Not Started';
  }

  getFormattedSubmission() {
    const a = this.getArtifacts();
    return `------------------------------------------
Job Notification Tracker — Final Submission

Project:
${a.projectLink || '[Not provided]'}

GitHub Repository:
${a.githubLink || '[Not provided]'}

Live Deployment:
${a.deployedUrl || '[Not provided]'}

Core Features:
- Intelligent match scoring
- Daily digest simulation
- Status tracking
- Test checklist enforced
------------------------------------------`;
  }

  getSteps() {
    return this.steps;
  }

  getStepCompletionStatus() {
    const hasProofLinks = this.allLinksProvided();
    const allTestsPassed = window.testManager ? window.testManager.getAllTestsPassed() : false;

    return this.steps.map((step, index) => {
      const isLastStep = index === this.steps.length - 1;
      const completed = isLastStep ? (hasProofLinks && allTestsPassed) : true;
      return { ...step, status: completed ? 'Completed' : 'Pending' };
    });
  }
}

window.proofManager = new ProofManager();
