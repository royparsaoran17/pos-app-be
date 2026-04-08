.PHONY: pull logs up down restart ps

# Docker image name from docker-compose.yml
IMAGE := registry.digitalocean.com/so-thai/omt-be:latest
CONTAINER := omt-be

# Pull latest image
pull:
	docker pull $(IMAGE)

# View container logs (follow mode)
logs:
	docker compose logs -f

# View last N lines of logs (usage: make logs-n N=100)
logs-n:
	docker compose logs --tail=$(or $(N),100)

# Start containers in detached mode
up:
	docker compose up -d

# Stop containers
down:
	docker compose down

# Restart containers
restart:
	docker compose restart

# Show container status
ps:
	docker compose ps

# Full deploy: pull latest and restart
deploy: pull down up
	@echo "Deployed $(IMAGE)"

# Open shell in container
shell:
	docker exec -it $(CONTAINER) sh
