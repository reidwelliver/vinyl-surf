buildutils:
	curl -o master.zip https://codeload.github.com/reidwelliver/docker-deployer/zip/master
	unzip master.zip
	rm master.zip
	mv docker-deployer-master buildutils

clean:
	@ rm -r buildutils 2>/dev/null || true

docker-clean:
	docker ps -a | grep vs-base- | awk '{print $NF}' | xargs -I {} docker rm {}

room: buildutils
	./buildutils/start -d room -r vs-base

.PHONY: clean room