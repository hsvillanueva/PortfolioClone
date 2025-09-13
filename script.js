const GITHUB_USERNAME = 'hsvillanueva';
const projectsContainer = document.getElementById('projects-container');

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
        header.style.background = '#0d1117';
    } else {
        header.style.background = '#161b22';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubProjects();
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
    document.querySelector('.about p').textContent = personalInfo.description;
    
    const socialLinks = document.querySelectorAll('.social-links a');
    socialLinks[0].href = personalInfo.github; 
    socialLinks[1].href = personalInfo.linkedin;
    socialLinks[2].href = `mailto:${personalInfo.email}`;
}

document.addEventListener('DOMContentLoaded', () => {
    updatePersonalInfo();
    
    const profileImg = document.getElementById('profile-img');
    profileImg.addEventListener('error', function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'profile-placeholder';
        placeholder.innerHTML = '<i class="fas fa-user"></i>';
        this.parentNode.appendChild(placeholder);
    });
});
