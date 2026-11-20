// Blog Studio: blogs written for a customer's own website, so AI answer
// engines (ChatGPT, Gemini, Perplexity, Google AI Overviews) find and quote
// the business. Ops reviews every post, then sends it to the customer as a
// PDF (or HTML for their web person) and, for stores we host, publishes it.
//
// Firestore:
//   seo-settings/{locationId}.blogs          → BlogSettings
//   seo-settings/{locationId}/blogs/{blogId} → BlogPost

import { Timestamp } from "./timestamp";

// ---------------------------------------------------------------- settings

// "storefront": the website is our Store-Front, so ops can publish to it.
// "external": the customer's own site (WordPress etc.); ops sends the post.
export type BlogWebsiteType = "storefront" | "external";

export interface BlogSettings {
  // Monthly posts for stores with the Blogs add-on (CustomerAccount.blogsOn).
  postsPerMonth: number;
  websiteType: BlogWebsiteType;
  externalSiteUrl?: string | null;
  // Guidance for every post: tone, dishes or areas to push, things to avoid.
  notes?: string | null;
}

export const DEFAULT_BLOG_SETTINGS: BlogSettings = {
  postsPerMonth: 2,
  websiteType: "external",
  externalSiteUrl: null,
  notes: null,
};

export const MAX_BLOG_POSTS_PER_MONTH = 8;

// ---------------------------------------------------------------- posts

// generated → (edited) → shared with the customer → published on their site.
export type BlogStatus = "generated" | "edited" | "shared" | "published";

export const BLOG_STATUS_LABEL: Record<BlogStatus, string> = {
  generated: "Generated",
  edited: "Edited",
  shared: "Shared",
  published: "Published",
};

// "monthly": written by the monthly job. "custom": ops asked for it.
export type BlogSource = "monthly" | "custom";

export interface BlogSection {
  heading: string;
  // Paragraphs separated by a blank line. A paragraph whose lines all start
  // with "- " is a bullet list. **bold** works inside a line.
  body: string;
}

export interface BlogFaq {
  question: string;
  answer: string;
}

// What ops can edit.
export interface BlogContent {
  title: string;
  slug: string;
  metaDescription: string;
  // Two or three sentences at the top that answer the question directly:
  // the part AI engines quote.
  answer: string;
  sections: BlogSection[];
  faq: BlogFaq[];
  coverImageUrl?: string | null;
}

export interface BlogTopic {
  // Short working title, e.g. "Hyderabadi dum biryani in Koramangala".
  topic: string;
  // The question a diner would ask an AI assistant that this post answers.
  question: string;
  // Menu items the post is about (exact menu names), if any.
  dishes: string[];
  // Target keywords the post covers.
  keywords: string[];
  // One line on why this topic, for ops.
  why?: string;
}

export interface BlogPostMeta {
  id: string;
  locationId: string;
  storeId?: string | null;
  source: BlogSource;
  // What ops typed for a custom post.
  brief?: string | null;
  topic: BlogTopic;
  // slugify(topic.topic): compared against older posts to avoid repeats.
  topicKey: string;
  status: BlogStatus;
  model: string;
  createdBy: string;
  editedBy?: string | null;
  sharedBy?: string | null;
  publishedBy?: string | null;
  // Where the post went live (the customer's page, or our storefront).
  publishedUrl?: string | null;
}

export type BlogPost = BlogPostMeta &
  BlogContent & {
    createdAt: Timestamp;
    updatedAt: Timestamp;
    editedAt?: Timestamp | null;
    sharedAt?: Timestamp | null;
    publishedAt?: Timestamp | null;
  };

// BlogPost as callables return it: dates as epoch milliseconds.
export type BlogPostView = BlogPostMeta &
  BlogContent & {
    createdAt: number;
    updatedAt: number;
    editedAt?: number | null;
    sharedAt?: number | null;
    publishedAt?: number | null;
  };

// ---------------------------------------------------------------- sellers

// Sellers see a post once ops has shared it with them; drafts stay internal.
export function isSellerVisibleBlog(status: BlogStatus): status is "shared" | "published" {
  return status === "shared" || status === "published";
}

