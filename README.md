# Oguz Sahin Website

Static personal website with folder-based clean URLs and Markdown-backed blog posts.

## Preview Locally

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

## GitHub Pages

If this is published as a project page, the URL will look like:

```text
https://your-username.github.io/BlogForm/
```

Use the folder URLs from there:

```text
https://your-username.github.io/BlogForm/blog/
https://your-username.github.io/BlogForm/blog/my-new-post/
```

URLs like `https://your-username.github.io/blog/` only work if this site is published from a root user site repo or a custom domain.

## Add A New Blog Post

1. Create a Markdown file in `content/blog/`.

   Example:

   ```text
   content/blog/my-new-post.md
   ```

2. Write the post in Markdown.

   Example:

   ```markdown
   # My New Post

   Your blog text goes here.
   ```

3. Add the post metadata to `data/blogs.json`.

   Example:

   ```json
   {
     "title": "My New Post",
     "slug": "my-new-post",
     "description": "Short blog summary.",
     "md_url": "/content/blog/my-new-post.md",
     "created_at": "2026-06-02T00:00:00Z"
   }
   ```

   Put the newest post at the top of the JSON list if you want it to appear first.

4. Generate the clean blog URL.

   ```bash
   python tools/generate_blog_routes.py
   ```

5. Preview the post.

   ```text
   http://localhost:8000/blog/my-new-post/
   ```

## Useful Files

- `index.html` - Home page.
- `about/index.html` - About page.
- `blog/index.html` - Blog list page.
- `contact/index.html` - Contact page.
- `data/blogs.json` - Blog list and Markdown URLs.
- `content/blog/` - Markdown post files.
- `tools/generate_blog_routes.py` - Creates `/blog/slug/` pages.
- `assets/js/site.js` - Blog loading and starfield behavior.
- `assets/css/site.css` - Website styles.
