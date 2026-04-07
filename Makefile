.PHONY: pull up down logs ps restart build

# Pull latest images
pull:
	docker compose pull

# Start containers in detached mode
up:
	docker compose up -d

# Stop containers
down:
	docker compose down

# View logs (follow mode)
logs:
	docker compose logs -f

# View logs for specific service
logs-%:
	docker compose logs -f $*

# List running containers
ps:
	docker compose ps

# Restart containers
restart:
	docker compose restart

# Build images
build:
	docker compose build

# Full restart: pull, down, up
redeploy: pull down up
