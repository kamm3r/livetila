import { G as escape_html, d as store_get, p as unsubscribe_stores } from "../../chunks/dev.js";
import { t as page } from "../../chunks/stores.js";
//#region src/routes/+error.svelte
function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		$$renderer.push(`<div class="flex min-h-screen flex-col items-center justify-center text-center"><a href="/" class="text-secondary-foreground underline">Home</a> <div class="flex flex-col"><h1 class="font-bold text-9xl">${escape_html(store_get($$store_subs ??= {}, "$page", page).status)}</h1> <h2 class="font-bold text-4xl">Page not found</h2></div></div>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _error as default };
