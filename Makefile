rabbitmq:
	docker build -t reidwelliver/vs-rabbit:latest rabbitmq/
	docker run -d --net=host --name vs-rabbit reidwelliver/vs-rabbit:latest


# Targets to build room
.PHONY: room room-clean room-build room-attach

room:
	docker-compose -p room -f room/docker/compose.yml up -d

room-clean:
	docker-compose -p room -f room/docker/compose.yml down

room-build: docker-check docker-compose base-check
	docker-compose -p room -f room/docker/compose.yml build

room-attach:
	docker exec -it vs-room /bin/bash



# Targets to build auth
.PHONY: auth auth-clean auth-build auth-attach

auth:
	docker-compose -p auth -f auth/docker/compose.yml up -d

auth-clean:
	docker-compose -p auth -f auth/docker/compose.yml down

auth-build: docker-check docker-compose base-check
	docker-compose -p auth -f auth/docker/compose.yml build

auth-attach:
	docker exec -it vs-auth /bin/bash



# Targets to build admin
.PHONY: admin admin-clean admin-build admin-attach

admin:
	docker-compose -p admin -f admin/docker/compose.yml up -d

admin-clean:
	docker-compose -p admin -f admin/docker/compose.yml down

admin-build: docker-check docker-compose base-check
	docker-compose -p admin -f admin/docker/compose.yml build

admin-attach:
	docker exec -it vs-admin /bin/bash



# Targets to build trackqueue
.PHONY: trackqueue trackqueue-clean trackqueue-build trackqueue-attach

trackqueue:
	docker-compose -p trackqueue -f trackqueue/docker/compose.yml up -d

trackqueue-clean:
	docker-compose -p trackqueue -f trackqueue/docker/compose.yml down

trackqueue-build: docker-check docker-compose base-check
	docker-compose -p trackqueue -f trackqueue/docker/compose.yml build

trackqueue-attach:
	docker exec -it vs-trackqueue /bin/bash



# Targets to build web (web)
.PHONY: web web-clean web-build web-attach

web:
	docker-compose -p web -f web/docker/compose.yml up -d

web-clean:
	docker-compose -p web -f web/docker/compose.yml down

web-build: docker-check docker-compose base-check
	docker-compose -p web -f web/docker/compose.yml build

web-attach:
	docker exec -it vs-web /bin/bash



# Targets to build all (web)
.PHONY: all all-clean all-build all-attach

all:
	docker-compose -p vinyl-surf -f compose.yml up -d

all-clean:
	docker-compose -p vinyl-surf -f compose.yml down

all-build: docker-check docker-compose base-check
	docker-compose -p vinyl-surf -f compose.yml build
