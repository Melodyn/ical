setup: install-dependencies create-config run
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
container-setup: container-build container-dependency container-run
container-build:
	docker-compose build
container-dependency:
	docker-compose run --rm ical make install-dependencies
container-run: create-config
	docker-compose run --rm ical /bin/bash

postgres:
	docker run --rm -it --name postgres -p 5432:5432 \
		-e POSTGRES_USER=admin -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ical \
		-d postgres:12 || true
postgres-stop:
	docker stop postgres || true
