.PHONY: help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: package.json ## Install dependencies
	@pnpm install

install-browsers: ## Install Playwright browsers
	@pnpm --filter shadcn-admin-kit exec playwright install --with-deps chromium

run:
	pnpm exec turbo run dev --filter=shadcn-admin-kit-demo

start: run

lint: ## Run linter
	pnpm run lint

build-demo: ## Build the demo
	pnpm exec turbo run build --filter=shadcn-admin-kit-demo
	rm -rf ./public/demo
	cp -r apps/demo/dist ./public/demo

build-registry: ## Build the UI registry
	pnpm exec turbo run registry:build --filter=shadcn-admin-kit
	rm -rf ./public/r
	cp -r packages/admin-kit/dist/r ./public/r

test:
	pnpm exec turbo run test

test-watch: ## Run tests in watch mode
	pnpm --filter shadcn-admin-kit run test:watch

test-browser: ## Run tests in browser mode
	pnpm --filter shadcn-admin-kit run test:browser

test-registry: ## Test the UI registry
	cd packages/admin-kit && ./scripts/test_registry.sh

serve-registry: ## Serve the UI registry locally
	python3 -m http.server -d ./public 8080

clear-registry: ## Clear the UI registry
	rm -rf ./public/r packages/admin-kit/dist/r

storybook: ## Start the storybook
	pnpm --filter shadcn-admin-kit run storybook

run-website: ## Run the website in development mode
	pnpm exec turbo run dev --filter=shadcn-admin-kit-website

start-website: run-website

build-website: ## Build the website
	pnpm exec turbo run build --filter=shadcn-admin-kit-website
	rm -rf ./public/assets ./public/img ./public/index.html
	cp -r apps/website/dist/* ./public/

build: build-website build-doc build-demo build-registry ## Build all components

typecheck: ## Run TypeScript type checking
	@pnpm exec turbo run typecheck

doc: ## launch doc web server
	@pnpm --filter shadcn-admin-kit-doc run dev

check-doc: ## Check the doc sidebar has no orphan pages
	@pnpm --filter shadcn-admin-kit-doc run check-sidebar

check-coverage: ## Run every docs/stories/specs/demo coverage check
	@pnpm --filter shadcn-admin-kit-doc run check-coverage

build-doc: check-coverage ## Build the doc website
	pnpm exec turbo run build --filter=shadcn-admin-kit-doc
	rm -rf ./public/docs
	cp -r apps/docs/dist ./public/docs
