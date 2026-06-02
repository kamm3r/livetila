import { l as slot } from "../../../chunks/dev.js";
//#region src/routes/(overlay)/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.push(`<div class="fixed inset-0 z-50"><!--[-->`);
	slot($$renderer, $$props, "default", {}, null);
	$$renderer.push(`<!--]--></div>`);
}
//#endregion
export { _layout as default };
