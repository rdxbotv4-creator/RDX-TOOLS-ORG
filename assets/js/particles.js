// =============================================
// SARDAR RDX TOOLS - Particles.js Config
// Interactive Particle Background
// =============================================

// Particle.js Configuration
particlesJS('particles-js', {
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: ['#00ffff', '#9d00ff', '#00ff9d', '#ffffff']
        },
        shape: {
            type: 'circle',
            stroke: {
                width: 0,
                color: '#000000'
            },
            polygon: {
                nb_sides: 5
            },
            image: {
                src: 'img/github.svg',
                width: 100,
                height: 100
            }
        },
        opacity: {
            value: 0.5,
            random: true,
            anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
            }
        },
        size: {
            value: 3,
            random: true,
            anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
            }
        },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#00ffff',
            opacity: 0.2,
            width: 1
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
                enable: true,
                rotateX: 600,
                rotateY: 600
            }
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: true,
                mode: ['grab', 'bubble']
            },
            onclick: {
                enable: true,
                mode: 'push'
            },
            resize: true
        },
        modes: {
            grab: {
                distance: 140,
                line_linked: {
                    opacity: 0.5
                }
            },
            bubble: {
                distance: 200,
                size: 10,
                duration: 2,
                opacity: 0.5,
                speed: 3
            },
            repulse: {
                distance: 100,
                duration: 0.4
            },
            push: {
                particles_nb: 4
            },
            remove: {
                particles_nb: 2
            }
        },
        mouse: {
            distance: 100,
            position: {
                x: 0,
                y: 0
            }
        }
    },
    retina_detect: true,
    fps_limit: 60,
    interactivity: {
        events: {
            onhover: {
                enable: true,
                mode: 'grab'
            },
            onclick: {
                enable: true,
                mode: 'push'
            }
        },
        modes: {
            grab: {
                distance: 100,
                line_linked: {
                    opacity: 0.3
                }
            }
        }
    }
});

// Custom Particle Effects
document.addEventListener('DOMContentLoaded', function () {
    // Mouse interaction with particles
    const particlesCanvas = document.getElementById('particles-js');

    // Add custom glow effect on mouse move
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Create ripple effect
        createRipple(e.clientX, e.clientY);
    });

    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, transparent 70%);
            pointer-events: none;
            z-index: 9998;
            animation: rippleEffect 1s ease-out forwards;
        `;

        document.body.appendChild(ripple);

        setTimeout(function () {
            ripple.remove();
        }, 1000);
    }

    // Add ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(50);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Add connecting lines effect
    const canvas = document.querySelector('#particles-js canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        // Store particle positions
        let particles = [];

        // Override draw function to add custom effects
        const originalDraw = ctx.draw.bind(ctx);
    }
});

// Additional custom particle animation
function initCustomParticles() {
    const container = document.getElementById('particles-js');

    // Create floating particles manually for extra effect
    for (let i = 0; i < 20; i++) {
        createFloatingParticle();
    }
}

function createFloatingParticle() {
    const particle = document.createElement('div');
    particle.className = 'custom-particle';

    const size = Math.random() * 5 + 2;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const duration = Math.random() * 10 + 10;
    const delay = Math.random() * 5;

    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        animation: floatParticle ${duration}s linear ${delay}s infinite;
    `;

    document.body.appendChild(particle);
}

// Add floating particle animation
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes floatParticle {
        0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

// Initialize custom particles after main particles
setTimeout(initCustomParticles, 1000);

// Starfield effect for hero section
function createStarfield() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 2 + 1;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;

        star.style.cssText = `
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            background: #fff;
            border-radius: 50%;
            opacity: ${Math.random() * 0.5 + 0.3};
            animation: twinkle ${duration}s ease-in-out ${delay}s infinite;
        `;

        heroSection.appendChild(star);
    }
}

// Add star animation
const starStyle = document.createElement('style');
starStyle.textContent = `
    @keyframes twinkle {
        0%, 100% {
            opacity: 0.3;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.2);
        }
    }
`;
document.head.appendChild(starStyle);

// Initialize starfield
createStarfield();

// Cyber grid effect
function createCyberGrid() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const grid = document.createElement('div');
    grid.className = 'cyber-grid';
    grid.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
            linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
        background-size: 50px 50px;
        perspective: 500px;
        transform: rotateX(60deg);
        transform-origin: center top;
        animation: gridMove 20s linear infinite;
        opacity: 0.5;
    `;

    heroSection.appendChild(grid);
}

// Add grid animation
const gridStyle = document.createElement('style');
gridStyle.textContent = `
    @keyframes gridMove {
        0% {
            background-position: 0 0;
        }
        100% {
            background-position: 0 50px;
        }
    }
`;
document.head.appendChild(gridStyle);

// Initialize cyber grid
createCyberGrid();

// Responsive particle count
function adjustParticlesForScreen() {
    const screenWidth = window.innerWidth;
    let particleCount = 80;

    if (screenWidth < 768) {
        particleCount = 40;
    } else if (screenWidth < 1024) {
        particleCount = 60;
    }

    // Update particles.js configuration
    if (typeof pJSDom !== 'undefined' && pJSDom[0]) {
        pJSDom[0].pJS.particles.number.value = particleCount;
        pJSDom[0].pJS.fn.particlesUpdate();
    }
}

// Adjust on resize
window.addEventListener('resize', function () {
    adjustParticlesForScreen();
});

// Initial adjustment
adjustParticlesForScreen();
