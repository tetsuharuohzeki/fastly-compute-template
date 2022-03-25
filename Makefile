############ CAUTION ########################
#
#   PLEASE DO NOT WRITE "COMPLEX" CODE in this Makefile
#
# Makefile (GNU Make) is nice tools as a command dispatcher than
# other almost tools.
#
# However, Makefile is easy to be complex spaghetti code.
# GNU Make provide many useful and horrible features
# which we can use it as foot-gun easiliy.
# They can fire your job if you write a "bit complex" code for Makefile.
#
#   PLEASE DO NOT WRITE "COMPLEX" CODE in this Makefile.
#
# If you maintain this file,
# please write your code explicitly even if that is verbose.
#
# You would feel to want to use "powerful (awful)" GNU Make's features.
# But do not. It's trap.
# You should doubt. You don't have to use such powerful feature to achive your purpose.
# Instead, write explicitly verbose. Please write explicitly.
#
# Nevertheless, you need to consider 3 time that this awful feature only can do your porpose.
# Please think it. GNU Make is like jQuery.
# These tools are powerful and super convinient. But it make your code horrible easily.
#
#   PLEASE DO NOT WRITE "COMPLEX" CODE in this Makefile.
#
############ CAUTION ########################

FASTLY_CLI := fastly compute

FASTLY_CLI_GENERATED_BIN_DIR := $(CURDIR)/bin
FASTLY_CLI_GENERATED_PKG_DIR := $(CURDIR)/pkg

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
	cargo \
	generated_by_fastly

clean: $(addprefix __clean_, $(CLEAN_TARGETS)) ## Clean Build Artifacts

__clean_cargo:
	cargo clean

__clean_generated_by_fastly:
	rm -r $(FASTLY_CLI_GENERATED_BIN_DIR)
	rm -r $(FASTLY_CLI_GENERATED_PKG_DIR)


###########################
# Build
###########################
build: ## Build by fastly CLI
	$(FASTLY_CLI) build

cargo_build: ## Build by `cargo build` simply (for compile checking purpose)
	cargo build


###########################
# Static Analysis
###########################
clippy: ## Invoke `cargo clippy`
	cargo clippy

check: ## Invoke `cargo check`
	cargo check


###########################
# Test
###########################

# FIXME: cargo test will run generated wasm binary natively and would be fail. We need to think something to workaround
unittest: ## Build and run unit tests `cargo test`
	cargo test


###########################
# Tools
###########################
format: ## Format a code
	cargo fmt


###########################
# Fastly CLI
###########################
deploy: ## Invoke `fastly compute deploy`
	$(FASTLY_CLI) deploy

serve_localy: ## Run local development server provided by `fastly compute serve`
	$(FASTLY_CLI) serve
