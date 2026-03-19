// =============================================
// SARDAR RDX TOOLS - Main JavaScript
// Interactive Features & Animations
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functions
    initLoader();
    initNavigation();
    initSearch();
    initFilter();
    initScrollTop();
    initCounterAnimation();
    initCardHover();
});

/* =============================================
   LOADER
   ============================================= */
function initLoader() {
    const loader = document.getElementById('loader');

    // Hide loader after page load
    window.addEventListener('load', function () {
        setTimeout(function () {
            loader.classList.add('hidden');
        }, 2500);
    });

    // Fallback hide
    setTimeout(function () {
        loader.classList.add('hidden');
    }, 3000);
}

/* =============================================
   NAVIGATION
   ============================================= */
function initNavigation() {
    const nav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // Scroll effect
    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');

        // Animate hamburger
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close mobile menu on link click
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function () {
        const scrollY = window.pageYOffset;

        sections.forEach(function (section) {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(function (link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}

/* =============================================
   SEARCH FUNCTIONALITY
   ============================================= */
function initSearch() {
    const searchInput = document.getElementById('toolSearch');
    const toolCards = document.querySelectorAll('.tool-card');

    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();

            toolCards.forEach(function (card) {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const description = card.querySelector('.card-description').textContent.toLowerCase();
                const features = card.querySelector('.card-features').textContent.toLowerCase();

                if (title.includes(searchTerm) || description.includes(searchTerm) || features.includes(searchTerm)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });

            // Show no results message
            const visibleCards = Array.from(toolCards).filter(card => card.style.display !== 'none');
            const noResultsMsg = document.getElementById('noResultsMessage');

            if (visibleCards.length === 0 && searchTerm !== '') {
                if (!noResultsMsg) {
                    const msg = document.createElement('div');
                    msg.id = 'noResultsMessage';
                    msg.className = 'no-results';
                    msg.innerHTML = '<p>No tools found matching your search.</p>';
                    msg.style.cssText = 'text-align: center; padding: 2rem; color: #a0a0a0;';
                    document.getElementById('toolsGrid').appendChild(msg);
                }
            } else if (noResultsMsg) {
                noResultsMsg.remove();
            }
        });
    }
}

/* =============================================
   FILTER BUTTONS
   ============================================= */
function initFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            // Remove active class from all
            filterBtns.forEach(function (b) {
                b.classList.remove('active');
            });

            // Add active class to clicked
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');

            toolCards.forEach(function (card) {
                const category = card.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });

            // Clear search
            const searchInput = document.getElementById('toolSearch');
            if (searchInput) {
                searchInput.value = '';
            }

            // Remove no results message
            const noResultsMsg = document.getElementById('noResultsMessage');
            if (noResultsMsg) {
                noResultsMsg.remove();
            }
        });
    });
}

/* =============================================
   SCROLL TO TOP
   ============================================= */
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTop');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* =============================================
   COUNTER ANIMATION
   ============================================= */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number');

    const animateCounter = function (counter) {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = function () {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    };

    // Intersection Observer for counter animation
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.stat-number');
                counters.forEach(function (counter) {
                    if (!counter.classList.contains('animated')) {
                        counter.classList.add('animated');
                        animateCounter(counter);
                    }
                });
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        observer.observe(heroStats);
    }
}

/* =============================================
   CARD HOVER EFFECTS
   ============================================= */
function initCardHover() {
    const toolCards = document.querySelectorAll('.tool-card');

    toolCards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

/* =============================================
   PARALLAX EFFECT
   ============================================= */
document.addEventListener('mousemove', function (e) {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach(function (card, index) {
        const speed = (index + 1) * 0.5;
        card.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
    });
});

/* =============================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
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

/* =============================================
   KEYBOARD NAVIGATION
   ============================================= */
document.addEventListener('keydown', function (e) {
    // Escape key to close mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');

        if (navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    }
});

/* =============================================
   PERFORMANCE OPTIMIZATION
   ============================================= */
// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(function (img) {
        imageObserver.observe(img);
    });
}

// Preload critical resources
const resources = [
    'assets/css/style.css',
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap'
];

resources.forEach(function (href) {
    const link = document.createElement('link');
    link.rel = 'preload';
    if (href.startsWith('http')) {
        link.as = 'font';
        link.crossorigin = 'anonymous';
    } else {
        link.as = 'style';
    }
    link.href = href;
    document.head.appendChild(link);
});
