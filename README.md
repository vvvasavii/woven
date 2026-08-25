# Woven

> A personal knowledge library for saving, organizing, and revisiting valuable online resources.

**Woven** is a full-stack bookmark manager built with Next.js, PostgreSQL, Prisma, and Clerk. It lets users save resources, automatically generate rich link previews, organize bookmarks into multiple collections, add personal notes, mark important resources as favorites, and quickly find saved resources.

**[Live Demo](https://woven-mu-nine.vercel.app/)** · **[GitHub](https://github.com/vvvasavii/woven)**

<img width="1920" height="913" alt="image" src="https://github.com/user-attachments/assets/762aa72f-44d3-49a2-a972-8751ccb06311" />





---

## ✨ Features

* **Smart Link Preview** — automatically extracts a website's title, description, domain, favicon, and preview image when available.
* **Collections** — organize bookmarks into reusable collections.
* **Many-to-Many Organization** — one bookmark can belong to multiple collections without creating duplicate records.
* **Personal Notes** — add context and reminders to saved resources.
* **Favorites** — mark important bookmarks for quick access.
* **Contextual Search** — search behavior adapts to the page:

  * Dashboard → bookmark titles + collection names
  * Bookmarks → bookmark titles
  * Collections → collection names
  * Favorites → favorite bookmark titles
* **Responsive UI** — designed for desktop, tablet, and mobile.

---

## 🔗 Smart Link Preview

Woven's signature feature automatically retrieves and parses webpage metadata before a bookmark is saved.

```text
URL
 ↓
Zod validation
 ↓
Server-side fetch
 ↓
HTML parsing with Cheerio
 ↓
Open Graph / standard metadata extraction
 ↓
Resolve relative asset URLs
 ↓
Preview returned to client
 ↓
User reviews or edits metadata
 ↓
Bookmark saved
```

The preview can include:

* Website title
* Description
* Domain
* Favicon
* Preview image

Metadata fetching is kept separate from bookmark creation, allowing users to review and edit generated information before saving.

The metadata endpoint also includes a request timeout and graceful handling for websites that reject or fail server-side requests.

---

## 🏗️ Architecture

Woven uses Next.js for the application layer, with Route Handlers handling backend operations. Clerk manages authentication, while application-level user ownership enforces authorization. Prisma connects the application to PostgreSQL.

```text
Next.js
   │
   ├── Clerk
   ├── Zod
   └── Prisma
          │
          ▼
      PostgreSQL
```

Bookmarks and collections use a many-to-many relationship through a `BookmarkCollection` join table, allowing one bookmark to belong to multiple collections without duplication.

---

## 🛠️ Tech Stack

| Layer            | Technology           |
| ---------------- | -------------------- |
| Framework        | Next.js              |
| Language         | TypeScript           |
| UI               | React + Tailwind CSS |
| Components       | shadcn/ui            |
| Authentication   | Clerk                |
| Database         | PostgreSQL           |
| ORM              | Prisma               |
| Validation       | Zod                  |
| Metadata Parsing | Cheerio              |
| Deployment       | Vercel               |

---

## 💡 Engineering Highlights

* **Relational Data Modeling** — `BookmarkCollection` enables a normalized many-to-many relationship between bookmarks and collections.
* **User-Level Authorization** — resources are associated with their owning user, preventing access to another user's data.
* **Server-Side Metadata Extraction** — external webpage metadata is fetched and parsed on the server before being presented to the client.
* **Runtime Validation** — Zod validates incoming data before it reaches application logic and database operations.
* **Contextual Search** — search behavior adapts to the current page while remaining scoped to the authenticated user's resources.
* **Intentional Architecture** — the application avoids unnecessary global state and infrastructure in favor of a focused Next.js architecture.

---

## 🔮 Future Scope

Potential future additions include a browser extension, AI-powered resource summaries, shared collections, bookmark import/export, collaboration, reading progress, and dead-link detection.

These features are intentionally outside the current product scope to keep the core application focused.

---

## 👩🏽‍💻 Built By

**Vasavi Dwivedi**

Built with Next.js · TypeScript · PostgreSQL · Prisma · Clerk
