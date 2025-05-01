#!/bin/bash

# Check if a commit message was provided
if [ -z "$1" ]; then
    echo "Please provide a commit message"
    echo "Usage: npm run git-push \"Your commit message\""
    exit 1
fi

# Add all changes
git add .

# Commit with the provided message
git commit -m "$1"

# Push to the main branch
git push origin main

echo "✅ Successfully pushed changes to WebOS app!" 