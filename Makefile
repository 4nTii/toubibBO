.PHONY: all help build up down restart logs shell prod-build prod-up

ifeq ($(OS),Windows_NT)
ENV_CHECK = powershell -NoProfile -ExecutionPolicy Bypass -Command "if (-not (Test-Path '.env')) { if (Test-Path '.env.docker') { Copy-Item '.env.docker' '.env'; Write-Host 'WARNING: .env created from .env.docker -- edit .env to customize' } elseif (Test-Path '.env.example') { Copy-Item '.env.example' '.env'; Write-Host 'WARNING: .env created from .env.example -- edit .env to customize' } else { Write-Host 'ERROR: No .env file found. Create one before continuing.'; exit 1 } }"
HELP_CMD = powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content '$(firstword $(MAKEFILE_LIST))' | Where-Object { $$_ -match '^[a-zA-Z_-]+:.*?\#\# ' } | ForEach-Object { $$parts = $$_ -split ':.*?\#\# ', 2; Write-Host ('{0,-22} {1}' -f $$parts[0], $$parts[1]) }"
else
ENV_CHECK = if [ ! -f .env ]; then \
		if [ -f .env.docker ]; then \
			cp .env.docker .env; \
			echo "WARNING: .env created from .env.docker -- edit .env to customize"; \
		elif [ -f .env.example ]; then \
			cp .env.example .env; \
			echo "WARNING: .env created from .env.example -- edit .env to customize"; \
		else \
			echo "ERROR: No .env file found. Create one before continuing."; \
			exit 1; \
		fi \
	fi
HELP_CMD = grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'
endif

# --- Default target -----------------------------------------------------------

all: ## Build and start the frontend
	@$(ENV_CHECK)
	@echo ""
	@echo "--- Building frontend image -------------------------"
	docker compose build --build-arg http_proxy="" --build-arg https_proxy="" --build-arg HTTP_PROXY="" --build-arg HTTPS_PROXY="" --build-arg NO_PROXY="*"
	@echo ""
	@echo "--- Starting frontend container ---------------------"
	docker compose up -d
	@echo ""
	@echo "-----------------------------------------------------"
	@echo "  ToubibBO is ready"
	@echo ""
	@echo "  Dev  -> https://localhost:5174"
	@echo ""
	@echo "  Run 'make help' to see all available commands"
	@echo "-----------------------------------------------------"

# --- Help ---------------------------------------------------------------------

help: ## Show this help
	@$(HELP_CMD)

# --- Docker lifecycle ---------------------------------------------------------

build: ## Build the frontend image
	docker compose build --no-cache --build-arg http_proxy="" --build-arg https_proxy="" --build-arg HTTP_PROXY="" --build-arg HTTPS_PROXY="" --build-arg NO_PROXY="*"

up: ## Start the frontend container
	docker compose up -d
	@echo "Dev -> https://localhost:5174"

down: ## Stop the frontend container
	docker compose down

restart: ## Restart the frontend container
	docker compose restart

logs: ## Follow frontend logs
	docker compose logs -f

shell: ## Open a shell in the frontend container
	docker compose exec front sh

# --- Production ---------------------------------------------------------------

prod-build: ## Build production image
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

prod-up: ## Start in production mode
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d