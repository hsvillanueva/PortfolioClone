const GITHUB_USERNAME = 'hsvillanueva';
const projectsContainer = document.getElementById('projects-container');

// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggle.querySelector('i');
        this.themeText = this.themeToggle.querySelector('span');
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }
    
    init() {
        this.setTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        if (theme === 'light') {
            this.themeIcon.className = 'fas fa-sun';
            this.themeText.textContent = 'Light';
        } else {
            this.themeIcon.className = 'fas fa-moon';
            this.themeText.textContent = 'Dark';
        }
        
        localStorage.setItem('theme', theme);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// Editable Content Manager
class EditableManager {
    constructor() {
        this.editBtn = document.getElementById('edit-about-btn');
        this.saveBtn = document.getElementById('save-about-btn');
        this.cancelBtn = document.getElementById('cancel-about-btn');
        this.aboutContent = document.getElementById('about-description');
        this.saveCancelButtons = document.getElementById('save-cancel-buttons');
        this.originalContent = '';
        this.isEditing = false;
        
        this.init();
    }
    
    init() {
        this.editBtn.addEventListener('click', () => this.startEditing());
        this.saveBtn.addEventListener('click', () => this.saveChanges());
        this.cancelBtn.addEventListener('click', () => this.cancelEditing());
        
        // Handle Enter key to save
        this.aboutContent.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.saveChanges();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                this.cancelEditing();
            }
        });
    }
    
    startEditing() {
        this.isEditing = true;
        // Store both text and HTML content for proper restoration
        this.originalContent = this.aboutContent.innerHTML;
        
        this.aboutContent.contentEditable = true;
        this.aboutContent.classList.add('editing');
        this.aboutContent.focus();
        
        this.editBtn.style.display = 'none';
        this.saveCancelButtons.classList.add('show');
        
        // Place cursor at end of content
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(this.aboutContent);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    
    saveChanges() {
        // Get the HTML content to preserve formatting
        let htmlContent = this.aboutContent.innerHTML.trim();
        
        // Convert <div> and <br> tags to line breaks for display
        let textContent = htmlContent
            .replace(/<div>/g, '\n')
            .replace(/<\/div>/g, '')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/<[^>]*>/g, '') // Remove any other HTML tags
            .trim();
        
        if (textContent === '') {
            alert('Content cannot be empty!');
            return;
        }
        
        // Save both HTML and text versions
        localStorage.setItem('aboutContentHTML', htmlContent);
        localStorage.setItem('aboutContent', textContent);
        
        // Show save instructions with the clean text version
        this.showSaveInstructions(textContent);
        
        this.finishEditing();
    }
    
    showSaveInstructions(content) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 30px;
            max-width: 600px;
            margin: 20px;
            color: var(--text-primary);
        `;
        
        modalContent.innerHTML = `
            <h3 style="color: var(--accent-color); margin-bottom: 20px;">
                <i class="fas fa-save"></i> Save Changes Permanently
            </h3>
            <p style="margin-bottom: 20px; color: var(--text-secondary);">
                To make this change permanent on GitHub Pages, you need to update your code:
            </p>
            <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid var(--accent-color);">
                <p style="margin-bottom: 10px; font-weight: 500;">1. Open <code>script.js</code> and find the <code>updatePersonalInfo()</code> function</p>
                <p style="margin-bottom: 10px;">2. Update the <code>description</code> field with:</p>
                <textarea readonly style="width: 100%; height: 120px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 4px; padding: 10px; font-family: monospace; resize: none; white-space: pre-wrap;">${content}</textarea>
                <p style="margin-top: 10px;">3. Commit and push the changes to GitHub</p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
                <button id="close-modal" style="background: var(--accent-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                    Got it!
                </button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        modal.querySelector('#close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    cancelEditing() {
        // Restore the original HTML content
        this.aboutContent.innerHTML = this.originalContent;
        this.finishEditing();
        this.showFeedback('Changes cancelled', 'info');
    }
    
    finishEditing() {
        this.isEditing = false;
        this.aboutContent.contentEditable = false;
        this.aboutContent.classList.remove('editing');
        
        this.editBtn.style.display = 'inline-flex';
        this.saveCancelButtons.classList.remove('show');
    }
    
    showFeedback(message, type) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        if (type === 'success') {
            feedback.style.backgroundColor = 'var(--accent-color)';
            feedback.style.color = 'white';
        } else {
            feedback.style.backgroundColor = 'var(--bg-tertiary)';
            feedback.style.color = 'var(--text-primary)';
            feedback.style.border = '1px solid var(--border-color)';
        }
        
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        // Animate in
        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(100%)';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }
    
    loadSavedContent() {
        // Try to load HTML content first (preserves formatting), fallback to text
        const savedHTMLContent = localStorage.getItem('aboutContentHTML');
        const savedTextContent = localStorage.getItem('aboutContent');
        
        if (savedHTMLContent) {
            this.aboutContent.innerHTML = savedHTMLContent;
        } else if (savedTextContent) {
            // Convert text line breaks to HTML for display
            const htmlContent = savedTextContent.replace(/\n/g, '<br>');
            this.aboutContent.innerHTML = htmlContent;
        }
    }
}

