NODE_BIN := node
NPM_BIN := pnpm
NPM_RUN := $(NODE_BIN) --run

SRC_DIR := $(CURDIR)/src
SUPERVISOR_SRC_DIR := $(CURDIR)/supervisor/src
NODE_MODULES_DIR := $(CURDIR)/node_modules

all: help

.PHONY: help
help:
	@echo "Specify the task"
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@exit 1


###########################
# Clean
###########################
clean: ## Clean Artifacts.


###########################
# Setup
###########################
setup: ## Setup with install dependencies.
	$(NPM_BIN) install


###########################
# Test
###########################
run_integration_tests: ## Run integration tests only.
	$(NODE_BIN) $(SUPERVISOR_SRC_DIR)/main.js --release-channel=$(RELEASE_CHANNEL)

update_expectations: ## Run integration tests only with updating expectations.
	$(NODE_BIN) $(SUPERVISOR_SRC_DIR)/main.js --release-channel=$(RELEASE_CHANNEL) --update-snapshots


###########################
# Tools
###########################
typecheck: ## Run type checking
	$(NPM_RUN) typecheck

lint: ## Run static analysis
	$(NPM_RUN) lint

lint_check: ## Run static analysis and fail if there are some warnings.
	$(NPM_RUN) lint:check

lint_fix: ## Try to fix problems found by static analytics
	$(NPM_RUN) lint:fix

format: ## Format a code
	$(NPM_RUN) format

format_check: ## Check code formatting
	$(NPM_RUN) format:check

launch_server_formation: ## Launch the app and mock servers for integration tests.
	$(NODE_BIN) $(SUPERVISOR_SRC_DIR)/main.js --release-channel=$(RELEASE_CHANNEL) --is-only-formation
