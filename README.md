# Portfolio

Next.js (App Router, RSC default) · Tailwind v4 · Framer Motion · static export untuk GitHub Pages.

    npm install
    npm run dev      # development
    npm run build    # menghasilkan ./out

- Repo `<username>.github.io` → kosongkan `NEXT_PUBLIC_BASE_PATH` (hapus env di deploy.yml).
- Project page → `NEXT_PUBLIC_BASE_PATH=/nama-repo npm run build`.
- Aktifkan Pages: Settings → Pages → Source: GitHub Actions.
- Gambar harus dikompres manual (WebP/AVIF); static export tidak mengoptimasi gambar.
- Workflow deploy memakai `npm ci`, jadi jalankan `npm install` sekali dan commit `package-lock.json`.
