.PHONY: help install-hooks lint-frontend lint-backend lint-all build-frontend build-backend clean test-frontend test-backend dev-frontend dev-backend

help: ## Show this help message
	@echo "Available commands:"
	@echo "  make install-hooks    - Install git hooks"
	@echo "  make lint-frontend    - Run frontend linting"
	@echo "  make lint-backend     - Run backend linting"
	@echo "  make lint-all         - Run both frontend and backend linting"
	@echo "  make build-frontend    - Build frontend"
	@echo "  make build-backend     - Build backend"
	@echo "  make clean            - Clean build artifacts"
	@echo "  make test-frontend     - Run frontend tests"
	@echo "  make test-backend      - Run backend tests"
	@echo "  make dev-frontend      - Start frontend development server"
	@echo "  make dev-backend       - Start backend development server"

install-hooks: ## Install git hooks
	@echo "Installing git hooks..."
	@./scripts/install-hooks.sh

lint-frontend: ## Run frontend linting
	@echo "Running frontend linting..."
	@cd frontend && npm run lint

lint-backend: ## Run backend linting
	@echo "Running backend linting..."
	@cd backend && make lint

lint-all: lint-frontend lint-backend ## Run all linting

build-frontend: ## Build frontend
	@echo "Building frontend..."
	@cd frontend && npm run build

build-backend: ## Build backend
	@echo "Building backend..."
	@cd backend && make build

clean: ## Clean build artifacts
	@echo "Cleaning frontend..."
	@cd frontend && rm -rf .next out
	@echo "Cleaning backend..."
	@cd backend && make clean

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	@cd frontend && npm test

test-backend: ## Run backend tests
	@echo "Running backend tests..."
	@cd backend && make test

dev-frontend: ## Start frontend development server
	@echo "Starting frontend development server..."
	@cd frontend && npm run dev

dev-backend: ## Start backend development server
	@echo "Starting backend development server..."
	@cd backend && make run