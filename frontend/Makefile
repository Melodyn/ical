V?=patch
COVERAGE_FLAG?=--coverage

setup: install-dependencies run
install-dependencies:
	npm ci

# dev
test:
	NODE_ENV=test npm test -s
test-coverage:
	NODE_ENV=test npm test -s -- --coverage
lint:
	npx eslint . --ext .jsx --ext .js
run:
	npm run dev
build:
	npm run build
version:
	npm version ${V}
dep-update:
	npx npm-check-updates -u

ci-build:
	NODE_ENV=development CI=false make install-dependencies
	NODE_ENV=production CI=true make build

# docker
container-setup: container-build container-dependencies container-run
container-build:
	docker-compose build
container-dependencies:
	docker-compose run --rm frontend make install-dependencies
container-run:
	docker-compose run --rm -p 8080:8080 frontend /bin/bash