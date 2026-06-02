import "../../../chunks/index-server.js";
import { l as slot } from "../../../chunks/dev.js";
import "../../../chunks/theme.js";
//#endregion
//#region src/lib/components/mode-switcher.svelte
function Mode_switcher($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
//#region src/lib/components/navbar.svelte
function Navbar($$renderer) {
	$$renderer.push(`<header class="flex items-center justify-between px-4 pt-3 pb-2 sm:px-8 sm:pt-4 sm:pb-4"><a href="/" class="relative whitespace-nowrap font-bold text-xl sm:text-2xl">Livetila <sup class="absolute top-0 left-[calc(100%+.25rem)] font-extrabold text-muted-foreground text-[10px] sm:text-xs">[BETA]</sup></a> `);
	Mode_switcher($$renderer, {});
	$$renderer.push(`<!----></header>`);
}
//#endregion
//#region src/routes/(app)/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.push(`<div class="relative flex min-h-dvh flex-col pt-[env(safe-area-inset-top)]"><div class="flex min-h-0 flex-1 flex-col">`);
	Navbar($$renderer, {});
	$$renderer.push(`<!----> <!--[-->`);
	slot($$renderer, $$props, "default", {}, null);
	$$renderer.push(`<!--]--></div></div>`);
}
//#endregion
export { _layout as default };
