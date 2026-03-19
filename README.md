# armateurscotiers.fr — Guide de déploiement

## Architecture

```
Squarespace Domains (DNS) → Cloudflare (CDN/WAF/Headers) → GitHub Pages (hébergement)
```

## Étape 1 — Créer le dépôt GitHub

1. Créer un nouveau dépôt **privé** sur GitHub : `armateurs-cotiers-site`
2. Pousser l'intégralité de ce dossier dans la branche `main`
3. Dans Settings → Pages → Source : sélectionner `Deploy from a branch` → `main` → `/ (root)`
4. GitHub génère l'URL `https://[username].github.io/armateurs-cotiers-site/`

## Étape 2 — Configurer Cloudflare

1. Créer un compte sur [cloudflare.com](https://cloudflare.com) (plan Free)
2. Ajouter le site `armateurscotiers.fr`
3. Cloudflare fournit deux nameservers (ex: `ali.ns.cloudflare.com`, `bea.ns.cloudflare.com`)

### DNS Records à créer dans Cloudflare :

```
Type    Nom     Contenu                         Proxy   TTL
CNAME   @       [username].github.io            ☁ ON    Auto
CNAME   www     [username].github.io            ☁ ON    Auto
TXT     @       v=spf1 -all                     —       Auto
TXT     _dmarc  v=DMARC1; p=reject; sp=reject;  —       Auto
```

### Paramètres Cloudflare :

- **SSL/TLS** → Full (strict)
- **Edge Certificates** → Always Use HTTPS: ON
- **Edge Certificates** → Minimum TLS Version: 1.2
- **Speed** → Auto Minify: HTML, CSS, JS
- **Speed** → Brotli: ON
- **Speed** → Early Hints: ON
- **Network** → HTTP/3 (QUIC): ON
- **Caching** → Browser Cache TTL: 4 hours
- **Analytics** → Web Analytics: Activer (gratuit, sans cookie)

### Security Headers (Transform Rules) :

⚠️ Le fichier `_headers` fonctionne avec Cloudflare Pages mais **PAS avec GitHub Pages proxié via Cloudflare**. 
Pour GitHub Pages, configurer les headers via **Rules → Transform Rules → Modify Response Header** :

| Header | Value |
|---|---|
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), payment=(), usb=() |
| Cross-Origin-Opener-Policy | same-origin |
| Content-Security-Policy | default-src 'none'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://cloudflareinsights.com; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests |

## Étape 3 — Modifier les nameservers dans Squarespace

1. Aller dans Squarespace Domains → armateurscotiers.fr → DNS Settings
2. Remplacer les nameservers par ceux fournis par Cloudflare
3. Attendre la propagation DNS (5 min à 48h, généralement < 1h)

## Étape 4 — Configurer le custom domain dans GitHub

1. Settings → Pages → Custom domain : `armateurscotiers.fr`
2. Le fichier `CNAME` est déjà dans le dépôt
3. Cocher "Enforce HTTPS"

## Étape 5 — Validation

Vérifier chaque point après déploiement :

```bash
# HTTPS et redirect
curl -I http://armateurscotiers.fr
# → Doit retourner 301 → https://

# Security headers
curl -I https://armateurscotiers.fr
# → Vérifier HSTS, CSP, X-Frame-Options, etc.

# DNS
dig +short armateurscotiers.fr
dig +short TXT armateurscotiers.fr
dig +short TXT _dmarc.armateurscotiers.fr
```

### Tests en ligne :

| Test | URL | Cible |
|---|---|---|
| Security Headers | https://securityheaders.com/?q=armateurscotiers.fr | A+ |
| SSL Labs | https://ssllabs.com/ssltest/analyze.html?d=armateurscotiers.fr | A+ |
| Mozilla Observatory | https://observatory.mozilla.org/analyze/armateurscotiers.fr | A+ |
| PageSpeed Insights | https://pagespeed.web.dev/analysis?url=https://armateurscotiers.fr | ≥ 98 |
| Schema.org | https://validator.schema.org/ | Pas d'erreur |
| HSTS Preload | https://hstspreload.org/?domain=armateurscotiers.fr | Éligible |
| SPF/DMARC | https://mxtoolbox.com/spf.aspx | Pass |

## Étape 6 — Google Search Console

1. Aller sur https://search.google.com/search-console/
2. Ajouter la propriété `https://armateurscotiers.fr`
3. Vérification via DNS (ajouter le TXT record fourni par Google dans Cloudflare)
4. Soumettre le sitemap : `https://armateurscotiers.fr/sitemap.xml`

## Arborescence des fichiers

```
armateurscotiers/
├── CNAME
├── _headers                    ← Headers Cloudflare (référence, voir note ci-dessus)
├── robots.txt
├── sitemap.xml
├── index.html                  ← Accueil
├── a-propos.html
├── mentions-legales.html
├── politique-confidentialite.html
├── 404.html
├── transport-maritime-cotier/
│   └── index.html              ← Cluster index
├── transition-ecologique/
│   └── index.html
├── reglementation/
│   ├── index.html
│   └── division-190.html       ← Article modèle
├── metiers/
│   └── index.html
└── assets/
    ├── css/main.css
    ├── js/nav.js
    ├── fonts/                   ← WOFF2 auto-hébergées
    │   ├── source-sans-3-latin-400-normal.woff2
    │   ├── source-sans-3-latin-600-normal.woff2
    │   ├── source-sans-3-latin-700-normal.woff2
    │   ├── source-serif-4-latin-400-normal.woff2
    │   ├── source-serif-4-latin-600-normal.woff2
    │   └── source-serif-4-latin-700-normal.woff2
    └── icons/
        └── favicon.svg
```

## Pour ajouter un nouvel article

1. Copier `reglementation/division-190.html` comme template
2. Modifier : `<title>`, `<meta description>`, `<link canonical>`, OG tags, JSON-LD, contenu
3. Ajouter l'URL dans `sitemap.xml`
4. Ajouter des liens internes depuis au moins 3 autres pages
5. Commit + push → déploiement automatique

## ⚠️ Checklist avant publication

- [ ] Mentions légales : remplacer `[Prénom NOM]` et `[Adresse]` par les vraies données
- [ ] Supprimer le fichier `_headers` si les headers sont configurés via Cloudflare Transform Rules
- [ ] Créer les images OG (1200×630px) pour chaque page dans `assets/img/og/`
- [ ] Vérifier que AUCUNE mention de "GASPE" n'apparaît dans le code source
- [ ] Vérifier que le WHOIS Squarespace est bien masqué (personne physique)
