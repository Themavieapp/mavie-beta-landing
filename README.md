# MaVie — Beta Landing Page

Production-ready link-in-bio / landing page za zbiranje prijav na MaVie beta testiranje.
Statična stran (HTML + CSS + JS).

## Status — vse shranjeno lokalno

**Lokacija:** `D:\MaVie_Projekti\beta testiranje`

Lahko ugasneš računalnik; koda ostane na disku.

### Že urejeno

- [x] `index.html` — vsebina, Formspree, Instagram, politika (modal)
- [x] `style.css` — dizajn, tekstura, modal
- [x] `script.js` — obrazec, FOMO animacija, 1× e-mail, modal
- [x] Logo: `images/mavie.png` (+ `mavie.svg`, vir)
- [x] Formspree: `https://formspree.io/f/mbgrlgya`
- [x] Instagram: `@themavieapp`
- [x] Politika zasebnosti (modal + droben link v footerju)
- [x] GDPR checkbox za novice

### Pred objavo še

- [ ] `assets/images/og-image.jpg` — slika za deljenje (1200×630)
- [ ] Objava na Netlify (ali Vercel)
- [ ] Po objavi: absolutni URL za `og:image`
- [ ] (Opcijsko) GitHub za varnostno kopijo

---

## Struktura

```
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
├── images/
│   ├── mavie.png          ← logo na strani
│   ├── mavie.svg
│   ├── MAVIE-source.png
│   └── README.md
├── styles/
│   ├── logo.png           ← starejša kopija
│   ├── palette.png
│   └── README.md
└── assets/
    └── images/
        ├── README.md
        └── og-image.jpg   ← še naloži (predogled ob deljenju)
```

---

## Objava (Netlify)

1. [netlify.com](https://netlify.com) → **Add new site** → **Deploy manually**
2. Povleci mapo `D:\MaVie_Projekti\beta testiranje` (brez `node_modules`, če gre)
3. URL vstavi v Instagram bio (@themavieapp)

---

## Formspree

Že nastavljeno v `index.html`:

```html
action="https://formspree.io/f/mbgrlgya"
```

---

## Prilagoditve

- **Števec / FOMO besedila:** `script.js` → `LIVE_LINES`
- **Politika:** modal v `index.html`
- **Barve:** `style.css` → `:root`
