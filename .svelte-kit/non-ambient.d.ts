
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
		RouteId(): "/(overlay)" | "/(app)" | "/" | "/competition" | "/(app)/competition" | "/competition/[slug]" | "/(app)/competition/[slug]" | "/obs" | "/(overlay)/obs" | "/obs/[slug]" | "/(overlay)/obs/[slug]";
		RouteParams(): {
			"/competition/[slug]": { slug: string };
			"/(app)/competition/[slug]": { slug: string };
			"/obs/[slug]": { slug: string };
			"/(overlay)/obs/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/(overlay)": { slug?: string | undefined };
			"/(app)": { slug?: string | undefined };
			"/": { slug?: string | undefined };
			"/competition": { slug?: string | undefined };
			"/(app)/competition": { slug?: string | undefined };
			"/competition/[slug]": { slug: string };
			"/(app)/competition/[slug]": { slug: string };
			"/obs": { slug?: string | undefined };
			"/(overlay)/obs": { slug?: string | undefined };
			"/obs/[slug]": { slug: string };
			"/(overlay)/obs/[slug]": { slug: string }
		};
		Pathname(): "/" | `/competition/${string}` & {} | `/obs/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}