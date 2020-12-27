install-dependencies:
	npm ci
create-config:
	cp -n development.env.example development.env || true

# local run
run:
	NODE_ENV=development nodemon ./bin/index.js
run-heroku:
	NODE_ENV=development heroku local web

# dev
lint:
	npx eslint .
test:
	NODE_ENV=test npm test -s
test-dev:
	NODE_ENV=test npm test -s -- --watchAll

# usage with docker
container_setup: container_build container_dependency container_start
container_build:
	docker-compose build
container_dependency:
	docker-compose run --rm ical make install-dependencies
container_start:
	docker-compose run --rm ical /bin/bash
