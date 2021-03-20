V?=patch

setup: install-dependencies create-config run
install-dependencies:
	npm ci
create-config:
	cp -n development.env.example development.env || true

# local run
run:
	NODE_ENV=development npx nodemon ./bin/index.js
run-heroku:
	NODE_ENV=development heroku local web
stop: stop-node postgres-stop postgres-test-stop
stop-node:
	kill -15 `pidof node` || true

# dev
lint:
	npx eslint .
test:
	NODE_ENV=test npm test -s
test-dev:
	NODE_ENV=test npm test -s -- --watchAll
static:
	npm run build-static
static-dev:
	npm run build-watch
version:
	npm version ${V} && git push --tags

# usage with docker
container-setup: container-build container-dependency container-run
container-build:
	docker-compose build
container-dependency:
	docker-compose run --rm ical make install-dependencies
container-run: create-config
	docker-compose run --rm -p 8080:8080 ical /bin/bash

# database
postgres:
	docker-compose up -d postgres-dev
postgres-stop:
	docker-compose stop postgres-dev
migration-generate:
	NODE_ENV=development npx typeorm -f ormconfig.cjs migration:generate -n ${name}
postgres-test-stop:
	docker-compose stop postgres-test
	docker-compose rm -f postgres-test
postgres-test: postgres-test-stop
	docker-compose up -d postgres-test
