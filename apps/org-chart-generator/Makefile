## mkpm bootstrap
ifndef mkpm_included
ifeq ($(filter grouped-target,$(.FEATURES)),)
$(error mkpm requires GNU Make >= 4.3 (found $(MAKE_VERSION)). On macOS: brew install make, then use 'gmake')
endif
mkpm_dir := $(subst mkpm_dir=,,$(filter mkpm_dir=%,$(or $(file < .mkpmrc.local),$(file < .mkpmrc))))
ifneq ($(mkpm_dir),)
include $(if $(filter /%,$(mkpm_dir)),$(mkpm_dir),$(abspath $(mkpm_dir)))/Makefile
else
mkpm: REMOTE ?= https://mkpm.io/Makefile
mkpm:
	@curl -fsSL $(REMOTE) -o $@ || { echo "Failed to download $@ from $(REMOTE)" >&2; exit 1; }
include mkpm
endif
endif
## /mkpm bootstrap

$(call mkpm_load,docker)
$(call mkpm_load,docker_compose)

$(call mkpm_help,pnpm-install,Run <pnpm install>. Usage: make pnpm-install pkgs=<package_names> (optional, if not specified, runs pnpm install for all packages))
pnpm-install: pkgs ?= 
pnpm-install:
	$(call @docker_compose_run,web,pnpm install $(opts) $(pkgs))

$(call mkpm_help,pnpm-install-d,Run <pnpm install -d>. Usage: make pnpm-install-d pkgs=<package_names> (optional, if not specified, runs pnpm install -d for all packages))
pnpm-install-d: pkgs ?=
pnpm-install-d:
	$(call @docker_compose_run,web,pnpm install -d $(opts) $(pkgs))

$(call mkpm_help,pnpm-dlx,Run <pnpm dlx>. Usage: make pnpm-dlx cmd=<command> (required))
pnpm-dlx: cmd ?=
pnpm-dlx:
	$(call @docker_compose_run,web,pnpm dlx $(opts) $(cmd))