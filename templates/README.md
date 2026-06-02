# Page Template Notes

This project is intentionally static, so each public section is a folder with an `index.html`.
Use the same small pattern for new sections:

- Copy one of the existing pages.
- Keep the shared header, `#starfield` canvas, footer, `assets/css/site.css`, and `assets/js/site.js`.
- Change only the active nav link and the content inside `<main>`.

Current templates/pages:

- `index.html` - MainPage persona landing page.
- `about/index.html` - About section, loaded from `data/about.json`.
- `blog/index.html` - Blog list, loaded from `data/blogs.json`.
- `contact/index.html` - Contact template.
- `templates/blog-post.html` - Single Markdown blog post template.

Blog flow:

- Put Markdown files anywhere public, for example `content/blog/my-post.md`.
- Add title, slug, date, description, and `md_url` to `data/blogs.json`.
- Run `python tools/generate_blog_routes.py`.
- The generated URL will be `/blog/my-post/`.
