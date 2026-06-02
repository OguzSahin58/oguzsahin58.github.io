const SITE_ROOT = new URL('../../', document.currentScript.src);
const BLOGS_URL = new URL('data/blogs.json', SITE_ROOT);

function siteUrl(path) {
    return new URL(String(path).replace(/^\/+/, ''), SITE_ROOT).href;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function getBlogs() {
    const response = await fetch(BLOGS_URL);
    if (!response.ok) throw new Error('Failed to fetch blogs');
    return response.json();
}

async function loadBlogs(targetId, limit) {
    const container = document.getElementById(targetId);
    if (!container) return;

    try {
        const blogs = await getBlogs();
        const visibleBlogs = Number.isInteger(limit) ? blogs.slice(0, limit) : blogs;

        if (visibleBlogs.length === 0) {
            container.innerHTML = '<p class="text-secondary">No blog notes yet.</p>';
            return;
        }

        container.innerHTML = visibleBlogs.map(blog => `
            <article class="post-item">
                <time class="post-date">${formatDate(blog.created_at)}</time>
                <a href="${siteUrl(`blog/${blog.slug}/`)}" class="post-item-link text-link">${escapeHtml(blog.title)}</a>
                ${blog.description ? `<p class="post-description">${escapeHtml(blog.description)}</p>` : ''}
            </article>
        `).join('');
    } catch (error) {
        console.error('Error fetching blogs:', error);
        container.innerHTML = '<p style="color: var(--accent-red);">Error connecting to the Jedi Holocron.</p>';
    }
}

async function loadMarkdownPost() {
    const article = document.getElementById('post-content');
    if (!article) return;

    const slug = article.dataset.slug;
    const mdUrl = article.dataset.mdUrl;

    if (!slug || !mdUrl) {
        article.innerHTML = '<h1 class="post-title">Post Not Found</h1>';
        return;
    }

    try {
        const blogs = await getBlogs();
        const blog = blogs.find(item => item.slug === slug);
        const response = await fetch(siteUrl(mdUrl));
        if (!response.ok) throw new Error('Failed to fetch markdown');

        const markdown = await response.text();
        article.innerHTML = `
            <h1 class="post-title">${escapeHtml(blog?.title || slug)}</h1>
            ${blog?.created_at ? `<time class="post-date">${formatDate(blog.created_at)}</time>` : ''}
            <div class="post-body">${window.marked ? marked.parse(markdown) : `<pre>${escapeHtml(markdown)}</pre>`}</div>
        `;

        if (blog?.title) {
            document.title = `Oguz Sahin | ${blog.title}`;
        }
    } catch (error) {
        console.error('Error loading markdown post:', error);
        article.innerHTML = '<p style="color: var(--accent-red);">Error decoding the transmission.</p>';
    }
}

async function fetchAbout() {
    const container = document.getElementById('about-content-container');
    if (!container) return;

    try {
        const response = await fetch(siteUrl('data/about.json'));
        if (!response.ok) throw new Error('Failed to fetch about data');

        const data = await response.json();
        if (data && data.markdown) {
            container.innerHTML = window.marked ? marked.parse(data.markdown) : `<p>${escapeHtml(data.markdown)}</p>`;
        } else {
            container.innerHTML = '<p class="text-secondary">Biography is currently empty.</p>';
        }
    } catch (error) {
        console.error('Error fetching about:', error);
        container.innerHTML = '<p class="text-secondary">The Jedi Archives have no record of this entity.</p>';
    }
}

function bootPage() {
    if (document.getElementById('recent-posts-container')) loadBlogs('recent-posts-container', 3);
    if (document.getElementById('posts-container')) loadBlogs('posts-container');
    if (document.getElementById('about-content-container')) fetchAbout();
    if (document.getElementById('post-content')) loadMarkdownPost();
}

document.addEventListener('DOMContentLoaded', bootPage);

const canvas = document.getElementById('starfield');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width;
    let height;
    let stars = [];
    const numStars = 400;
    const starDriftSpeed = 0.035;
    const mouse = { x: -1000, y: -1000 };

    window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('starfieldState', JSON.stringify({
            stars,
            savedWidth: width,
            savedHeight: height
        }));
    });

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function initStars() {
        const savedStateJson = sessionStorage.getItem('starfieldState');
        if (savedStateJson) {
            try {
                const savedState = JSON.parse(savedStateJson);
                if (Math.abs(savedState.savedWidth - window.innerWidth) < 100 &&
                    Math.abs(savedState.savedHeight - window.innerHeight) < 100) {
                    stars = savedState.stars;
                    return;
                }
            } catch (error) {
                console.warn('Could not restore starfield state', error);
            }
        }

        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                z: Math.random() * 1.5 + 0.5,
                vx: 0,
                vy: 0
            });
        }
    }

    function updateAndDraw() {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#fff';

        const repulsionRadius = 50;
        const repulsionForce = 0.5;

        for (const star of stars) {
            const dx = star.x - mouse.x;
            const dy = star.y - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < repulsionRadius * repulsionRadius) {
                const dist = Math.sqrt(distSq);
                const force = (repulsionRadius - dist) / repulsionRadius;
                const angle = Math.atan2(dy, dx);
                star.vx += Math.cos(angle) * force * repulsionForce;
                star.vy += Math.sin(angle) * force * repulsionForce;
            }

            star.x += star.vx;
            star.y += star.vy;
            star.vx *= 0.95;
            star.vy *= 0.95;
            star.y += star.z * starDriftSpeed;

            if (star.y > height) {
                star.y = 0;
                star.x = Math.random() * width;
                star.vy = 0;
                star.vx = 0;
            } else if (star.y < 0 && star.vy < 0) {
                star.y = height;
            }

            if (star.x < 0) {
                star.x = width;
                star.vx = 0;
            } else if (star.x > width) {
                star.x = 0;
                star.vx = 0;
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.z * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(updateAndDraw);
    }

    window.addEventListener('resize', () => {
        resize();
        initStars();
    });

    window.addEventListener('mousemove', event => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    resize();
    initStars();
    updateAndDraw();
}