async function fetchGitHubProjects() {
    try {
        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12&type=all`);
        
        if (!reposResponse.ok) {
            throw new Error(`HTTP error! status: ${reposResponse.status}`);
        }
        
        const repos = await reposResponse.json();
        const orgsResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/orgs`);
        let orgRepos = [];
        
        if (orgsResponse.ok) {
            const orgs = await orgsResponse.json();
            for (const org of orgs.slice(0, 3)) {
                try {
                    const orgReposResponse = await fetch(`https://api.github.com/orgs/${org.login}/repos?sort=updated&per_page=10`);
                    if (orgReposResponse.ok) {
                        const orgReposData = await orgReposResponse.json();
                        const recentOrgRepos = orgReposData.filter(repo => 
                            repo.description && 
                            new Date(repo.updated_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                        );
                        orgRepos.push(...recentOrgRepos);
                    }
                } catch (error) {
                    console.log(`Could not fetch repos for org ${org.login}:`, error);
                }
            }
        }
        let searchContributions = [];
        try {
            const contributionsResponse = await fetch(`https://api.github.com/search/repositories?q=committer:${GITHUB_USERNAME}+is:public&sort=updated&per_page=6`);
            if (contributionsResponse.ok) {
                const contributionsData = await contributionsResponse.json();
                searchContributions = contributionsData.items || [];
            }
        } catch (error) {
            console.log('Search API failed:', error);
        }
        const allRepos = [...repos, ...orgRepos, ...searchContributions];
        const uniqueRepos = allRepos.filter((repo, index, self) => 
            index === self.findIndex(r => r.id === repo.id)
        );
        
        const processedRepos = uniqueRepos.map(repo => {
            const isOwned = repo.owner.login === GITHUB_USERNAME;
            const isFork = repo.fork;
            const isOrgRepo = !isOwned && !isFork && orgRepos.some(orgRepo => orgRepo.id === repo.id);
            
            return {
                ...repo,
                isExternalContribution: !isOwned && !isFork && !isOrgRepo,
                isOrgContribution: isOrgRepo
            };
        });

        const filteredRepos = processedRepos
            .filter(repo => repo.description)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
        displayProjects(filteredRepos);
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        displayError();
    }
}

