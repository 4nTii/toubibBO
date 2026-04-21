# ============================================================
#  Makefile — Toubib Project Setup (cross-platform)
#  Tested on Windows - Works! Not tested on Unix
# ============================================================

.PHONY: all install setup env dev help

# ── Détection OS ────────────────────────────────────────────
ifeq ($(OS),Windows_NT)
  PLATFORM = windows
else
  PLATFORM = unix
endif

# ── Cible par défaut : tout faire ───────────────────────────
all: setup dev

# ── Aide ────────────────────────────────────────────────────
help:
	@echo.
	@echo Commandes disponibles :
	@echo   make         - setup complet + npm run dev
	@echo   make setup   - cree les fichiers manquants + npm install
	@echo   make install - npm install uniquement
	@echo   make env     - cree le fichier .env a partir de .env.example
	@echo   make dev     - npm run dev
	@echo.

# ── Setup complet (fichiers manquants + install) ─────────────
setup: env install
	@echo Setup termine.

# ── Création du .env depuis .env.example ────────────────────
ifeq ($(PLATFORM),windows)
env:
	@if not exist .env ( \
		if exist .env.example ( \
			copy .env.example .env > nul && \
			echo [OK] .env cree depuis .env.example && \
			echo [!]  Pense a remplir les valeurs dans .env \
		) else ( \
			echo [!]  Aucun .env.example trouve - .env non cree \
		) \
	) else ( \
		echo [·]  .env deja present, rien a faire \
	)
else
env:
	@if [ ! -f .env ]; then \
		if [ -f .env.example ]; then \
			cp .env.example .env; \
			echo "✔  .env créé depuis .env.example"; \
			echo "⚠  Pense à remplir les valeurs dans .env"; \
		else \
			echo "⚠  Aucun .env.example trouvé — .env non créé"; \
		fi \
	else \
		echo "·  .env déjà présent, rien à faire"; \
	fi
endif

# ── Installation des dépendances ────────────────────────────
install:
	@echo Installation des dependances npm...
	@npm install
	@echo npm install termine.

# ── Lancement du serveur de développement ───────────────────
dev:
	@echo Demarrage du serveur de developpement...
	@npm run dev