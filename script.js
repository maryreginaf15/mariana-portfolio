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
    const btn = document.getElementById('carteirinha-btn');
    content.classList.toggle('open');
    btn.classList.toggle('active');
    btn.setAttribute('aria-expanded', content.classList.contains('open'));
}

// Toggle Faltas-Alunos accordion
function toggleFaltasAlunos() {
    const content = document.getElementById('faltas-alunos-content');
    const btn = document.getElementById('faltas-alunos-btn');
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

// ==========================================
// Lógica da Galeria e Lightbox (Carteirinhas)
// ==========================================

// Array contendo a sequência exata de imagens das carteirinhas
const carteirinhaImages = [
    'assets/01.JPG',
    'assets/02.JPG',
    'assets/03.JPG',
    'assets/04.JPG',
    'assets/05.JPG',
    'assets/06.JPG',
    'assets/07.PNG',
    'assets/08.JPG'
];

let currentLightboxIndex = 0;

// Rolagem suave do carrossel horizontal de miniaturas
function scrollGallery(direction) {
    const track = document.getElementById('carteirinha-gallery');
    if (track) {
        // Rola 240px em média (cerca de duas miniaturas por clique)
        const scrollAmount = 240 * direction;
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Abrir a imagem em tela cheia (modal Lightbox)
function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('lightbox-caption');
    
    if (lightbox && lightboxImg) {
        currentLightboxIndex = index;
        lightboxImg.src = carteirinhaImages[index];
        if (captionText) {
            captionText.innerHTML = `Tela ${index + 1} de ${carteirinhaImages.length}`;
        }
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Evita rolagem da página de fundo
    }
}

// Fechar o visualizador de imagens
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; // Restaura a rolagem da página
    }
}

// Navegar entre as fotos dentro do lightbox
function changeLightboxImage(direction) {
    currentLightboxIndex += direction;
    if (currentLightboxIndex >= carteirinhaImages.length) {
        currentLightboxIndex = 0; // Volta para o início
    } else if (currentLightboxIndex < 0) {
        currentLightboxIndex = carteirinhaImages.length - 1; // Vai para o fim
    }
    
    const lightboxImg = document.getElementById('lightbox-img');
    const captionText = document.getElementById('lightbox-caption');
    if (lightboxImg) {
        // Efeito rápido de fade ao trocar de imagem
        lightboxImg.style.opacity = '0.3';
        setTimeout(() => {
            lightboxImg.src = carteirinhaImages[currentLightboxIndex];
            if (captionText) {
                captionText.innerHTML = `Tela ${currentLightboxIndex + 1} de ${carteirinhaImages.length}`;
            }
            lightboxImg.style.opacity = '1';
        }, 100);
    }
}

// Ouvintes de evento adicionais para interatividade amigável
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('lightbox');
    
    // Fechar lightbox ao clicar fora da imagem
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-container')) {
                closeLightbox();
            }
        });
    }
    
    // Suporte ao teclado (Esc para fechar, setas para navegar)
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                changeLightboxImage(-1);
            } else if (e.key === 'ArrowRight') {
                changeLightboxImage(1);
            }
        }
    });
});

