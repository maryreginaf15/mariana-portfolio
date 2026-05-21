// Reveal animations on scroll
function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

window.addEventListener("scroll", reveal);

// Initial call to reveal elements already in view
document.addEventListener("DOMContentLoaded", () => {
    reveal();
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Dynamic Navbar background on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.padding = '0.5rem 0';
        nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
    } else {
        nav.style.padding = '1rem 0';
        nav.style.boxShadow = 'none';
    }
});

// Skills Toggle
function toggleSkills(type, element) {
    // Toggle active class on the clicked card
    element.classList.toggle('active');
    
    // Close other cards if open
    const allCards = document.querySelectorAll('.skill-category-card');
    allCards.forEach(card => {
        if (card !== element) {
            card.classList.remove('active');
        }
    });
}

// Mobile nav toggle
function toggleNav() {
    document.getElementById('nav-links').classList.toggle('open');
}

function closeNav() {
    document.getElementById('nav-links').classList.remove('open');
}

// Toggle Carteirinha Digital accordion
function toggleCarteirinha() {
    const content = document.getElementById('carteirinha-content');
    const btn = document.querySelector('.volunteer-collapsible-btn');
    content.classList.toggle('open');
    btn.classList.toggle('active');
    btn.setAttribute('aria-expanded', content.classList.contains('open'));
}

// Google Skills Auto-Update
const GOOGLE_SKILLS_PROFILE = 'https://www.skills.google/public_profiles/8fea051f-9ecf-4ca9-afc0-d78c95c6553e';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

function extractBadges(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const badgeElements = doc.querySelectorAll('.profile-badge');
    const badges = [];

    badgeElements.forEach(badge => {
        const img = badge.querySelector('.badge-image img');
        const title = badge.querySelector('.ql-title-medium');
        const date = badge.querySelector('.ql-body-medium');
        if (img && title) {
            badges.push({
                imgSrc: img.getAttribute('src'),
                title: title.textContent.trim(),
                date: date ? date.textContent.trim() : ''
            });
        }
    });

    return badges;
}

function extractPoints(html) {
    const match = html.match(/<strong>(\d[\d,.]*) points?<\/strong>/i);
    return match ? match[1] : null;
}

function updateGoogleSkillsUI(badges, points) {
    const grid = document.getElementById('google-badges-grid');
    const pointsEl = document.getElementById('google-points');
    const infoEl = document.getElementById('google-update-info');

    if (points && pointsEl) {
        pointsEl.textContent = points + ' pontos';
    }

    if (badges && badges.length > 0 && grid) {
        grid.innerHTML = '';
        badges.forEach(badge => {
            const card = document.createElement('div');
            card.className = 'badge-card';
            card.innerHTML = `
                <img src="${badge.imgSrc}" alt="${badge.title}" loading="lazy">
                <h4>${badge.title}</h4>
                <span class="badge-date">${badge.date}</span>
            `;
            grid.appendChild(card);
        });
    }

    if (infoEl) {
        const now = new Date();
        infoEl.textContent = 'Última atualização: ' + now.toLocaleString('pt-BR');
    }
}

async function refreshGoogleSkills() {
    const btn = document.getElementById('refresh-skills-btn');
    const infoEl = document.getElementById('google-update-info');

    if (location.protocol === 'file:') {
        if (infoEl) {
            infoEl.textContent = 'Abra via servidor HTTP (ex: VS Code Live Server) para atualizar.';
            infoEl.style.color = '#e67e22';
        }
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
    }

    try {
        const response = await fetch(CORS_PROXY + encodeURIComponent(GOOGLE_SKILLS_PROFILE), {
            signal: AbortSignal.timeout(15000)
        });
        const html = await response.text();

        const badges = extractBadges(html);
        const points = extractPoints(html);

        updateGoogleSkillsUI(badges, points);
    } catch (err) {
        if (infoEl) {
            infoEl.textContent = 'Não foi possível atualizar automaticamente. Verifique sua conexão.';
            infoEl.style.color = '#e74c3c';
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Badges';
        }
    }
}

// Try auto-update on page load (silent, only via HTTP)
document.addEventListener('DOMContentLoaded', () => {
    if (location.protocol === 'file:') return;
    setTimeout(() => {
        fetch(CORS_PROXY + encodeURIComponent(GOOGLE_SKILLS_PROFILE), {
            signal: AbortSignal.timeout(10000)
        })
            .then(r => r.text())
            .then(html => {
                const badges = extractBadges(html);
                const points = extractPoints(html);
                if (badges.length > 0) {
                    updateGoogleSkillsUI(badges, points);
                }
            })
            .catch(() => {});
    }, 2000);
});
