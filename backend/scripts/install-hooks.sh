#!/bin/bash
#
# Install git hooks from the git-hooks directory to .git/hooks
# This script should be run once when setting up the development environment
# or after hooks are updated.

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/git-hooks"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

echo "Installing git hooks..."
echo "Project root: $PROJECT_ROOT"
echo "Hooks source: $HOOKS_DIR"
echo "Git hooks target: $GIT_HOOKS_DIR"

# Check if hooks directory exists
if [ ! -d "$HOOKS_DIR" ]; then
    echo "Error: git-hooks directory not found at $HOOKS_DIR"
    exit 1
fi

# Create git hooks directory if it doesn't exist
mkdir -p "$GIT_HOOKS_DIR"

# Copy only executable hook files from git-hooks to .git/hooks
# Skip README.md and other documentation files
for hook in "$HOOKS_DIR"/*; do
    if [ -f "$hook" ] && [ "$(basename "$hook")" != "README.md" ] && [[ ! "$(basename "$hook")" =~ \.md$ ]]; then
        hook_name=$(basename "$hook")
        target_hook="$GIT_HOOKS_DIR/$hook_name"

        echo "Installing $hook_name..."
        cp "$hook" "$target_hook"
        chmod +x "$target_hook"
        echo "✓ $hook_name installed"
    fi
done

echo ""
echo "Git hooks installation completed!"
echo ""
echo "The following hooks are now active:"
ls -1 "$GIT_HOOKS_DIR" | grep -v "\.sample$" | sed 's/^/- /'
echo ""
echo "Note: These hooks will run automatically before each git operation."
echo "To skip hooks temporarily, use: git commit --no-verify"