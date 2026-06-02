import "../../chunks/index-server.js";
import { l as slot, s as head } from "../../chunks/dev.js";
import "../../chunks/theme.js";
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Livetila</title>`);
			});
			$$renderer.push(`<meta name="description" content="live.tuloslista API, live result overlay for Live streams"/> <link rel="icon" href="/favicon.ico"/>`);
		});
		$$renderer.push(`<!--[-->`);
		slot($$renderer, $$props, "default", {}, null);
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { _layout as default };
