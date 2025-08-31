.PHONY: help build up down restart logs test clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker containers
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

test: ## Run all tests
	@echo "Running Lumen tests..."
	docker-compose exec lumen-api ./vendor/bin/phpunit
	@echo "Running Node.js tests..."
	docker-compose exec cache-service npm test
	@echo "Running Frontend tests..."
	docker-compose exec frontend npm test -- --watchAll=false

clean: ## Clean up containers and volumes
	docker-compose down -v
	docker system prune -f

install: ## Install dependencies for all services
	@echo "Installing Lumen dependencies..."
	cd backend-lumen && composer install
	@echo "Installing Node.js dependencies..."
	cd backend-nodejs && npm install
	@echo "Installing Frontend dependencies..."
	cd frontend && npm install

dev-lumen: ## Start Lumen development server
	cd backend-lumen && php -S localhost:8000 -t public

dev-nodejs: ## Start Node.js development server
	cd backend-nodejs && npm run dev

dev-frontend: ## Start React development server
	cd frontend && npm start