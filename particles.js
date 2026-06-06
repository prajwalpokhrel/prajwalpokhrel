(function () {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    const COLORS = ['#8bd5b9', '#9ed2ba', '#559e84', '#69b89e'];
    const mouse = { x: null, y: null, active: false };

    let particles = [];
    let width = 0;
    let height = 0;
    let animationId = null;
    let particleCount = isMobile() ? 45 : 90;
    let connectionDistance = isMobile() ? 100 : 140;
    let mouseRadius = 120;

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = initial ? Math.random() * width : (Math.random() < 0.5 ? 0 : width);
            this.y = initial ? Math.random() * height : Math.random() * height;
            this.size = Math.random() * 2 + 0.8;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.speedX = (Math.random() - 0.5) * (isMobile() ? 0.35 : 0.55);
            this.speedY = (Math.random() - 0.5) * (isMobile() ? 0.35 : 0.55);
            this.opacity = Math.random() * 0.45 + 0.25;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.02 + 0.008;
        }

        update() {
            if (!prefersReducedMotion) {
                this.x += this.speedX;
                this.y += this.speedY;
                this.pulse += this.pulseSpeed;
            }

            if (mouse.active && !isMobile() && !prefersReducedMotion) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.hypot(dx, dy);
                if (dist < mouseRadius) {
                    const force = (mouseRadius - dist) / mouseRadius * 0.015;
                    this.x -= dx * force;
                    this.y -= dy * force;
                }
            }

            if (this.x < -20) this.x = width + 20;
            if (this.x > width + 20) this.x = -20;
            if (this.y < -20) this.y = height + 20;
            if (this.y > height + 20) this.y = -20;
        }

        draw() {
            const glow = this.opacity + Math.sin(this.pulse) * 0.12;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = Math.min(0.85, glow);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const newCount = isMobile() ? 45 : 90;
        connectionDistance = isMobile() ? 100 : 140;

        if (newCount !== particleCount) {
            particleCount = newCount;
            initParticles();
        }
    }

    function initParticles() {
        particles = Array.from({ length: particleCount }, () => new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.18;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(139, 213, 185, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function drawMouseGlow() {
        if (!mouse.active || isMobile()) return;

        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouseRadius);
        gradient.addColorStop(0, 'rgba(139, 213, 185, 0.06)');
        gradient.addColorStop(1, 'rgba(139, 213, 185, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(mouse.x - mouseRadius, mouse.y - mouseRadius, mouseRadius * 2, mouseRadius * 2);
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        drawMouseGlow();
        drawConnections();
        particles.forEach((p) => {
            p.update();
            p.draw();
        });
        animationId = requestAnimationFrame(animate);
    }

    function start() {
        if (animationId) cancelAnimationFrame(animationId);
        if (prefersReducedMotion) {
            particles.forEach((p) => p.draw());
            drawConnections();
            return;
        }
        animate();
    }

    function stop() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        mouse.active = true;
    });
    window.addEventListener('mouseleave', () => {
        mouse.active = false;
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
    });

    resize();
    initParticles();
    start();
})();
