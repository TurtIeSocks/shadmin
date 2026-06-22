.PHONY: help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: package.json ## Install dependencies
	@pnpm install

install-browsers: ## Install Playwright browsers
	@pnpm --filter shadmin exec playwright install --with-deps chromium

run:
	pnpm exec turbo run dev --filter=website

start: run

lint: ## Run linter
	pnpm run lint

build-registry: ## Build the UI registry
	pnpm exec turbo run registry:build --filter=shadmin
	rm -rf ./public/r
	cp -r packages/shadmin/dist/r ./public/r

test:
	pnpm exec turbo run test

test-watch: ## Run tests in watch mode
	pnpm --filter shadmin run test:watch

test-browser: ## Run tests in browser mode
	pnpm --filter shadmin run test:browser

test-registry: ## Test the UI registry
	cd packages/shadmin && ./scripts/test-registry.sh

serve-registry: ## Serve the UI registry locally
	python3 -m http.server -d ./public 8080

clear-registry: ## Clear the UI registry
	rm -rf ./public/r packages/shadmin/dist/r

storybook: ## Start the storybook
	pnpm --filter shadmin run storybook

run-website: ## Run the website in development mode
	pnpm exec turbo run dev --filter=website

start-website: run-website

build-website: ## Build the unified site (landing + /docs + /demo SPA) -> ./public
	pnpm exec turbo run build --filter=website
	rm -rf ./public/assets ./public/img ./public/docs ./public/index.html ./public/404.html ./public/__spa-fallback.html
	# react-router build (ssr:false) emits the static site to build/client,
	# including __spa-fallback.html + 404.html for GitHub Pages deep-link refreshes.
	cp -r apps/website/build/client/* ./public/

build: build-website build-registry ## Build all components

typecheck: ## Run TypeScript type checking
	@pnpm exec turbo run typecheck
