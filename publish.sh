#!/bin/bash
npm version patch        # or minor/major
npm publish              # npm registry
npm publish --registry https://npm.pkg.github.com   # GitHub Packages
git push origin main --tags