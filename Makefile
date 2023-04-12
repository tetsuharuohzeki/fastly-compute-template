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

APPLICATION_NAME := c_at_e_main
FASTLY_COMPUTE_AT_EDGE_SERVICE_PKG_NAME := fastly-compute-at-edge-template

COMPILE_TARGET_WASM32_WASI := wasm32-wasi

CARGO_TARGET_DIR := $(CURDIR)/target
CARGO_TARGET_WASM32_WASI_DIR := $(CURDIR)/target/$(COMPILE_TARGET_WASM32_WASI)
FASTLY_CLI_GENERATED_PKG_DIR := $(CURDIR)/pkg
INTEGRATION_TESTS_DIR := $(CURDIR)/integration_tests

CARGO_GENERATED_RELEASE_WASM_BINARY := $(CARGO_TARGET_WASM32_WASI_DIR)/release/$(APPLICATION_NAME).wasm
CARGO_GENERATED_DEBUG_WASM_BINARY := $(CARGO_TARGET_WASM32_WASI_DIR)/debug/$(APPLICATION_NAME).wasm

FASTLY_CLI_GENERATED_PKG_TAR_BALL := $(FASTLY_CLI_GENERATED_PKG_DIR)/package.tar.gz
GENERATED_WASM_BINARY := $(FASTLY_CLI_GENERATED_PKG_DIR)/main.wasm

FASTLY_TOML_ENV ?= ""

###########################
# Release Channel Mechanism
###########################

# We want to be able to rollout this application to production at all time.
# Thus we use _production_ as our default build feature set.
RELEASE_CHANNEL ?= production

RELEASE_CHANNEL_FEATURES :=
ADDITIONAL_FEATURES ?=
ifeq ($(RELEASE_CHANNEL),production)
RELEASE_CHANNEL_FEATURES := $(APPLICATION_NAME)/production
else
RELEASE_CHANNEL_FEATURES := $(APPLICATION_NAME)/canary
endif

CARGO_FEATURES_CLI_FLAGS := \
    --features $(RELEASE_CHANNEL_FEATURES),$(ADDITIONAL_FEATURES)

# We enable clippy rules as same level as `clippy:all` except `clippy:style`.
# See https://github.com/tetsuharuohzeki/fastly-compute-at-edge-template/issues/119
#
# I think rust-clippy's style rules a bit opinionated
# and I guess we don't have to enable about it. Hence, we disable it.
# If we face some problems about sorting a style,
# then we should rethink to enable `clippy:style`.
CLIPPY_RULES := \
    -W rust-2018-idioms \
    -W clippy::correctness \
    -W clippy::suspicious \
    -W clippy::complexity \
    -W clippy::perf


# We pass `-Dwarnings` flag to fail all warnings.
# see https://doc.rust-lang.org/clippy/usage.html#command-line
CLIPPY_RULES_FAIL_IF_WARNINGS :=\
    $(CLIPPY_RULES) \
    -Dwarnings


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
	integration_tests \
	generated_by_fastly

clean: $(addprefix __clean_, $(CLEAN_TARGETS)) ## Clean Build Artifacts

__clean_cargo:
	$(CARGO_BIN) clean

__clean_generated_by_fastly:
	rm -rf $(FASTLY_CLI_GENERATED_PKG_DIR)

__clean_integration_tests:
	$(MAKE) clean -C $(INTEGRATION_TESTS_DIR)


###########################
# Setup
###########################
setup_integration_tests: ## Setup integration tests including install dependencies.
	$(MAKE) setup -C $(INTEGRATION_TESTS_DIR)


###########################
# Build
###########################
build_release: __fastly_compute_validate_relase_build __cp_release_build_to_pkg_dir_in_root ## Create the release build

__cargo_build_release:
	$(CARGO_BIN) build --release --target=$(COMPILE_TARGET_WASM32_WASI) $(CARGO_FEATURES_CLI_FLAGS)

__fastly_compute_pack_release_build: __cargo_build_release __clean_generated_by_fastly
	$(FASTLY_CLI) pack --wasm-binary $(CARGO_GENERATED_RELEASE_WASM_BINARY)

__fastly_compute_validate_relase_build: __fastly_compute_pack_release_build __clean_generated_by_fastly
	$(FASTLY_CLI) validate --package $(FASTLY_CLI_GENERATED_PKG_TAR_BALL)

__cp_release_build_to_pkg_dir_in_root: __cargo_build_release __clean_generated_by_fastly
	mkdir -p $(FASTLY_CLI_GENERATED_PKG_DIR)
	cp $(CARGO_GENERATED_RELEASE_WASM_BINARY) $(GENERATED_WASM_BINARY)


build_debug: __fastly_compute_validate_debug_build __cp_debug_build_to_pkg_dir_in_root ## Create the debug build

__cargo_build_debug:
	$(CARGO_BIN) build --target=$(COMPILE_TARGET_WASM32_WASI) $(CARGO_FEATURES_CLI_FLAGS)

