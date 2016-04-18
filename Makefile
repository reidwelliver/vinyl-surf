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



auth:
	.//start -d auth -r vs-base

admin:
	.//start -d admin -r vs-base

trackqueue:
	.//start -d trackqueue -r vs-base

chat:
	.//start -d chat -r vs-base

main:
	.//start -d main -r vs-base

.PHONY: clean room auth admin trackqueue rabbitmq chat main
