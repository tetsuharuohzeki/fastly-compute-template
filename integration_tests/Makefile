NODE_BIN := node
NPM_BIN := npm
NPM_RUN := $(NPM_BIN) run

SRC_DIR := $(CURDIR)/src
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
CLEAN_TARGETS := \
	dependencies

clean: $(addprefix __clean_, $(CLEAN_TARGETS)) ## Clean Artifacts.

__clean_dependencies:
	rm -rf $(NODE_MODULES_DIR)


###########################
# Setup
###########################
setup: ## Setup with install dependencies.
	$(NPM_BIN) install


###########################
# Test
###########################
run_integration_tests: ## Run integration tests only.
	env RELEASE_CHANNEL=$(RELEASE_CHANNEL) $(NODE_BIN) $(SRC_DIR)/supervisor.js

update_expectations: ## Run integration tests only with updating expectations.
	env RELEASE_CHANNEL=$(RELEASE_CHANNEL) UPDATE_SNAPSHOTS=true $(NODE_BIN) $(INTEGRATION_TESTS_DIR)/src/supervisor.js


###########################
# Tools
###########################
format: ## Format a code
	$(NPM_RUN) format

format_check: ## Check code formatting
	$(NPM_RUN) format:check

launch_server_formation: ## Launch the app and mock servers for integration tests.
	env LAUNCH_INTEGRATION_TEST_FORMATION=true RELEASE_CHANNEL=$(RELEASE_CHANNEL) $(NODE_BIN) $(SRC_DIR)/supervisor.js
