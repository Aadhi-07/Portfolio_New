document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');

    const preloaderText = document.querySelector('.preloader-text');
    const preloader = document.getElementById('preloader');
    const tlPreload = anime.timeline({
        easing: 'easeOutExpo'
    });
    tlPreload.add({
        targets: '.preloader-text',
        translateY: ['100%', '0%'],
        duration: 1200,
        delay: 200
    })
        .add({
            targets: '.preloader-text',
            opacity: [1, 0],
            duration: 800,
            delay: 800
        })
        .add({
            targets: '#preloader',
            opacity: [1, 0],
            duration: 800,
            complete: function () {
                preloader.style.display = 'none';
                document.querySelectorAll('section').forEach(sec => observer.observe(sec));
                const scene1 = document.getElementById('scene-1');
                triggerAnimeScene('scene-1');
                animatedScenes.add('scene-1');
            }
        });
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        cursor.animate({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`
        }, { duration: 500, fill: "forwards" });
    });

    const scene1 = document.getElementById('scene-1');
    const tubesCanvas = document.getElementById('tubes-canvas');
    const tubesLayer = document.getElementById('tubes-background');
    const gridContainer = document.getElementById('interactive-grid');
    const tubesConfig = {
        enableClickInteraction: true,
        colors: ['#f967fb', '#53bc28', '#6958d5'],
        lights: {
            intensity: 180,
            colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5']
        }
    };
    const canUseTubes = Boolean(
        scene1 &&
        tubesCanvas &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    let tubesApp = null;

    const randomHexColor = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
    const randomColors = (count) => Array.from({ length: count }, randomHexColor);

    const randomizeTubeColors = () => {
        if (!tubesApp || !tubesApp.tubes) return;
        if (typeof tubesApp.tubes.setColors === 'function') {
            tubesApp.tubes.setColors(randomColors(3));
        }
        if (typeof tubesApp.tubes.setLightsColors === 'function') {
            tubesApp.tubes.setLightsColors(randomColors(4));
        }
    };

    const initTubesBackground = async () => {
        if (!scene1 || !tubesCanvas) return;
        if (!canUseTubes) {
            if (tubesLayer) tubesLayer.style.display = 'none';
            if (gridContainer) {
                gridContainer.classList.remove('pointer-events-none', 'opacity-10');
                gridContainer.classList.add('pointer-events-auto', 'opacity-20');
            }
            return;
        }

        try {
            const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
            const TubesCursor = module.default;
            if (typeof TubesCursor !== 'function') return;

            tubesApp = TubesCursor(tubesCanvas, {
                tubes: {
                    colors: tubesConfig.colors,
                    lights: tubesConfig.lights
                }
            });

            scene1.addEventListener('click', (event) => {
                if (!tubesConfig.enableClickInteraction) return;
                const interactive = event.target.closest('a, button, input, textarea, select, label');
                if (!interactive) {
                    randomizeTubeColors();
                }
            });
        } catch (error) {
            console.error('Failed to initialize tubes background:', error);
            if (tubesLayer) tubesLayer.style.display = 'none';
            if (gridContainer) {
                gridContainer.classList.remove('pointer-events-none', 'opacity-10');
                gridContainer.classList.add('pointer-events-auto', 'opacity-20');
            }
        }
    };

    initTubesBackground();
    const interactables = document.querySelectorAll('button, input, textarea, .project-card, .grid-cell');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    });
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = scrollTop / scrollHeight;
        anime({
            targets: ['#scroll-progress', '#scroll-line-progress'],
            scaleX: (el) => el.id === 'scroll-progress' ? scrollPercentage : 1,
            scaleY: (el) => el.id === 'scroll-line-progress' ? scrollPercentage : 1,
            duration: 100,
            easing: 'linear'
        });
    });
    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 40;
    for (let p = 0; p < particleCount; p++) {
        const particle = document.createElement('div');
        particle.classList.add('data-particle');
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        particle.style.left = `${startX}px`;
        particle.style.top = `${startY}px`;
        particlesContainer.appendChild(particle);
        anime({
            targets: particle,
            translateX: () => (Math.random() - 0.5) * 200,
            translateY: () => (Math.random() - 0.5) * 200,
            opacity: [0, Math.random() * 0.8 + 0.2, 0],
            scale: [0, Math.random() * 1.5 + 0.5, 0],
            duration: () => Math.random() * 8000 + 5000,
            easing: 'easeInOutSine',
            direction: 'alternate',
            loop: true,
            delay: () => Math.random() * 2000
        });
    }
    if (gridContainer && !canUseTubes) {
        const cellSize = 40;
        const columns = Math.ceil(window.innerWidth / cellSize);
        const rows = Math.ceil(window.innerHeight / cellSize);
        const totalCells = columns * rows;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.addEventListener('mouseenter', () => {
                anime({
                    targets: cell,
                    backgroundColor: [
                        { value: 'rgba(214, 207, 225, 0.4)', easing: 'easeOutSine', duration: 200 },
                        { value: 'transparent', easing: 'easeInOutQuad', duration: 800 }
                    ],
                    scale: [
                        { value: 1.3, easing: 'easeOutSine', duration: 200 },
                        { value: 1, easing: 'easeInOutQuad', duration: 800 }
                    ],
                    zIndex: {
                        value: [10, 0]
                    }
                });
            });
            let rippleAnimation;
            cell.addEventListener('click', () => {
                if (rippleAnimation) rippleAnimation.pause();
                anime.set('.grid-cell', { backgroundColor: 'transparent', scale: 1 });
                rippleAnimation = anime({
                    targets: '.grid-cell',
                    backgroundColor: [
                        { value: 'rgba(214, 207, 225, 0.4)', easing: 'easeOutSine', duration: 200 },
                        { value: 'transparent', easing: 'easeInOutQuad', duration: 800 }
                    ],
                    scale: [
                        { value: 1.2, easing: 'easeOutSine', duration: 200 },
                        { value: 1, easing: 'easeInOutQuad', duration: 800 }
                    ],
                    delay: anime.stagger(30, { grid: [columns, rows], from: i }),
                    zIndex: {
                        value: [10, 0]
                    }
                });
            });
            gridContainer.appendChild(cell);
        }
    }
    const heroText = document.querySelector('.hero-text');
    const textContent = heroText.textContent.trim();
    heroText.innerHTML = '';
    const words = textContent.split(' ');
    words.forEach((word, index) => {
        const wordWrap = document.createElement('span');
        wordWrap.className = 'inline-block whitespace-nowrap';
        for (let j = 0; j < word.length; j++) {
            wordWrap.innerHTML += `<span class="letter">${word[j]}</span>`;
        }
        heroText.appendChild(wordWrap);
        if (index < words.length - 1) {
            const space = document.createElement('span');
            space.className = 'inline-block';
            space.innerHTML = '&nbsp;';
            heroText.appendChild(space);
        }
    });
    const animatedScenes = new Set();
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.25
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                if (!animatedScenes.has(id)) {
                    animatedScenes.add(id);
                    triggerAnimeScene(id);
                }
            }
        });
    }, observerOptions);
    function triggerAnimeScene(sceneId) {
        if (sceneId === 'scene-1') {
            const tl1 = anime.timeline({
                easing: 'easeOutExpo',
                duration: 1500
            });
            tl1.add({
                targets: '.hero-text .letter',
                opacity: [0, 1],
                translateY: [20, 0],
                rotateX: [90, 0],
                delay: anime.stagger(30, { start: 200 })
            })
                .add({
                    targets: '.hero-subtext',
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 1200,
                    offset: '-=800'
                });
            anime({
                targets: '.bg-glow',
                scale: [1, 1.15],
                opacity: [0.3, 0.6],
                rotate: [0, 10],
                translateX: '-50%',
                translateY: '-50%',
                direction: 'alternate',
                loop: true,
                duration: 6000,
                easing: 'easeInOutSine'
            });
        } else if (sceneId === 'scene-2') {
            const tl2 = anime.timeline({ easing: 'easeOutExpo' });
            tl2.add({
                targets: '.about-element',
                opacity: [0, 1],
                translateX: (el) => {
                    return el.classList.contains('translate-x-[30px]') ? [30, 0] : [-30, 0];
                },
                delay: anime.stagger(150),
                duration: 1200
            })
                .add({
                    targets: '.stat-item',
                    opacity: [0, 1],
                    translateY: [20, 0],
                    delay: anime.stagger(150),
                    duration: 1000,
                    offset: '-=800'
                });
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(num => {
                const targetVal = parseInt(num.getAttribute('data-val'));
                anime({
                    targets: num,
                    innerHTML: [0, targetVal],
                    round: 1,
                    easing: 'easeOutExpo',
                    duration: 2500,
                    delay: 800
                });
            });
        } else if (sceneId === 'scene-3') {
            const tl3 = anime.timeline({ easing: 'easeOutExpo' });
            tl3.add({
                targets: '.work-title',
                opacity: [0, 1],
                translateY: [30, 0],
                delay: anime.stagger(200),
                duration: 1200
            })
                .add({
                    targets: '.project-card',
                    opacity: [0, 1],
                    translateY: [50, 0],
                    scale: [0.95, 1],
                    delay: anime.stagger(200),
                    duration: 1200,
                    offset: '-=800'
                });
        } else if (sceneId === 'scene-4') {
            const tl4 = anime.timeline({ easing: 'easeOutExpo' });
            tl4.add({
                targets: ['.edu-title', '.skill-title'],
                opacity: [0, 1],
                translateX: [-30, 0],
                duration: 1000,
                delay: anime.stagger(200)
            })
                .add({
                    targets: '.edu-item',
                    opacity: [0, 1],
                    translateY: [30, 0],
                    delay: anime.stagger(250),
                    duration: 1200,
                    offset: '-=800'
                })
                .add({
                    targets: '.skill-group',
                    opacity: [0, 1],
                    translateY: [20, 0],
                    delay: anime.stagger(200),
                    duration: 1000,
                    offset: '-=1000'
                })
                .add({
                    targets: '.skill-tag',
                    scale: [0.9, 1],
                    backgroundColor: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.01)'],
                    delay: anime.stagger(50, { start: 200 }),
                    duration: 800,
                    offset: '-=600'
                });
        } else if (sceneId === 'scene-5') {
            anime({
                targets: '.vision-text',
                opacity: [0, 1],
                translateY: [60, 0],
                easing: 'easeOutExpo',
                duration: 2000
            });
            anime({
                targets: '.vision-glow',
                backgroundColor: 'rgba(214, 207, 225, 0.03)',
                easing: 'easeOutSine',
                duration: 3000
            });
        } else if (sceneId === 'scene-6') {
            anime({
                targets: '.contact-element',
                opacity: [0, 1],
                translateY: [30, 0],
                delay: anime.stagger(150),
                easing: 'easeOutExpo',
                duration: 1200
            });
            anime({
                targets: '.submit-btn',
                scale: [1, 1.03],
                boxShadow: ['0 0 0px rgba(234, 234, 234, 0)', '0 0 20px rgba(234, 234, 234, 0.15)'],
                direction: 'alternate',
                loop: true,
                easing: 'easeInOutSine',
                duration: 2000,
                delay: 1500
            });
        }
    }
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                scale: 1.03,
                translateY: -8,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                borderColor: 'rgba(214, 207, 225, 0.2)',
                duration: 600,
                easing: 'easeOutExpo'
            });
        });
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                scale: 1,
                translateY: 0,
                boxShadow: '0 0px 0px rgba(0, 0, 0, 0)',
                borderColor: 'rgba(255, 255, 255, 0.04)',
                duration: 600,
                easing: 'easeOutExpo'
            });
        });
        card.addEventListener('click', () => {
            anime({
                targets: card,
                scale: 0.95,
                opacity: 0.7,
                duration: 150,
                easing: 'easeInSine',
                direction: 'alternate'
            });
        });
    });
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            anime({
                targets: btn,
                translateX: x * 0.3,
                translateY: y * 0.3,
                duration: 400,
                easing: 'easeOutExpo'
            });
            anime({
                targets: btn.querySelectorAll('.btn-text, .btn-icon'),
                translateX: x * 0.15,
                translateY: y * 0.15,
                duration: 400,
                easing: 'easeOutExpo'
            });
        });
        btn.addEventListener('mouseleave', () => {
            anime({
                targets: [btn, btn.querySelectorAll('.btn-text, .btn-icon')],
                translateX: 0,
                translateY: 0,
                duration: 600,
                easing: 'easeOutElastic(1, .3)'
            });
        });
    });
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIconPath = document.getElementById('menu-icon-path');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    let isMenuOpen = false;
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            mobileMenu.style.pointerEvents = 'auto';
            anime({
                targets: mobileMenu,
                opacity: 1,
                duration: 300,
                easing: 'easeInOutQuad'
            });
            anime({
                targets: '.mobile-link',
                translateY: [20, 0],
                opacity: [0, 1],
                delay: anime.stagger(100, { start: 100 }),
                duration: 600,
                easing: 'easeOutExpo'
            });
            menuIconPath.setAttribute('d', 'M6 18L18 6M6 6l12 12');
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.style.pointerEvents = 'none';
            anime({
                targets: mobileMenu,
                opacity: 0,
                duration: 300,
                easing: 'easeInOutQuad'
            });
            menuIconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
            document.body.style.overflow = '';
        }
    }
    mobileMenuBtn.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) toggleMenu();
        });
    });
    let lastScrollY = window.scrollY;
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        const isDesktop = window.innerWidth >= 768;
        if (!isMenuOpen && isDesktop) {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else if (!isDesktop) {
            navbar.style.transform = 'translateY(0)';
        }
        if (window.scrollY > 50) {
            navbar.classList.add('backdrop-blur-xl', 'shadow-lg');
            navbar.classList.replace('bg-soft/80', 'bg-soft/95');
            navbar.classList.replace('dark:bg-dark/80', 'dark:bg-dark/95');
        } else {
            navbar.classList.remove('backdrop-blur-xl', 'shadow-lg');
            navbar.classList.replace('bg-soft/95', 'bg-soft/80');
            navbar.classList.replace('dark:bg-dark/95', 'dark:bg-dark/80');
        }
        lastScrollY = window.scrollY;
    }, { passive: true });
});