// A post as the seller dashboard shows it.
export interface SellerBlogPost extends BlogContent {
  id: string;
  status: "shared" | "published";
  dishes: string[];
  sharedAt: number | null;
  publishedAt: number | null;
  publishedUrl: string | null;
}

export interface SellerBlogsResult {
  // false: the store has no linked Google Business Profile.
  linked: boolean;
  // The Blogs add-on is on (monthly posts).
  addOn: boolean;
  postsPerMonth: number;
  // Posts shared with the seller this calendar month (India time).
  sharedThisMonth: number;
  business: BlogBusiness | null;
  posts: SellerBlogPost[];
}

// ---------------------------------------------------------------- helpers

export function slugify(text: string, maxLength = 80): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  return cut.slice(0, cut.lastIndexOf("-") > 20 ? cut.lastIndexOf("-") : maxLength);
}

// ---------------------------------------------------------------- rendering

// The business a post is about, for the page header, footer and JSON-LD.
export interface BlogBusiness {
  name: string;
  isFoodBusiness: boolean;
  // GBP primary category, e.g. "South Indian restaurant".
  category?: string | null;
  address?: string | null;
  locality?: string | null;
  city?: string | null;
  phone?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

// Section body (see BlogSection.body) to HTML.
export function renderBlogBodyHtml(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((l) => l.trim());
      if (lines.every((l) => /^[-*•]\s+/.test(l))) {
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-*•]\s+/, ""))}</li>`).join("")}</ul>`;
      }
      return `<p>${lines.map(inline).join("<br>")}</p>`;
    })
    .join("\n");
}

// The post itself: what goes on a website's blog page.
export function renderBlogArticleHtml(post: BlogContent): string {
  const parts = [`<h1>${inline(post.title)}</h1>`];
  if (post.coverImageUrl) {
    parts.push(`<img class="bt-blog-cover" src="${escapeHtml(post.coverImageUrl)}" alt="${escapeHtml(post.title)}">`);
  }
  if (post.answer.trim()) parts.push(`<p class="bt-blog-answer">${inline(post.answer.trim())}</p>`);
  for (const s of post.sections) {
    if (s.heading.trim()) parts.push(`<h2>${inline(s.heading.trim())}</h2>`);
    parts.push(renderBlogBodyHtml(s.body));
  }
  const faq = post.faq.filter((f) => f.question.trim() && f.answer.trim());
  if (faq.length) {
    parts.push(`<h2>Frequently asked questions</h2>`);
    for (const f of faq) {
      parts.push(`<h3>${inline(f.question.trim())}</h3>`, `<p>${inline(f.answer.trim())}</p>`);
    }
  }
  return `<article class="bt-blog">\n${parts.join("\n")}\n</article>`;
}

function stripMarks(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").trim();
}

