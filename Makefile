buildutils:
	curl -o master.zip https://codeload.github.com/reidwelliver/docker-deployer/zip/master
	unzip master.zip
	rm master.zip
	mv docker-deployer-master buildutils


buildutil-clean:
	@ echo "removing build utilities..."
	@ rm -r buildutils 2>/dev/null || true

docker-clean: docker-container-clean docker-image-clean

docker-container-clean:
	@ echo "removing docker containers..."
	@ docker ps -a | grep "vs-base-" | awk '{print $$NF}' | xargs -I {} docker rm {}

docker-image-clean:
	@ echo "removing docker images..."
	@ docker images | grep "vs-base" | grep build | awk '{print $$2}' | xargs -I {} docker rmi reidwelliver/vs-base:{}

clean: buildutil-clean docker-clean


rabbitmq:
	docker build -t reidwelliver/vs-rabbit:latest rabbitmq/
	docker run -d --net=host --name vs-rabbit reidwelliver/vs-rabbit:latest


room: buildutils
	./buildutils/start -d room -r vs-base

auth: buildutils
	./buildutils/start -d auth -r vs-base

admin: buildutils
	./buildutils/start -d admin -r vs-base

trackqueue: buildutils
	./buildutils/start -d trackqueue -r vs-base

chat: buildutils
	./buildutils/start -d chat -r vs-base

.PHONY: clean room auth admin trackqueue rabbitmq chat
