declare module "web-haptics/svelte" {
	import type { HapticInput, TriggerOptions, WebHapticsOptions } from "web-haptics";

	export type { HapticInput, TriggerOptions, WebHapticsOptions };

	export function createWebHaptics(options?: WebHapticsOptions): {
		trigger: (input?: HapticInput, options?: TriggerOptions) => Promise<void>;
		cancel: () => void;
		destroy: () => void;
		setDebug: (debug: boolean) => void;
		isSupported: boolean;
	};
}
