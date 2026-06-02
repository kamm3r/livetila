import { G as escape_html, d as store_get, i as derived, p as unsubscribe_stores, s as head } from "../../../../chunks/dev.js";
import { t as page } from "../../../../chunks/stores.js";
import "../../../../chunks/use-haptics.js";
//#region src/routes/competition/[slug]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const slug = derived(() => store_get($$store_subs ??= {}, "$page", page).params.slug);
		const compId = derived(() => slug()?.split("-", 2)[0] ?? "");
		const eventId = derived(() => slug()?.split("-", 2)[1] ?? "");
		const compEvents = derived(() => []);
		const selectedEvent = derived(() => compEvents().find((e) => e.EventId === Number(eventId())));
		derived(() => selectedEvent()?.Category === "Track");
		derived(() => selectedEvent()?.Status === "Progress");
		const rounds = derived(() => []);
		let selectedRound = 0;
		let selectedHeat = 1;
		const currentRound = derived(() => rounds().find((r) => r.Index === selectedRound) ?? rounds()[0]);
		const heats = derived(() => currentRound()?.Heats ?? []);
		derived(() => heats().find((h) => h.Index === selectedHeat) ?? heats()[0]);
		derived(() => heats().length >= 2);
		head("1eihl1q", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html("Kilpailu")} - Livetila</title>`);
			});
		});
		$$renderer.push(`<main class="container relative mx-auto flex grow flex-col px-4 py-4 sm:p-8">`);
		if (!compId() || !eventId()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="flex flex-col items-center justify-center py-20"><h2 class="font-bold text-2xl">Virheellinen linkki</h2> <a href="/" class="mt-4 text-primary underline">Palaa etusivulle</a></div>`);
		} else {
			$$renderer.push("<!--[1-->");
			$$renderer.push(`<div class="flex flex-col gap-4"><div class="flex items-center justify-between"><div class="h-8 w-28 animate-pulse rounded-md bg-muted"></div> <div class="h-10 w-48 animate-pulse rounded-md bg-muted"></div></div> <div class="mt-2 space-y-3"><div class="h-10 w-full animate-pulse rounded bg-muted"></div> <div class="h-14 w-full animate-pulse rounded bg-muted"></div> <div class="h-14 w-full animate-pulse rounded bg-muted"></div> <div class="h-14 w-full animate-pulse rounded bg-muted"></div></div></div>`);
		}
		$$renderer.push(`<!--]--></main>`);
		if ($$store_subs) unsubscribe_stores($$store_subs);
	});
}
//#endregion
export { _page as default };
