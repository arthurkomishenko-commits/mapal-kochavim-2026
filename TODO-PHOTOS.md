# Photos — TODO

Replace CSS placeholder gradients with real photos.
Download from Unsplash/Pexels/Pixabay (free, no attribution needed).

## Needed photos

### 1. Hero background (home page)
- **File:** `public/images/hero-night-sky.webp`
- **What:** Desert night sky with stars / Milky Way
- **Size:** 1920×1080 minimum, landscape
- **Search:** "desert night sky stars" or "milky way desert"
- **Where used:** `.hero` background in `home.css`

### 2. Place page — landscape
- **File:** `public/images/place-negev.webp`
- **What:** Negev desert daytime — craters, rocky hills, desert landscape
- **Size:** 1200×800 minimum, landscape
- **Search:** "Negev desert landscape" or "Ramon crater"
- **Where used:** `.place-hero-img` in `place.js`

### 3. Place page — camping area
- **File:** `public/images/place-camping.webp`
- **What:** Desert camping site with tents, tables, or fire pit
- **Size:** 1200×800 minimum, landscape
- **Search:** "desert camping site" or "camping bonfire night"
- **Where used:** `.place-info` section in `place.js`

### 4. Sky page — Perseids
- **File:** `public/images/sky-perseids.webp`
- **What:** Meteor shower / shooting stars in night sky
- **Size:** 1200×800 minimum
- **Search:** "Perseids meteor shower" or "shooting stars night"
- **Where used:** `.sky-card--featured` in `sky.js`

### 5. Sky page — telescope
- **File:** `public/images/sky-telescope.webp`
- **What:** Telescope pointed at night sky, or person stargazing
- **Size:** 800×600 minimum
- **Search:** "telescope stargazing" or "amateur astronomy night"
- **Where used:** telescope card in `sky.js`

## How to add
1. Download photos from free stock sites
2. Convert to WebP: `cwebp -q 80 input.jpg -o output.webp`
3. Put in `public/images/`
4. Tell Claude to replace placeholders
