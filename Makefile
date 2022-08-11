.PHONY: build client/build

build:
	yarn run build
	yarn --cwd client build

format:
	prettier --write main.ts
	prettier --write shared/
	prettier --write lib/
	yarn --cwd client format
	prettier --write tensorflow

