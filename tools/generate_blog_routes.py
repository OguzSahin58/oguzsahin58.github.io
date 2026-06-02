import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOGS_FILE = ROOT / "data" / "blogs.json"
TEMPLATE_FILE = ROOT / "templates" / "blog-post.html"
BLOG_DIR = ROOT / "blog"


def render_post(template, blog):
    description = blog.get("description", "")
    return (
        template
        .replace("{{TITLE}}", html.escape(blog["title"]))
        .replace("{{DESCRIPTION}}", html.escape(description))
        .replace("{{SLUG}}", html.escape(blog["slug"]))
        .replace("{{MD_URL}}", html.escape(blog["md_url"]))
    )


def main():
    blogs = json.loads(BLOGS_FILE.read_text(encoding="utf-8"))
    template = TEMPLATE_FILE.read_text(encoding="utf-8")

    for blog in blogs:
        slug = blog["slug"].strip("/")
        if not slug:
            raise ValueError("Blog slug cannot be empty")

        target_dir = BLOG_DIR / slug
        target_dir.mkdir(parents=True, exist_ok=True)
        (target_dir / "index.html").write_text(render_post(template, blog), encoding="utf-8")

    print(f"Generated {len(blogs)} blog route(s).")


if __name__ == "__main__":
    main()
