
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/(overlay)" | "/(app)" | "/" | "/competition" | "/competition/[slug]" | "/obs" | "/obs/[slug]";
		RouteParams(): {
			"/competition/[slug]": { slug: string };
			"/obs/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/(overlay)": Record<string, never>;
			"/(app)": Record<string, never>;
			"/": { slug?: string | undefined };
			"/competition": { slug?: string | undefined };
			"/competition/[slug]": { slug: string };
			"/obs": { slug?: string | undefined };
			"/obs/[slug]": { slug: string }
		};
		Pathname(): "/" | `/competition/${string}` & {} | `/obs/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}