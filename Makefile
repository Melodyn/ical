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

# database
postgres:
	docker-compose up -d postgres
postgres-stop:
	docker-compose stop postgres
migration-generate:
	NODE_ENV=development npx typeorm -f ormconfig.cjs migration:generate -n ${name}
