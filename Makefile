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

CARGO_BIN := cargo
CARGO_WASI_BIN := cargo wasi
FASTLY_CLI := fastly compute

APPLICATION_NAME := fastly-compute-at-edge-template

COMPILE_TARGET := wasm32-wasi

FASTLY_CLI_GENERATED_BIN_DIR := $(CURDIR)/bin
FASTLY_CLI_GENERATED_PKG_DIR := $(CURDIR)/pkg

CARGO_GENERATED_RELEASE_WASM_BINARY := $(CURDIR)/target/$(COMPILE_TARGET)/release/$(APPLICATION_NAME).wasm
FASTLY_CLI_GENERATED_PKG_TAR_BALL := $(CURDIR)/pkg/$(APPLICATION_NAME).tar.gz
FASTLY_CLI_ARCHIVED_WASM_BINARY := $(CURDIR)/pkg/$(APPLICATION_NAME)/bin/main.wasm

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
	$(CARGO_BIN) clean

__clean_generated_by_fastly:
	rm -r $(FASTLY_CLI_GENERATED_BIN_DIR)
	rm -r $(FASTLY_CLI_GENERATED_PKG_DIR)


###########################
# Build
###########################
build_release: __fastly_compute_validate_relase_build ## Create the release build

__cargo_build_release:
	$(CARGO_BIN) build --release --target=$(COMPILE_TARGET)

__fastly_compute_pack_release_build: __cargo_build_release
	$(FASTLY_CLI) pack --wasm-binary $(CARGO_GENERATED_RELEASE_WASM_BINARY)

__fastly_compute_validate_relase_build: __fastly_compute_pack_release_build
	$(FASTLY_CLI) validate --package $(FASTLY_CLI_GENERATED_PKG_TAR_BALL)

cargo_build: ## Build by `cargo build` simply (for compile checking purpose)
	$(CARGO_BIN) build --target=$(COMPILE_TARGET)


###########################
# Static Analysis
###########################
clippy: ## Run static analysis via `cargo clippy`
	$(CARGO_BIN) clippy --workspace --all-targets

clippy_check: ## Run static analysis and fail if there are some warnings.
	$(CARGO_BIN) clippy --workspace --all-targets -- -D clippy::all

clippy_fix: ## Try to fix problems founded by static analytics
	$(CARGO_BIN) clippy --fix --workspace --all-targets

typecheck: ## Check whole code consistency via `cargo check`
	$(CARGO_BIN) check --workspace --all-targets --target=$(COMPILE_TARGET)


###########################
# Test
###########################

unittest: ## Build and run unit tests via `cargo test`
	$(CARGO_BIN) test --workspace

# FIXME: Ideally, we should run unittests with wasm32-wasi target.
# But then we cannot write some test cases. So we give up run with that target for the present...
unittest_on_wasm32-wasi: __clean_cargo ## Run unit tests with target=wasm32-wasi
	$(CARGO_WASI_BIN) test --workspace


###########################
# Tools
###########################
format: ## Format a code
	$(CARGO_BIN) fmt

format_check: ## Check code formatting
	$(CARGO_BIN) fmt --check

serve_localy_with_release_build: build_release ## Build and run local development server.
	$(MAKE) run_serve_localy -C $(CURDIR)

run_serve_localy: ## Run local development server without build an application code.
	$(FASTLY_CLI) serve --skip-build --file=$(FASTLY_CLI_ARCHIVED_WASM_BINARY)


###########################
# Deployment
###########################
deploy: ## Invoke `fastly compute deploy`
	$(FASTLY_CLI) deploy --package $(FASTLY_CLI_GENERATED_PKG_TAR_BALL)
