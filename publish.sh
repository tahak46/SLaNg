#!/bin/bash

# SLaNg Publish Script
# Updates both npm and GitHub Packages

echo "🚀 Starting SLaNg package publishing process..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: Must be on main branch to publish"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean. Commit changes first."
    exit 1
fi

# Update version (patch by default, can pass minor/major as argument)
VERSION_TYPE=${1:-patch}
echo "📦 Updating version ($VERSION_TYPE)..."
npm version $VERSION_TYPE

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "🔢 New version: $NEW_VERSION"

# Set up GitHub Packages authentication
echo "🔐 Setting up GitHub Packages authentication..."
npm config set //npm.pkg.github.com/:_authToken $GITHUB_TOKEN

# Publish to npm (if configured)
if [ -n "$NPM_TOKEN" ]; then
    echo "📤 Publishing to npm..."
    npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN
    npm publish
    echo "✅ Published to npm: @senodroom/slangmath@$NEW_VERSION"
else
    echo "⚠️  NPM_TOKEN not set, skipping npm publish"
fi

# Publish to GitHub Packages
echo "📤 Publishing to GitHub Packages..."
npm publish --registry https://npm.pkg.github.com
echo "✅ Published to GitHub Packages: @senodroom/slangmath@$NEW_VERSION"

# Push changes and tags to GitHub
echo "📤 Pushing to GitHub..."
git push origin main
git push origin --tags

echo "🎉 Publishing complete!"
echo "📦 npm: @senodroom/slangmath@$NEW_VERSION"
echo "📦 GitHub Packages: @senodroom/slangmath@$NEW_VERSION"