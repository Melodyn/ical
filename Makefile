install-dependencies:
	npm ci

lint:
	npx eslint .

test:
	npm test

run:
	./bin/index.js
