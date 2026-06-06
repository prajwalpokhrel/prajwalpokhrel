document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('py-2', 'w-[95%]');
        nav.classList.remove('py-3', 'w-[90%]');
    } else {
        nav.classList.add('py-3', 'w-[90%]');
        nav.classList.remove('py-2', 'w-[95%]');
    }

    const cards = document.querySelectorAll('.stack-card');
    cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (rect.top <= 100) {
            const progress = Math.min(1, Math.max(0, (100 - rect.top) / 400));
            const scale = 1 - (progress * 0.05);
            const brightness = 1 - (progress * 0.2);
            card.style.transform = `scale(${scale})`;
            card.style.filter = `brightness(${brightness})`;
        } else {
            card.style.transform = `scale(1)`;
            card.style.filter = `brightness(1)`;
        }
    });
});

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', 
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            navLinks.forEach(link => {
                link.classList.remove('text-primary', 'border-primary');
                link.classList.add('text-on-surface-variant', 'border-transparent');

                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.remove('text-on-surface-variant', 'border-transparent');
                    link.classList.add('text-primary', 'border-primary');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});
