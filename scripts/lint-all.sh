#!/bin/bash
#
# Comprehensive lint script for both frontend and backend
# This script runs linting for both Next.js frontend and Go backend
# Usage: ./scripts/lint-all.sh [frontend|backend|all]
#

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Function to print colored output
print_status() {
    echo -e "\033[1;34m$1\033[0m"  # Blue
}

print_success() {
    echo -e "\033[1;32m$1\033[0m"  # Green
}

print_error() {
    echo -e "\033[1;31m$1\033[0m"  # Red
}

# Function to lint frontend
lint_frontend() {
    print_status "Running frontend linting..."

    cd "$PROJECT_ROOT/frontend"

    # Check if node_modules exists, if not, run install
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi

    # Run ESLint
    if npm run lint; then
        print_success "Frontend linting passed!"
        return 0
    else
        print_error "Frontend linting failed!"
        return 1
    fi
}

# Function to lint backend
lint_backend() {
    print_status "Running backend linting..."

    cd "$PROJECT_ROOT/backend"

    # Check if golangci-lint is available
    if ! command -v golangci-lint &> /dev/null; then
        print_error "golangci-lint not found. Please install it first."
        print_status "Installation instructions: https://golangci-lint.run/usage/install/"
        return 1
    fi

    # Run golangci-lint
    if golangci-lint run; then
        print_success "Backend linting passed!"
        return 0
    else
        print_error "Backend linting failed!"
        return 1
    fi
}

# Main script logic
lint_target="${1:-all}"

print_status "Starting linting process for: $lint_target"
echo "Project root: $PROJECT_ROOT"

case "$lint_target" in
    "frontend")
        lint_frontend
        ;;
    "backend")
        lint_backend
        ;;
    "all")
        # Run frontend linting first
        frontend_success=true
        if ! lint_frontend; then
            frontend_success=false
        fi

        # Run backend linting
        backend_success=true
        if ! lint_backend; then
            backend_success=false
        fi

        # Overall result
        if [ "$frontend_success" = true ] && [ "$backend_success" = true ]; then
            print_success "All linting checks passed!"
            exit 0
        else
            print_error "Some linting checks failed!"
            echo ""
            if [ "$frontend_success" = false ]; then
                echo "Frontend: ❌ Failed"
            else
                echo "Frontend: ✅ Passed"
            fi

            if [ "$backend_success" = false ]; then
                echo "Backend: ❌ Failed"
            else
                echo "Backend: ✅ Passed"
            fi
            exit 1
        fi
        ;;
    *)
        echo "Usage: $0 [frontend|backend|all]"
        echo "  frontend - Run only frontend linting"
        echo "  backend  - Run only backend linting"
        echo "  all      - Run both frontend and backend linting (default)"
        exit 1
        ;;
esac