// schema.org data for the post: the article, its FAQ, and the business it's
// about. Search engines and AI crawlers read this.
export function blogJsonLd(post: BlogContent, business: BlogBusiness, opts?: { url?: string; datePublished?: Date }): object {
  const place: Record<string, unknown> = {
    "@type": business.isFoodBusiness ? "Restaurant" : "LocalBusiness",
    name: business.name,
  };
  if (business.address) place.address = business.address;
  if (business.phone) place.telephone = business.phone;
  if (business.websiteUrl) place.url = business.websiteUrl;
  if (business.logoUrl) place.logo = business.logoUrl;

  const article: Record<string, unknown> = {
    "@type": "BlogPosting",
    headline: stripMarks(post.title),
    description: post.metaDescription,
    about: place,
    author: { "@type": "Organization", name: business.name },
    publisher: place,
  };
  if (post.coverImageUrl) article.image = post.coverImageUrl;
  if (opts?.url) article.url = opts.url;
  if (opts?.datePublished) article.datePublished = opts.datePublished.toISOString().slice(0, 10);

  const graph: object[] = [article];
  const faq = post.faq.filter((f) => f.question.trim() && f.answer.trim());
  if (faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: stripMarks(f.question),
        acceptedAnswer: { "@type": "Answer", text: stripMarks(f.answer) },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

// JSON-LD inside a <script> tag. "<" is escaped so text can't close the tag.
export function blogJsonLdScript(post: BlogContent, business: BlogBusiness, opts?: { url?: string; datePublished?: Date }): string {
  const json = JSON.stringify(blogJsonLd(post, business, opts), null, 2).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

const ARTICLE_CSS = `
.bt-blog { font-family: Georgia, "Times New Roman", serif; color: #1f2328; line-height: 1.65; font-size: 17px; }
.bt-blog h1 { font-family: Helvetica, Arial, sans-serif; font-size: 30px; line-height: 1.25; margin: 0 0 18px; color: #111; }
.bt-blog h2 { font-family: Helvetica, Arial, sans-serif; font-size: 21px; margin: 30px 0 10px; color: #111; }
.bt-blog h3 { font-family: Helvetica, Arial, sans-serif; font-size: 17px; margin: 20px 0 6px; color: #111; }
.bt-blog p, .bt-blog ul { margin: 0 0 14px; }
.bt-blog li { margin-bottom: 6px; }
.bt-blog .bt-blog-answer { font-size: 18px; padding: 14px 18px; border-left: 4px solid var(--bt-brand, #c62828); background: #faf7f2; }
.bt-blog .bt-blog-cover { width: 100%; max-height: 360px; object-fit: cover; border-radius: 8px; margin: 0 0 18px; }
`;

// A complete page for one post.
//  "pdf":  A4 pages with the business's name and logo, sent to the customer.
//  "html": a page whose <article> and JSON-LD the customer's web person
//          copies into their site.
export function renderBlogDocument(
  post: BlogContent,
  business: BlogBusiness,
  opts: { variant: "pdf" | "html"; brandColor?: string | null },
): string {
  const brand = /^#[0-9a-f]{3,8}$/i.test(opts.brandColor ?? "") ? opts.brandColor! : "#c62828";
  const article = renderBlogArticleHtml(post);
  const jsonLd = blogJsonLdScript(post, business);
  const title = escapeHtml(stripMarks(post.title));
  const description = escapeHtml(post.metaDescription);
  const contact = [business.address, business.phone].filter(Boolean).map((t) => escapeHtml(t!)).join(" · ");

  if (opts.variant === "html") {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<!--
  For the website: publish this as a blog post.
  - Page title: ${title}
  - Meta description: ${description}
  - URL slug: ${escapeHtml(post.slug)}
  - Copy the <article> below as the post body, and paste the
    <script type="application/ld+json"> block into the page's HTML too.
    It tells Google and AI assistants what the post and business are.
-->
<style>body { margin: 0; padding: 32px 16px; background: #fff; } main { max-width: 760px; margin: 0 auto; } :root { --bt-brand: ${brand}; }${ARTICLE_CSS}</style>
${jsonLd}
</head>
<body>
<main>
${article}
</main>
</body>
</html>
`;
  }

  const logo = business.logoUrl
    ? `<img src="${escapeHtml(business.logoUrl)}" alt="" style="height:44px;width:44px;object-fit:contain;border-radius:8px;">`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
@page { size: A4; }
* { box-sizing: border-box; }
body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
:root { --bt-brand: ${brand}; }
.bt-head { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; margin-bottom: 26px; border-bottom: 3px solid ${brand}; font-family: Helvetica, Arial, sans-serif; }
.bt-head .name { font-size: 18px; font-weight: 700; color: #111; }
.bt-head .sub { font-size: 12px; color: #666; }
.bt-foot { margin-top: 34px; padding-top: 10px; border-top: 1px solid #ddd; font: 11px Helvetica, Arial, sans-serif; color: #777; }
.bt-blog h2, .bt-blog h3 { break-after: avoid; }
.bt-blog p, .bt-blog li { orphans: 3; widows: 3; }
${ARTICLE_CSS}
</style>
</head>
<body>
<div class="bt-head">${logo}<div><div class="name">${escapeHtml(business.name)}</div>${business.category ? `<div class="sub">${escapeHtml(business.category)}</div>` : ""}</div></div>
${article}
${contact ? `<div class="bt-foot">${contact}</div>` : ""}
</body>
</html>
`;
}
