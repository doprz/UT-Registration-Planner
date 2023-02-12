#!/usr/bin/env bash

for f in ./build/chrome-mv3-prod/*.png; do mv -v "$f" "${f%.*.*.png}.png" ; done
for f in ./build/chrome-mv3-prod/*.js; do mv -v "$f" "${f%.*.js}.js" ; done

rsync -av --exclude={'manifest.json','*.png'} ./build/chrome-mv3-prod/ ../extension/content/