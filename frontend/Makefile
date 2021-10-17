V?=patch

setup: install-dependencies run
install-dependencies:
	npm ci

# dev
test:
	npm test
lint:
	npx eslint . --ext .jsx --ext .js
run:
	npm run dev
build:
	npm run build
version:
	npm version ${V}

ci-build:
	NODE_ENV=development CI=false make install-dependencies
	NODE_ENV=production CI=true make build
