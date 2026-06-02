
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const API_URL: string;
	export const SHELL: string;
	export const npm_command: string;
	export const LESSHISTFILE: string;
	export const COLORTERM: string;
	export const GTK_THEME: string;
	export const AQ_DRM_DEVICES: string;
	export const HYPRLAND_CMD: string;
	export const OBS_VKCAPTURE: string;
	export const OPENCODE_EXPERIMENTAL_FILEWATCHER: string;
	export const HISTCONTROL: string;
	export const no_proxy: string;
	export const FNM_ARCH: string;
	export const XDG_BACKEND: string;
	export const PKG_CONFIG_PATH: string;
	export const npm_config_npm_globalconfig: string;
	export const QT_WAYLAND_DISABLE_WINDOWDECORATION: string;
	export const HOSTNAME: string;
	export const HISTSIZE: string;
	export const LANGUAGE: string;
	export const READER: string;
	export const NODE: string;
	export const LC_ADDRESS: string;
	export const DOTNET_ROOT: string;
	export const LC_NAME: string;
	export const XDG_DATA_HOME: string;
	export const npm_config_verify_deps_before_run: string;
	export const npm_config__jsr_registry: string;
	export const XDG_CONFIG_HOME: string;
	export const FNM_NODE_DIST_MIRROR: string;
	export const LC_MONETARY: string;
	export const DIFFPROG: string;
	export const __ETC_PROFILE_NIX_SOURCED: string;
	export const NO_AT_BRIDGE: string;
	export const XCURSOR_SIZE: string;
	export const npm_config_globalconfig: string;
	export const GPG_TTY: string;
	export const EDITOR: string;
	export const XDG_SEAT: string;
	export const PWD: string;
	export const NIX_PROFILES: string;
	export const XDG_SESSION_DESKTOP: string;
	export const LOGNAME: string;
	export const QT_QPA_PLATFORMTHEME: string;
	export const XDG_SESSION_TYPE: string;
	export const MODULESHOME: string;
	export const AQ_MGPU_NO_EXPLICIT: string;
	export const MANPATH: string;
	export const PNPM_HOME: string;
	export const AQ_FORCE_LINEAR_BLIT: string;
	export const SDL_VIDEO_MINIMIZE_ON_FOCUS_LOSS: string;
	export const XDG_PICTURES_DIR: string;
	export const TERMINAL: string;
	export const OBS_VKCAPTURE_QUIET: string;
	export const HYPRLAND_CONFIG: string;
	export const __MODULES_SHARE_MANPATH: string;
	export const MANGOHUD: string;
	export const HOME: string;
	export const SSH_ASKPASS: string;
	export const LC_PAPER: string;
	export const LANG: string;
	export const IMAGE: string;
	export const FNM_COREPACK_ENABLED: string;
	export const HYPRLAND_NO_SD_NOTIFY: string;
	export const HISTFILE: string;
	export const _JAVA_AWT_WM_NONREPARENTING: string;
	export const LS_COLORS: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const npm_package_version: string;
	export const IBUS_ENABLE_SYNC_MODE: string;
	export const STARSHIP_SHELL: string;
	export const WAYLAND_DISPLAY: string;
	export const NIX_SSL_CERT_FILE: string;
	export const pnpm_config_verify_deps_before_run: string;
	export const OPENCODE_DISABLE_EMBEDDED_WEB_UI: string;
	export const OPENCODE_EXPERIMENTAL_ICON_DISCOVERY: string;
	export const OPENCODE_SERVER_USERNAME: string;
	export const INIT_CWD: string;
	export const DOTNET_BUNDLE_EXTRACT_BASE_DIR: string;
	export const CHROME_DESKTOP: string;
	export const STARSHIP_SESSION_KEY: string;
	export const STEAM_FRAME_FORCE_CLOSE: string;
	export const XDG_CACHE_HOME: string;
	export const npm_lifecycle_script: string;
	export const MOZ_GMP_PATH: string;
	export const ROC_ENABLE_PRE_VEGA: string;
	export const XDG_SESSION_CLASS: string;
	export const TERM: string;
	export const LC_IDENTIFICATION: string;
	export const npm_package_name: string;
	export const HYPRLAND_TRACE: string;
	export const LESSOPEN: string;
	export const USER: string;
	export const npm_config_frozen_lockfile: string;
	export const NO_PROXY: string;
	export const SUDO_EDITOR: string;
	export const MODULES_RUN_QUARANTINE: string;
	export const HYPRLAND_INSTANCE_SIGNATURE: string;
	export const VISUAL: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const MOZ_ENABLE_WAYLAND: string;
	export const OPENCODE_CLIENT: string;
	export const LC_TELEPHONE: string;
	export const npm_config_manage_package_manager_versions: string;
	export const LC_MESSAGES: string;
	export const LC_MEASUREMENT: string;
	export const FNM_VERSION_FILE_STRATEGY: string;
	export const XDG_VTNR: string;
	export const XDG_SESSION_ID: string;
	export const npm_config_user_agent: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const XDG_STATE_HOME: string;
	export const npm_execpath: string;
	export const FC_FONTATIONS: string;
	export const LC_CTYPE: string;
	export const XDG_RUNTIME_DIR: string;
	export const FNM_RESOLVE_ENGINES: string;
	export const NODE_PATH: string;
	export const __MODULES_LMINIT: string;
	export const DEBUGINFOD_URLS: string;
	export const AQ_TRACE: string;
	export const LC_TIME: string;
	export const npm_package_json: string;
	export const BUN_INSTALL: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const OPENCODE_SERVER_PASSWORD: string;
	export const KDEDIRS: string;
	export const HYPRCURSOR_THEME: string;
	export const QT_AUTO_SCREEN_SCALE_FACTOR: string;
	export const LC_COLLATE: string;
	export const XCURSOR_THEME: string;
	export const XDG_DATA_DIRS: string;
	export const GDK_BACKEND: string;
	export const HYPRLAND_NO_RT: string;
	export const PATH: string;
	export const MODULEPATH: string;
	export const HISTFILESIZE: string;
	export const AQ_NO_MODIFIERS: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const MAIL: string;
	export const npm_config_registry: string;
	export const FNM_DIR: string;
	export const FNM_MULTISHELL_PATH: string;
	export const VIDEO: string;
	export const npm_node_execpath: string;
	export const FNM_LOGLEVEL: string;
	export const LC_NUMERIC: string;
	export const HYPRCURSOR_SIZE: string;
	export const HYPRLAND_NO_SD_VARS: string;
	export const MODULES_CMD: string;
	export const NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		API_URL: string;
		SHELL: string;
		npm_command: string;
		LESSHISTFILE: string;
		COLORTERM: string;
		GTK_THEME: string;
		AQ_DRM_DEVICES: string;
		HYPRLAND_CMD: string;
		OBS_VKCAPTURE: string;
		OPENCODE_EXPERIMENTAL_FILEWATCHER: string;
		HISTCONTROL: string;
		no_proxy: string;
		FNM_ARCH: string;
		XDG_BACKEND: string;
		PKG_CONFIG_PATH: string;
		npm_config_npm_globalconfig: string;
		QT_WAYLAND_DISABLE_WINDOWDECORATION: string;
		HOSTNAME: string;
		HISTSIZE: string;
		LANGUAGE: string;
		READER: string;
		NODE: string;
		LC_ADDRESS: string;
		DOTNET_ROOT: string;
		LC_NAME: string;
		XDG_DATA_HOME: string;
		npm_config_verify_deps_before_run: string;
		npm_config__jsr_registry: string;
		XDG_CONFIG_HOME: string;
		FNM_NODE_DIST_MIRROR: string;
		LC_MONETARY: string;
		DIFFPROG: string;
		__ETC_PROFILE_NIX_SOURCED: string;
		NO_AT_BRIDGE: string;
		XCURSOR_SIZE: string;
		npm_config_globalconfig: string;
		GPG_TTY: string;
		EDITOR: string;
		XDG_SEAT: string;
		PWD: string;
		NIX_PROFILES: string;
		XDG_SESSION_DESKTOP: string;
		LOGNAME: string;
		QT_QPA_PLATFORMTHEME: string;
		XDG_SESSION_TYPE: string;
		MODULESHOME: string;
		AQ_MGPU_NO_EXPLICIT: string;
		MANPATH: string;
		PNPM_HOME: string;
		AQ_FORCE_LINEAR_BLIT: string;
		SDL_VIDEO_MINIMIZE_ON_FOCUS_LOSS: string;
		XDG_PICTURES_DIR: string;
		TERMINAL: string;
		OBS_VKCAPTURE_QUIET: string;
		HYPRLAND_CONFIG: string;
		__MODULES_SHARE_MANPATH: string;
		MANGOHUD: string;
		HOME: string;
		SSH_ASKPASS: string;
		LC_PAPER: string;
		LANG: string;
		IMAGE: string;
		FNM_COREPACK_ENABLED: string;
		HYPRLAND_NO_SD_NOTIFY: string;
		HISTFILE: string;
		_JAVA_AWT_WM_NONREPARENTING: string;
		LS_COLORS: string;
		XDG_CURRENT_DESKTOP: string;
		npm_package_version: string;
		IBUS_ENABLE_SYNC_MODE: string;
		STARSHIP_SHELL: string;
		WAYLAND_DISPLAY: string;
		NIX_SSL_CERT_FILE: string;
		pnpm_config_verify_deps_before_run: string;
		OPENCODE_DISABLE_EMBEDDED_WEB_UI: string;
		OPENCODE_EXPERIMENTAL_ICON_DISCOVERY: string;
		OPENCODE_SERVER_USERNAME: string;
		INIT_CWD: string;
		DOTNET_BUNDLE_EXTRACT_BASE_DIR: string;
		CHROME_DESKTOP: string;
		STARSHIP_SESSION_KEY: string;
		STEAM_FRAME_FORCE_CLOSE: string;
		XDG_CACHE_HOME: string;
		npm_lifecycle_script: string;
		MOZ_GMP_PATH: string;
		ROC_ENABLE_PRE_VEGA: string;
		XDG_SESSION_CLASS: string;
		TERM: string;
		LC_IDENTIFICATION: string;
		npm_package_name: string;
		HYPRLAND_TRACE: string;
		LESSOPEN: string;
		USER: string;
		npm_config_frozen_lockfile: string;
		NO_PROXY: string;
		SUDO_EDITOR: string;
		MODULES_RUN_QUARANTINE: string;
		HYPRLAND_INSTANCE_SIGNATURE: string;
		VISUAL: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		MOZ_ENABLE_WAYLAND: string;
		OPENCODE_CLIENT: string;
		LC_TELEPHONE: string;
		npm_config_manage_package_manager_versions: string;
		LC_MESSAGES: string;
		LC_MEASUREMENT: string;
		FNM_VERSION_FILE_STRATEGY: string;
		XDG_VTNR: string;
		XDG_SESSION_ID: string;
		npm_config_user_agent: string;
		PNPM_SCRIPT_SRC_DIR: string;
		XDG_STATE_HOME: string;
		npm_execpath: string;
		FC_FONTATIONS: string;
		LC_CTYPE: string;
		XDG_RUNTIME_DIR: string;
		FNM_RESOLVE_ENGINES: string;
		NODE_PATH: string;
		__MODULES_LMINIT: string;
		DEBUGINFOD_URLS: string;
		AQ_TRACE: string;
		LC_TIME: string;
		npm_package_json: string;
		BUN_INSTALL: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		OPENCODE_SERVER_PASSWORD: string;
		KDEDIRS: string;
		HYPRCURSOR_THEME: string;
		QT_AUTO_SCREEN_SCALE_FACTOR: string;
		LC_COLLATE: string;
		XCURSOR_THEME: string;
		XDG_DATA_DIRS: string;
		GDK_BACKEND: string;
		HYPRLAND_NO_RT: string;
		PATH: string;
		MODULEPATH: string;
		HISTFILESIZE: string;
		AQ_NO_MODIFIERS: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		MAIL: string;
		npm_config_registry: string;
		FNM_DIR: string;
		FNM_MULTISHELL_PATH: string;
		VIDEO: string;
		npm_node_execpath: string;
		FNM_LOGLEVEL: string;
		LC_NUMERIC: string;
		HYPRCURSOR_SIZE: string;
		HYPRLAND_NO_SD_VARS: string;
		MODULES_CMD: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
