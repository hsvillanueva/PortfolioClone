const GITHUB_USERNAME = 'hsvillanueva';
const projectsContainer = document.getElementById('projects-container');

let personalData = {};

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(themeIcon, currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(themeIcon, newTheme);
    });
}

function updateThemeIcon(icon, theme) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

async function loadPersonalData() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error('Failed to load personal data');
        }
        personalData = await response.json();
        
        loadSavedData();
        updatePersonalInfo();
    } catch (error) {
        console.error('Error loading personal data:', error);
        personalData = {
            personalInfo: {
                name: "Hannah Villanueva",
                title: "Developer in Progress",
                bio: "I am Hannah Sophia L. Villanueva, a 3rd year BS Computer Science student at Caraga State University - Main Campus. I specialize in Python programming and designing UX/UI interfaces for websites. Currently learning frameworks like React, Django and Flask to enhance my web development skills.",
                email: "hslvillanueva@gmail.com",
                linkedin: "https://www.linkedin.com/in/hannahsophiavillanueva/",
                github: "https://github.com/hsvillanueva"
            }
        };
        
        loadSavedData();
        updatePersonalInfo();
    }
}

function updatePersonalInfo() {
    const info = personalData.personalInfo;
    
    document.getElementById('hero-name').textContent = `> ${info.name}`;
    document.getElementById('hero-title').textContent = info.title;
    
    const aboutElement = document.getElementById('about-description');
    aboutElement.innerHTML = formatTextWithLineBreaks(info.bio);
    
    const socialLinks = document.querySelectorAll('.social-links a');
    if (socialLinks.length >= 3) {
        socialLinks[0].href = info.github;
        socialLinks[1].href = info.linkedin;
        socialLinks[2].href = `mailto:${info.email}`;
    }
}

function formatTextWithLineBreaks(text) {
    return text.replace(/\n/g, '<br>');
}

function getPlainTextFromElement(element) {
    return element.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
}

function initEditableSection() {
    const editBtn = document.getElementById('edit-about-btn');
    const aboutText = document.getElementById('about-description');
    const aboutEditor = document.getElementById('about-editor');
    const aboutTextarea = document.getElementById('about-textarea');
    const saveBtn = document.getElementById('save-about-btn');
    const cancelBtn = document.getElementById('cancel-about-btn');
    
    let originalText = '';
    let isEditing = false;
    
    editBtn.addEventListener('click', () => {
        if (!isEditing) {
            startEditing();
        }
    });
    
    saveBtn.addEventListener('click', () => {
        saveChanges();
    });
    
    cancelBtn.addEventListener('click', () => {
        cancelEditing();
    });
    
    aboutTextarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            saveChanges();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            cancelEditing();
        }
    });
    
    function startEditing() {
        isEditing = true;
        originalText = getPlainTextFromElement(aboutText);
        aboutTextarea.value = originalText;
        
        aboutText.style.display = 'none';
        aboutEditor.style.display = 'block';
        editBtn.style.opacity = '0.5';
        editBtn.disabled = true;
        
        aboutTextarea.focus();
        aboutTextarea.setSelectionRange(aboutTextarea.value.length, aboutTextarea.value.length);
    }
    
    function saveChanges() {
        const newText = aboutTextarea.value;
        
        if (newText) {
            console.log('Saving changes...');
            console.log('Original:', originalText);
            console.log('New:', newText);
            
            personalData.personalInfo.bio = newText;
            
            localStorage.setItem('personalData', JSON.stringify(personalData));
            console.log('Saved to localStorage:', localStorage.getItem('personalData'));
            
            aboutText.innerHTML = formatTextWithLineBreaks(newText);
            
            showNotification('Changes saved successfully! (Changes persist in your browser)', 'success');
        } else {
            showNotification('Cannot save empty content', 'error');
        }
        
        finishEditing();
    }
    
    function cancelEditing() {
        aboutTextarea.value = originalText;
        finishEditing();
    }
    
    function finishEditing() {
        isEditing = false;
        aboutText.style.display = 'block';
        aboutEditor.style.display = 'none';
        editBtn.style.opacity = '1';
        editBtn.disabled = false;
    }
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 80px;
                right: 20px;
                background: var(--accent-color);
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1001;
                animation: slideInRight 0.3s ease;
                max-width: 350px;
                word-wrap: break-word;
            }
            
            .notification-success {
                background: var(--accent-color);
            }
            
            .notification-error {
                background: var(--error-color);
            }
            
            .notification-content {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 0.9rem;
                font-weight: 500;
                line-height: 1.4;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @media (max-width: 768px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 4000);
}

function loadSavedData() {
    const savedData = localStorage.getItem('personalData');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            personalData = {
                ...personalData,
                personalInfo: {
                    ...personalData.personalInfo,
                    ...parsedData.personalInfo
                }
            };
            console.log('Loaded saved data from localStorage:', parsedData);
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    } else {
        console.log('No saved data found in localStorage');
    }
}

function clearSavedData() {
    localStorage.removeItem('personalData');
    localStorage.removeItem('theme');
    console.log('Cleared all saved data');
    location.reload();
}

function checkSavedData() {
    const savedData = localStorage.getItem('personalData');
    const theme = localStorage.getItem('theme');
    console.log('Personal Data:', savedData);
    console.log('Theme:', theme);
    return { personalData: savedData, theme: theme };
}

window.clearSavedData = clearSavedData;
window.checkSavedData = checkSavedData;

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
    if (window.scrollY > 50) {
        header.style.background = 'var(--bg-primary)';
    } else {
        header.style.background = 'var(--bg-secondary)';
    }
});

function initProfileImage() {
    const profileImg = document.getElementById('profile-img');
    profileImg.addEventListener('error', function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'profile-placeholder';
        placeholder.innerHTML = '<i class="fas fa-user"></i>';
        this.parentNode.appendChild(placeholder);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    loadPersonalData();
    initEditableSection();
    initProfileImage();
    fetchGitHubProjects();
});
