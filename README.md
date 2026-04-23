# Avent

[![Deploy](https://img.shields.io/badge/demo-online-8ec5ff?style=for-the-badge)](https://sosukii.github.io/doc/)

🖐🏼 Made with love and tools:

![vue](https://img.shields.io/badge/Vue%203-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D) ![nuxt](https://img.shields.io/badge/Nuxt%203-002E3B?style=for-the-badge&logo=nuxtdotjs&logoColor=00DC82) ![typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![tailwind](https://img.shields.io/badge/Tailwind-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)

![pinia](https://img.shields.io/badge/Pinia-FFC131?style=for-the-badge&logo=pinia&logoColor=white) ![vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E) ![eslint](https://img.shields.io/badge/ESLint-3A33D1?style=for-the-badge&logo=eslint&logoColor=white) ![vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white) ![cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)

![avent](./summer_wind.gif)

---

## 👁️ About

Avent — turnkey climate systems for home and business.

Online catalog and equipment selection platform focused on fast UX, strong SEO, and high performance.

**Services:** Design, installation and maintenance<br/>
**Scope:** B2C and B2B projects<br/>
**Clients:** IKEA, Armani, TGK-1 and others

---

## 💻 For developers

<details>
  <summary>Tech Stack</summary>

  <img src="https://cdn.simpleicons.org/vue.js/4FC08D" width="12" style="vertical-align: -1px;"/> Vue 3 + <img src="https://cdn.simpleicons.org/nuxt/00DC82" width="16" style="vertical-align: -3px;"/> Nuxt 3 (SSR)<br/>
  <img src="https://cdn.simpleicons.org/typescript/3178C6" width="12" style="vertical-align: -1px;"/> TypeScript<br/>
  <img src="https://cdn.simpleicons.org/pinia/FFC131" width="14" style="vertical-align: -1px;"/> Pinia<br/>
  <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" width="14" style="vertical-align: -1px;"/> Tailwind CSS<br/>
  <img src="https://cdn.simpleicons.org/vite/646CFF" width="14" style="vertical-align: -2px;"/> Vite<br/>
  <img src="https://cdn.simpleicons.org/vitest/6E9F18" width="12" style="vertical-align: -1px;"/> Vitest + <img src="https://cdn.simpleicons.org/cypress/17202C" width="12" style="vertical-align: -1px;"/> Cypress
</details>

<details>
<summary>Architecture</summary>

- Nuxt 3 (SSR + routing)
- Dynamic routing (catalog, product pages)
- State management via Pinia
- Composables for reusable business logic
- API layer abstraction (fetch → store → UI)

</details>

<details>
<summary>🔥 Performance</summary>

- **LCP optimization**
- Image optimization (size, format)
- Lazy loading (images, components)
- Code splitting
- **Fast navigation** (SSR + hydration)

</details>

<details>
<summary>Principles</summary>

- Performance-first approach
- Clean and scalable architecture
- Predictable data flow (API → store → UI)
- **SEO** and **accessibility** by default

</details>

<details>
<summary>Key decisions</summary>

- Nuxt 3 for SSR and SEO
- Pinia for predictable state management
- Composables for logic reuse
- Focus on **performance** and **UX** as core priorities

</details>

### 🐇 Quick start

```bash
npm install
npm run dev
```

### Structure

- `pages/` — routing layer
- `components/` — reusable UI
- `stores/` — state (Pinia)
- `composables/` — business logic