(function () {
    function slugify(text) {
        return text.toString().toLowerCase().trim()
            .replace(/&amp;|&/g, 'and')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    function createTOC(container, headings) {
        if (!headings.length) return;
        const toc = document.createElement('nav');
        toc.className = 'blog-toc mb-8 p-4 rounded-lg border border-primary/10 bg-surface-container-lowest';
        const title = document.createElement('strong');
        title.textContent = 'On this page';
        title.className = 'block mb-2 text-primary';
        toc.appendChild(title);
        const ul = document.createElement('ul');
        ul.className = 'space-y-1';
        headings.forEach(h => {
            const text = h.textContent.trim();
            const id = slugify(text);
            if (!h.id) h.id = id;
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${h.id}`;
            a.className = 'text-on-surface-variant hover:text-primary';
            a.textContent = text;
            li.appendChild(a);
            ul.appendChild(li);
        });
        toc.appendChild(ul);
        container.parentNode.insertBefore(toc, container);
    }

    function addAnchors(headings) {
        headings.forEach(h => {
            const id = h.id || slugify(h.textContent || '');
            h.id = id;
            const a = document.createElement('a');
            a.className = 'toc-anchor ml-2 text-on-surface-variant hover:text-primary';
            a.href = `#${id}`;
            a.setAttribute('aria-hidden', 'true');
            a.innerHTML = '<span class="material-symbols-outlined" style="vertical-align:middle;font-size:18px">link</span>';
            h.appendChild(a);
        });
    }

    function convertHashtags(root) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
        const skipTags = new Set(['CODE', 'PRE', 'A', 'SCRIPT', 'STYLE']);
        const textNodes = [];
        while (walker.nextNode()) { textNodes.push(walker.currentNode); }
        textNodes.forEach(node => {
            if (!node.nodeValue) return;
            const parentTag = node.parentNode && node.parentNode.tagName;
            if (skipTags.has(parentTag)) return;
            const replaced = node.nodeValue.replace(/#([A-Za-z0-9_-]+)/g, (m, tag) => {
                const url = `/blogs.html?tag=${encodeURIComponent(tag.toLowerCase())}`;
                return `<a class="text-primary hover:underline" href="${url}">#${tag}</a>`;
            });
            if (replaced !== node.nodeValue) {
                const span = document.createElement('span');
                span.innerHTML = replaced;
                node.parentNode.replaceChild(span, node);
            }
        });
    }

    function updateMetaKeywords(keywords) {
        if (!keywords || !keywords.length) return;
        let meta = document.querySelector('meta[name="keywords"]');
        const content = Array.from(new Set(keywords.map(k => k.toLowerCase()))).join(', ');
        if (meta) { meta.setAttribute('content', content); }
        else {
            meta = document.createElement('meta');
            meta.name = 'keywords';
            meta.content = content;
            document.getElementsByTagName('head')[0].appendChild(meta);
        }
    }

    function injectBreadcrumbJSONLD() {
        const canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) return;
        const pageUrl = canonical.href;
        const title = document.querySelector('h1')?.textContent?.trim() || document.title;
        const json = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://prajwal10.com.np/" },
                { "@type": "ListItem", "position": 2, "name": "Blogs", "item": "https://prajwal10.com.np/blogs.html" },
                { "@type": "ListItem", "position": 3, "name": title, "item": pageUrl }
            ]
        };
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(json);
        document.head.appendChild(s);
    }

    function collectInlineTags(root) {
        const tags = [];
        // category badges: common pattern in these pages
        root.querySelectorAll('.font-label-md.text-label-md.text-primary').forEach(el => {
            const t = el.textContent && el.textContent.trim();
            if (t) tags.push(t);
        });
        // hashtags
        const hashtagMatches = root.innerHTML.match(/#([A-Za-z0-9_-]+)/g) || [];
        hashtagMatches.forEach(h => tags.push(h.replace('#', '')));
        return tags;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const blogContent = document.querySelector('.blog-content');
        if (blogContent) {
            const headings = Array.from(blogContent.querySelectorAll('h2, h3'));
            addAnchors(headings);
            createTOC(blogContent, headings);
            convertHashtags(blogContent);
            const tags = collectInlineTags(document);
            updateMetaKeywords(tags);
            injectBreadcrumbJSONLD();
        }

        // On the blog listing page, enable tag filtering from ?tag=slug
        const isListing = document.querySelector('.grid') && location.pathname.endsWith('blogs.html');
        if (isListing) {
            const params = new URLSearchParams(location.search);
            const tag = params.get('tag');
            if (tag) {
                const cards = document.querySelectorAll('.blog-card');
                cards.forEach(card => {
                    const cat = card.querySelector('.font-label-md')?.textContent?.trim().toLowerCase();
                    if (!cat || cat.indexOf(tag.toLowerCase()) === -1) card.style.display = 'none';
                });
            }
        }
    });
})();
