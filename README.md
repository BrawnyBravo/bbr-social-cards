# Big Bear Ready weekend cards

This repo exists to do one thing: hold the weekly weekend card at a **public web address** so
Buffer can attach it to posts.

Buffer will not accept a file upload. It needs a URL it can fetch. The main site repo is private
and cannot deploy right now, so this small public repo is the image host instead.

## How it works

1. Claude updates `weekend.json` each Wednesday with the confirmed events and weather.
2. Pushing that change triggers GitHub Actions, which renders `weekend.png` and commits it back.
3. Buffer points at the raw URL of that PNG.

**Public repos get unlimited free GitHub Actions minutes**, so none of this touches the
2,000-minute allowance on the private site repo, and none of it costs anything.

The card URL is always:

```
https://raw.githubusercontent.com/BrawnyBravo/bbr-social-cards/main/weekend.png
```

Dated copies are kept in `cards/` as `weekend-YYYY-MM-DD.png`.

## ⚠️ One step Claude could not do

GitHub blocks writing files under `.github/workflows/` unless the authorization includes the
`workflow` scope, and the Zapier GitHub connection does not have it. So this last file has to be
added by hand, once.

In this repo: **Add file → Create new file**. Name it exactly:

```
.github/workflows/render-card.yml
```

Paste this in and commit:

```yaml
name: Render weekend card

on:
  push:
    paths:
      - 'weekend.json'
      - 'render.mjs'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  render:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Playwright and fonts
        run: |
          npm init -y
          npm install playwright@1.49.0
          npx playwright install --with-deps chromium
          sudo apt-get install -y fonts-crosextra-carlito fonts-texgyre

      - name: Render the card
        run: node render.mjs weekend.json weekend.png

      - name: Save a dated copy
        run: |
          mkdir -p cards
          DATE=$(node -e "const d=require('./weekend.json');process.stdout.write(d.slug||new Date().toISOString().slice(0,10))")
          cp weekend.png "cards/weekend-${DATE}.png"

      - name: Commit the rendered card
        run: |
          git config user.name  'github-actions[bot]'
          git config user.email 'github-actions[bot]@users.noreply.github.com'
          git add weekend.png cards/
          if git diff --staged --quiet; then
            echo 'Card unchanged, nothing to commit.'
          else
            git commit -m 'Render weekend card'
            git push
          fi
```

After you commit it, open the **Actions** tab and run **Render weekend card** once by hand
(Run workflow). If `weekend.png` appears in the repo a minute later, everything downstream works
and you never need to touch this again.

## Fonts

The site uses Georgia for headings and Inter for body text. Neither is on a GitHub runner, so the
renderer falls back to TeX Gyre Termes and Carlito, which are close matches. If the card ever
looks off, that is the first place to check.