function displayProjects(projects) {
    if (projects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="error">
                <h3>No projects found</h3>
                <p>Please check your GitHub username in the script.js file</p>
            </div>
        `;
        return;
    }

    const existingButtonSection = document.querySelector('.projects-button-section');
    if (existingButtonSection) {
        existingButtonSection.remove();
    }

    const initialProjects = projects.slice(0, 6);
    const remainingProjects = projects.slice(6);
    const initialProjectsHTML = initialProjects.map(project => generateProjectHTML(project)).join('');
    
    projectsContainer.innerHTML = `
        <div class="projects-grid" id="main-projects-grid">
            ${initialProjectsHTML}
        </div>
        <div class="projects-grid" id="additional-projects-grid" style="display: none;">
        </div>
    `;
    
    if (remainingProjects.length > 0) {
        const additionalProjectsHTML = remainingProjects.map(project => generateProjectHTML(project)).join('');
        document.getElementById('additional-projects-grid').innerHTML = additionalProjectsHTML;
        const buttonSection = document.createElement('div');
        buttonSection.className = 'projects-button-section';
        buttonSection.innerHTML = `
            <button id="show-more-btn" class="show-more-btn">
                <span class="btn-text">Show ${remainingProjects.length} More Projects</span>
                <i class="fas fa-chevron-down btn-icon"></i>
            </button>
        `;
        
        projectsContainer.parentNode.insertBefore(buttonSection, projectsContainer.nextSibling);
        const showMoreBtn = document.getElementById('show-more-btn');
        const additionalProjects = document.getElementById('additional-projects-grid');
        let isExpanded = false;
        
        showMoreBtn.addEventListener('click', () => {
            if (!isExpanded) {
                additionalProjects.style.display = 'grid';
                showMoreBtn.querySelector('.btn-text').textContent = 'Show Less';
                showMoreBtn.querySelector('.btn-icon').classList.replace('fa-chevron-down', 'fa-chevron-up');
                isExpanded = true;
            } else {
                additionalProjects.style.display = 'none';
                showMoreBtn.querySelector('.btn-text').textContent = `Show ${remainingProjects.length} More Projects`;
                showMoreBtn.querySelector('.btn-icon').classList.replace('fa-chevron-up', 'fa-chevron-down');
                isExpanded = false;
            }
        });
    }
}

function generateProjectHTML(project) {
    const isOrganization = project.owner.type === 'Organization';
    const contributionBadge = isOrganization ? 
        `<span class="contribution-badge organization">
            Organization Project
        </span>` : 
        `<span class="contribution-badge personal">
            Personal Project
        </span>`;
    
    const ownerDisplay = project.owner.login !== 'RegenXYZ' ? 
        `<div class="project-owner">by ${project.owner.login}</div>` : '';
    
    return `
        <a href="${project.html_url}" target="_blank" class="project-card">
            <div class="project-header">
                <div class="project-title-section">
                    <i class="fas fa-code-branch project-icon"></i>
                    <div>
                        <h3 class="project-title">${project.name}</h3>
                        ${ownerDisplay}
                    </div>
                </div>
                ${contributionBadge}
            </div>
            
            <p class="project-description">
                ${project.description || 'A Debate Tabbing Web Application made for the Timber City Academy Debate League.'}
            </p>
            
            <div class="project-footer">
                ${project.language ? `
                    <div class="project-language">
                        <span class="language-color" style="background-color: ${getLanguageColor(project.language)};"></span>
                        ${project.language}
                    </div>
                ` : '<div class="project-language"><span class="language-color" style="background-color: #ccc;"></span>N/A</div>'}
                
                <div class="project-stars">
                    <i class="fas fa-star"></i>
                    ${project.stargazers_count}
                </div>
                
                <div class="project-forks">
                    <i class="fas fa-code-branch"></i>
                    ${project.forks_count}
                </div>
            </div>
        </a>
    `;
}

function getLanguageColor(language) {
    const languageColors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#1572B6',
        'TypeScript': '#2b7489',
        'C++': '#f34b7d',
        'C': '#555555',
        'C#': '#239120',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33',
        'Dart': '#00B4AB',
        'Shell': '#89e051',
        'Vue': '#2c3e50',
        'React': '#61dafb',
        'Angular': '#dd0031'
    };
    return languageColors[language] || '#8b949e';
}

function displayError() {
    projectsContainer.innerHTML = `
        <div class="error">
            <h3>Oops! Something went wrong</h3>
            <p>Unable to fetch projects from GitHub. Please check:</p>
            <ul style="text-align: left; margin-top: 10px;">
                <li>Your internet connection</li>
                <li>The GitHub username in script.js</li>
                <li>GitHub API rate limits</li>
            </ul>
        </div>
    `;
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (window.scrollY > 50) {
        header.style.background = currentTheme === 'light' ? 'var(--bg-primary)' : '#0d1117';
    } else {
        header.style.background = 'var(--bg-secondary)';
    }
});

function updatePersonalInfo() {
    const personalInfo = {
        name: "Hannah Villanueva",
        title: "Developer in Progress",
        description: "I am Hannah Sophia L. Villanueva, a 3rd year BS Computer Science student at Caraga State University - Main Campus. I specialize in Python programming and designing UX/UI interfaces for websites. Currently learning frameworks like React, Django and Flask to enhance my web development skills.",
        email: "hslvillanueva@gmail.com",
        linkedin: "https://www.linkedin.com/in/hannahsophiavillanueva/",
        github: `https://github.com/hsvillanueva`
    };
    
    document.querySelector('.hero-content h1').textContent = `> ${personalInfo.name}`;
    document.querySelector('.hero-content p').textContent = personalInfo.title;
    
    // Set initial about content
    const aboutContent = document.getElementById('about-description');
    const savedHTMLContent = localStorage.getItem('aboutContentHTML');
    const savedTextContent = localStorage.getItem('aboutContent');
    
    if (savedHTMLContent) {
        aboutContent.innerHTML = savedHTMLContent;
    } else if (savedTextContent) {
        // Convert text line breaks to HTML for display
        const htmlContent = savedTextContent.replace(/\n/g, '<br>');
        aboutContent.innerHTML = htmlContent;
    } else {
        aboutContent.textContent = personalInfo.description;
    }
    
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks[0].href = personalInfo.github; 
    socialLinks[1].href = personalInfo.linkedin;
    socialLinks[2].href = `mailto:${personalInfo.email}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager
    new ThemeManager();
    
    // Initialize editable manager
    new EditableManager();
    
    updatePersonalInfo();
    fetchGitHubProjects();
    
    const profileImg = document.getElementById('profile-img');
    profileImg.addEventListener('error', function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'profile-placeholder';
        placeholder.innerHTML = '<i class="fas fa-user"></i>';
        this.parentNode.appendChild(placeholder);
    });
});