__fastly_compute_pack_debug_build: __cargo_build_debug __clean_generated_by_fastly
	$(FASTLY_CLI) pack --wasm-binary $(CARGO_GENERATED_DEBUG_WASM_BINARY)

__fastly_compute_validate_debug_build: __fastly_compute_pack_debug_build __clean_generated_by_fastly
	$(FASTLY_CLI) validate --package $(FASTLY_CLI_GENERATED_PKG_TAR_BALL)

__cp_debug_build_to_pkg_dir_in_root: __cargo_build_debug __clean_generated_by_fastly
	mkdir -p $(FASTLY_CLI_GENERATED_PKG_DIR)
	cp $(CARGO_GENERATED_DEBUG_WASM_BINARY) $(GENERATED_WASM_BINARY)


###########################
# Static Analysis
###########################
lint: ## Run static analysis.
	$(CARGO_BIN) clippy --workspace --all-targets $(CARGO_FEATURES_CLI_FLAGS) -- $(CLIPPY_RULES)

lint_check: ## Run static analysis and fail if there are some warnings.
	$(CARGO_BIN) clippy --workspace --all-targets $(CARGO_FEATURES_CLI_FLAGS) -- $(CLIPPY_RULES_FAIL_IF_WARNINGS)

lint_fix: ## Try to fix problems found by static analytics
	$(CARGO_BIN) clippy --fix --workspace --all-targets $(CARGO_FEATURES_CLI_FLAGS) -- $(CLIPPY_RULES)

check_integrity: ## Validate type and semantics for whole of codes by `cargo check`.
	$(CARGO_BIN) check --workspace --all-targets --target=$(COMPILE_TARGET_WASM32_WASI) $(CARGO_FEATURES_CLI_FLAGS)

lint_integration_tests: ## Run static analysis under integration_tests/
	$(MAKE) lint -C $(INTEGRATION_TESTS_DIR)

lint_check_integration_tests: ## Run static analysis under integration_tests/ and fail if there are some warnings.
	$(MAKE) lint_check -C $(INTEGRATION_TESTS_DIR)

lint_fix_integration_tests: ## Try to fix problems found by static analytics under integration_tests/
	$(MAKE) lint_fix -C $(INTEGRATION_TESTS_DIR)


###########################
# Unit Test
###########################

unittests: ## Build and run unit tests via `cargo test`
	$(CARGO_BIN) test --workspace $(CARGO_FEATURES_CLI_FLAGS)

# FIXME: Ideally, we should run unittests with wasm32-wasi target.
# But then we cannot write some test cases. So we give up run with that target for the present...
unittests_on_wasm32-wasi: __clean_cargo ## Run unit tests with target=wasm32-wasi
	$(CARGO_WASI_BIN) test --workspace $(CARGO_FEATURES_CLI_FLAGS)


###########################
# Integration Test
###########################
integration_tests: build_debug ## Build debug build && Run integration tests.
	$(MAKE) run_integration_tests -C $(CURDIR) -j

integration_tests_with_update_expectations: build_debug ## Build debug build && Run integration tests with updating expectations.
	$(MAKE) run_integration_tests_with_update_expectations -C $(CURDIR) -j

run_integration_tests: ## Run integration tests only.
	$(MAKE) run_integration_tests -C $(INTEGRATION_TESTS_DIR) RELEASE_CHANNEL=$(RELEASE_CHANNEL)

run_integration_tests_with_update_expectations: ## Run integration tests only with updating expectations.
	$(MAKE) update_expectations -C $(INTEGRATION_TESTS_DIR) RELEASE_CHANNEL=$(RELEASE_CHANNEL)


###########################
# Tools
###########################
format: ## Format a code
	$(CARGO_BIN) fmt

format_integration_tests: ## Format a code under integration_tests/
	$(MAKE) format -C $(INTEGRATION_TESTS_DIR)

format_check: ## Check code formatting
	$(CARGO_BIN) fmt --check

format_check_integration_tests: ## Check code formatting under integration_tests/
	$(MAKE) format_check -C $(INTEGRATION_TESTS_DIR)


###########################
# Local Server
###########################
serve_localy_with_release_build: build_release ## Alias to `make build_release && make run_serve_localy`.
	$(MAKE) run_serve_localy -C $(CURDIR)

serve_localy_with_debug_build: build_debug ## Alias to `make build_debug && make run_serve_localy`.
	$(MAKE) run_serve_localy -C $(CURDIR)

run_serve_localy: ## Run local development server without build an application code.
	$(FASTLY_CLI) serve --skip-build --file=$(GENERATED_WASM_BINARY) --env=$(FASTLY_TOML_ENV)

launch_local_server_formation: ## Launch the app and mock servers for integration tests.
	$(MAKE) launch_server_formation -C $(INTEGRATION_TESTS_DIR) RELEASE_CHANNEL=$(RELEASE_CHANNEL)


###########################
# Deployment
###########################
deploy: ## Invoke `fastly compute deploy`
	$(FASTLY_CLI) deploy --package $(FASTLY_CLI_GENERATED_PKG_TAR_BALL)
