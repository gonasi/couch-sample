#!/usr/bin/env bash
# Build the site and publish dist/ to the gh-pages branch (served by GitHub Pages).
set -euo pipefail

cd "$(dirname "$0")/.."
REMOTE="$(git remote get-url origin)"

npm run build
touch dist/.nojekyll

cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -q -f "$REMOTE" gh-pages
rm -rf .git

echo "Deployed → https://gonasi.github.io/couch-sample/"
