.PHONY: help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: package.json ## Install dependencies
	@pnpm install

install-browsers: ## Install Playwright browsers
	@pnpm --filter shadmin exec playwright install --with-deps chromium

run:
	pnpm exec turbo run dev --filter=shadmin-demo

start: run

lint: ## Run linter
	pnpm run lint

build-demo: ## Build the demo
	pnpm exec turbo run build --filter=shadmin-demo
	rm -rf ./public/demo
	cp -r apps/demo/dist ./public/demo

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
	pnpm exec turbo run dev --filter=shadmin-website

start-website: run-website

build-website: ## Build the website (incl. /docs SPA) -> ./public
	pnpm exec turbo run build --filter=shadmin-website
	rm -rf ./public/assets ./public/img ./public/index.html ./public/docs
	cp -r apps/website/dist/* ./public/
	# SPA deep-link fallback for GitHub Pages: serve the website shell on any
	# unknown path (e.g. /docs/array-field) so client routing resolves it.
	cp ./public/index.html ./public/404.html

build: build-website build-demo build-registry ## Build all components

typecheck: ## Run TypeScript type checking
	@pnpm exec turbo run typecheck
