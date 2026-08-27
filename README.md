# slugtree

[![npm version](https://img.shields.io/npm/v/slugtree?color=blue&style=flat-square)](https://www.npmjs.com/package/slugtree)
[![license](https://img.shields.io/npm/l/slugtree?style=flat-square)](https://github.com/daustinn/slugtree/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Astro](https://img.shields.io/badge/Astro-4+-BC52EE?style=flat-square&logo=astro&logoColor=white)](https://astro.build/)

> Write in MDX. Let Slugtree build the tree.

**Slugtree** is a lightweight, framework-agnostic content layer that parses your MDX files and transforms them into a strongly-typed navigation tree. It automatically generates sidebar structures, breadcrumbs, pagination, table of contents (TOC), and full-text search indexes. You own the UI; Slugtree provides the data.

---

## Features

- **Multi-Framework Support:** First-class integrations for **Next.js**, **Vite**, and **Astro**.
- **Strongly Typed:** Automatically generates TypeScript definitions based on your folder structure and frontmatter.
- **Automated Navigation:** Zero-config generation of breadcrumbs, previous/next pagination, and table of contents.
- **Built-in Search:** Pre-indexed full-text search ready for client or server usage.
- **Fast Development & HMR:** Instant hot updates when your MDX content changes.
- **Headless & Flexible:** Bring your own design system and UI components.

---

## Installation

```bash
# pnpm
pnpm add slugtree

# npm
npm install slugtree

# yarn
yarn add slugtree

# bun
bun add slugtree
```

---

## Quick Start & Examples

### 1. Next.js (App Router)

Wrap your configuration in `next.config.mjs`:

```js
// next.config.mjs
import withSlugtree from 'slugtree/next'

const nextConfig = {
  reactStrictMode: true
}

export default withSlugtree(nextConfig, {
  contentDir: './src/content',
  basePath: '/docs'
})
```

Use server utilities in your Server Components:

```tsx
// app/docs/[...slug]/page.tsx
import { getTree, getNode, getNodePagination } from 'slugtree'

export default async function DocPage({
  params
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug = [] } = await params
  const node = getNode(slug)
  const pagination = getNodePagination(slug)

  if (!node) return <div>Page not found</div>

  return (
    <article>
      <h1>{node.title}</h1>
      <p>{node.description}</p>
    </article>
  )
}
```

---

### 2. Vite (React)

Add the plugin to `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import slugtree from 'slugtree/vite'

export default defineConfig({
  plugins: [
    slugtree({
      contentDir: './src/content',
      basePath: '/docs'
    }),
    react()
  ]
})
```

Consume the navigation context and hooks in your React app:

```tsx
// src/App.tsx
import { SlugtreeProvider, useTree, useNodeBreadcrumbs } from 'slugtree/react'

function Sidebar() {
  const tree = useTree()

  return (
    <aside>
      {tree.map((item) => (
        <a key={item.id} href={item.url}>
          {item.title}
        </a>
      ))}
    </aside>
  )
}

export default function App() {
  return (
    <SlugtreeProvider>
      <Sidebar />
    </SlugtreeProvider>
  )
}
```

---

### 3. Astro

Add the integration in `astro.config.mjs`:

```mjs
// astro.config.mjs
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import slugtree from 'slugtree/astro'

export default defineConfig({
  integrations: [
    slugtree({
      contentDir: './src/content',
      basePath: '/docs'
    }),
    mdx()
  ]
})
```

Render dynamic pages in Astro:

```astro
---
// src/pages/docs/[...slug].astro
import { getAstroContent, getSlugs, getNode } from 'slugtree/astro'

export async function getStaticPaths() {
  return getSlugs().map((slug) => ({
    params: { slug: slug.join('/') || undefined }
  }))
}

const { slug } = Astro.params
const Content = await getAstroContent(
  slug ?? '',
  import.meta.glob('../../content/**/*.mdx')
)
const node = getNode(slug ?? '')
---

<article>
  <h1>{node?.title}</h1>
  {Content && <Content />}
</article>
```

---

## Configuration Options

All framework integrations accept the same core configuration object:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `contentDir` | `string` | `'./src/content'` (or `'./content'`) | Directory containing your `.mdx` and `.md` content files |
| `outputDir` | `string` | `'.slugtree'` | Output directory for generated metadata and cache |
| `basePath` | `string` | `'/'` | Base route URL path for documentation (e.g., `'/docs'`) |

---

## Documentation

For guides, comprehensive API reference, frontmatter configuration, and examples, visit our documentation:

👉 **[slugtree.daustinn.com](https://slugtree.daustinn.com)**

---

## License

MIT (c) [Daustinn](https://github.com/daustinn)
