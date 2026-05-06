# Makefile — RecycleChain development environment
# Launches PostgreSQL, Spring Boot backend, and React frontend in order.
#
# Usage:
#   make dev    — start all three services
#   make stop   — stop PostgreSQL (Docker)
#   make help   — show available commands

BACKEND_DIR  := backend
FRONTEND_DIR := frontend
BACKEND_PORT := 8080
FRONTEND_PORT := 5173

.PHONY: dev stop help

help:
	@echo ""
	@echo "  RecycleChain — dev environment"
	@echo ""
	@echo "  make dev    Start PostgreSQL + backend + frontend"
	@echo "  make stop   Stop PostgreSQL (Docker)"
	@echo ""

dev:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  RecycleChain — starting dev environment"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""

	@echo "▶  [1/3] Starting PostgreSQL..."
	@docker compose -f $(BACKEND_DIR)/docker-compose.yml up -d
	@echo "⏳  Waiting for PostgreSQL to be ready..."
	@until docker compose -f $(BACKEND_DIR)/docker-compose.yml exec -T db pg_isready -U postgres > /dev/null 2>&1; do \
		printf "."; \
		sleep 1; \
	done
	@echo ""
	@echo "✅  PostgreSQL ready"
	@echo ""

	@echo "▶  [2/3] Starting Spring Boot backend (port $(BACKEND_PORT))..."
	@cd $(BACKEND_DIR) && ./mvnw spring-boot:run > /tmp/recyclechain-backend.log 2>&1 &
	@echo "⏳  Waiting for backend on port $(BACKEND_PORT)..."
	@until curl -s -o /dev/null -w "%{http_code}" http://localhost:$(BACKEND_PORT)/api/auth/login | grep -qE "^(200|405|400)"; do \
		printf "."; \
		sleep 2; \
	done
	@echo ""
	@echo "✅  Backend ready on http://localhost:$(BACKEND_PORT)"
	@echo "    Logs: tail -f /tmp/recyclechain-backend.log"
	@echo ""

	@echo "▶  [3/3] Starting React frontend (port $(FRONTEND_PORT))..."
	@echo "✅  Frontend starting on http://localhost:$(FRONTEND_PORT)"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  All services running. Press Ctrl+C to stop frontend."
	@echo "  Run 'make stop' to stop PostgreSQL."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@cd $(FRONTEND_DIR) && npm run dev

stop:
	@echo "▶  Stopping PostgreSQL..."
	@docker compose -f $(BACKEND_DIR)/docker-compose.yml down
	@echo "✅  PostgreSQL stopped"
	@echo "ℹ   Kill backend with: kill $$(lsof -ti:$(BACKEND_PORT))"
