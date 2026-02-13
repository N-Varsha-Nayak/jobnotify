// Digest Manager

class DigestManager {
  constructor() {
    this.today = this.getTodayDateString();
  }

  getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getDigestKey(dateString) {
    const date = dateString || this.today;
    return `jobTrackerDigest_${date}`;
  }

  generateDigest() {
    // Update today's date
    this.today = this.getTodayDateString();
    
    // Check if digest already exists for today
    const existingDigest = this.getTodayDigest();
    if (existingDigest) {
      return existingDigest;
    }

    // Check if preferences are set
    if (!window.preferencesManager || !window.preferencesManager.hasPreferences()) {
      return null;
    }

    // Get all jobs with match scores
    if (!window.jobsManager) {
      return null;
    }

    // Update match scores
    window.jobsManager.updateMatchScores();
    const allJobs = [...window.jobsManager.jobs];

    // Filter jobs with match score > 0
    const matchingJobs = allJobs.filter(job => (job.matchScore || 0) > 0);

    if (matchingJobs.length === 0) {
      return { jobs: [], isEmpty: true };
    }

    // Sort by matchScore descending, then postedDaysAgo ascending
    matchingJobs.sort((a, b) => {
      const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0);
    });

    // Take top 10
    const topJobs = matchingJobs.slice(0, 10);

    const digest = {
      date: this.today,
      generatedAt: new Date().toISOString(),
      jobs: topJobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        mode: job.mode,
        experience: job.experience,
        matchScore: job.matchScore || 0,
        salaryRange: job.salaryRange,
        applyUrl: job.applyUrl,
        postedDaysAgo: job.postedDaysAgo
      }))
    };

    // Save to localStorage
    this.saveDigest(digest);

    return digest;
  }

  getTodayDigest() {
    // Update today's date to ensure we're checking the right day
    this.today = this.getTodayDateString();
    const key = this.getDigestKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const digest = JSON.parse(stored);
        // Verify the digest is for today
        if (digest.date === this.today) {
          return digest;
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  saveDigest(digest) {
    const key = this.getDigestKey();
    localStorage.setItem(key, JSON.stringify(digest));
  }

  formatDigestAsText(digest) {
    if (!digest || !digest.jobs || digest.jobs.length === 0) {
      return 'No jobs in digest.';
    }

    // Parse YYYY-MM-DD format
    const [year, month, day] = digest.date.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let text = `Top 10 Jobs For You — 9AM Digest\n`;
    text += `${formattedDate}\n\n`;

    digest.jobs.forEach((job, index) => {
      text += `${index + 1}. ${job.title}\n`;
      text += `   Company: ${job.company}\n`;
      text += `   Location: ${job.location} (${job.mode})\n`;
      text += `   Experience: ${job.experience}\n`;
      text += `   Match Score: ${job.matchScore}\n`;
      text += `   Salary: ${job.salaryRange}\n`;
      text += `   Apply: ${job.applyUrl}\n\n`;
    });

    text += `This digest was generated based on your preferences.`;

    return text;
  }

  formatDigestAsEmailBody(digest) {
    return this.formatDigestAsText(digest);
  }
}

// Initialize digest manager
window.digestManager = new DigestManager();
