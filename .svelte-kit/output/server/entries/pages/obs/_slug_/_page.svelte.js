import { G as escape_html, U as attr, d as store_get, i as derived, o as ensure_array_like, p as unsubscribe_stores } from "../../../../chunks/dev.js";
import { t as page } from "../../../../chunks/stores.js";
import "../../../../chunks/utils2.js";
import { t as sortByResult } from "../../../../chunks/results.js";
//#region src/routes/obs/[slug]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const slug = derived(() => store_get($$store_subs ??= {}, "$page", page).params.slug ?? "");
		derived(() => slug().split("-", 2)[0] ?? "");
		derived(() => slug().split("-", 2)[1] ?? "");
		const selectedHeat = derived(() => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("heat"));
		const selectedRound = derived(() => store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("round"));
		const eventCategory = derived(() => "Field");
		derived(() => eventCategory() === "Track" || eventCategory() === "Relay");
		derived(() => (Number(selectedRound()) || 1) - 1);
		const rounds = derived(() => void 0);
		const heats = derived(() => rounds()?.Heats ?? []);
		const heatIndexRaw = derived(() => selectedHeat() ? Number(selectedHeat()) - 1 : null);
		const heatIndex = derived(() => heatIndexRaw() != null && Number.isInteger(heatIndexRaw()) ? heatIndexRaw() : null);
		const heatExists = derived(() => heatIndex() != null && heatIndex() >= 0 && heatIndex() < heats().length);
		const heat = derived(() => heatExists() ? heats()[heatIndex()] : null);
		derived(() => (selectedHeat() ? heat()?.Allocations ?? [] : rounds()?.TotalResults ?? []).slice().sort((a, b) => sortByResult(a, b, "Field")));
		if (rounds() && selectedHeat() && !heatExists()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex min-h-screen items-center justify-center"><div class="max-w-md rounded-lg bg-black/90 p-6 text-center"><p class="text-cyan-300 text-xl">Erä ${escape_html(selectedHeat())} ei ole olemassa</p> <p class="mt-2 text-gray-400 text-sm">Tämä tapahtuma sisältää ${escape_html(heats().length)} erää.</p></div></div>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="max-w-xs text-gray-50"><div class="w-full max-w-xs border-cyan-300 border-t-2 bg-black/90"><h2 class="px-2 text-cyan-300 uppercase">`);
			if (rounds()?.Name) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`${escape_html(rounds().Name)}`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="my-1 h-4 w-28 animate-pulse rounded bg-gray-700/60"></div>`);
			}
			$$renderer.push(`<!--]--></h2> <div class="flex justify-between"><h3 class="bg-cyan-300 px-2 text-black uppercase">`);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="my-1 h-4 w-24 animate-pulse rounded bg-black/20"></div>`);
			$$renderer.push(`<!--]--></h3> <h4 class="px-2 uppercase">Tulos</h4></div> `);
			{
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<ul><!--[-->`);
				const each_array = ensure_array_like(Array(8));
				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					each_array[i];
					$$renderer.push(`<li class="border-black/50 border-t-2"${attr("key", i)}><div class="flex flex-[1_1_100%] justify-between px-4 py-2"><div class="h-4 w-40 animate-pulse rounded bg-gray-700/60"></div> <div class="h-4 w-16 animate-pulse rounded bg-gray-700/60"></div></div></li>`);
				}
				$$renderer.push(`<!--]--></ul>`);
			}
			$$renderer.push(`<!--]--></div> <h1 class="mt-1 inline-flex bg-black/90 p-1 text-cyan-300 uppercase">`);
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<div class="my-1 h-4 w-24 animate-pulse rounded bg-gray-700/60"></div>`);
			$$renderer.push(`<!--]--></h1></div>`);
		}
		$$renderer.push(`<!--]-->`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
