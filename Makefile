install-dependencies:
	npm ci

lint:
	npx eslint .

test:
	npm test

run:
	./bin/index.js

# usage with docker
container_setup: container_build container_dependency container_start
container_build:
	docker-compose build
container_dependency:
	docker-compose run --rm ical make install-dependencies
container_start:
	docker-compose run --rm ical /bin/bash
