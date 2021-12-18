V?=patch
USER_UID=$(shell id -u)
USER_GID=$(shell id -g)

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
version:
	npm version ${V} && git push --tags
dep-update:
	npx npm-check-updates -u

# usage with docker
container-setup: container-build container-dependency container-run
container-build:
	docker-compose build
container-dependency:
	docker-compose run --rm -u $(USER_UID):$(USER_GID) backend make install-dependencies
container-run: create-config
	docker-compose run --rm -u $(USER_UID):$(USER_GID) -p 5000:5000 backend /bin/bash

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
