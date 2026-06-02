import "../../../chunks/index-server.js";
import { G as escape_html, U as attr, W as clsx, a as element, f as stringify, i as derived, it as getContext, n as attr_style, o as ensure_array_like, r as attributes, u as spread_props } from "../../../chunks/dev.js";
import "../../../chunks/use-haptics.js";
import "../../../chunks/utils2.js";
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/defaultAttributes.js
/**
* @file
* @license @lucide/svelte v1.17.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": 2,
	"stroke-linecap": "round",
	"stroke-linejoin": "round"
};
//#endregion
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/utils/hasA11yProp.js
/**
* @file
* @license @lucide/svelte v1.17.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* Check if a component has an accessibility prop
*
* @param {object} props
* @returns {boolean} Whether the component has an accessibility prop
*/
var hasA11yProp = (props) => {
	for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
	return false;
};
//#endregion
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/context.js
/**
* @file
* @license @lucide/svelte v1.17.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LucideContext = Symbol("lucide-context");
var getLucideContext = () => getContext(LucideContext);
//#endregion
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/Icon.svelte
function Icon($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const globalProps = getLucideContext() ?? {};
		const { name, color = globalProps.color ?? "currentColor", size = globalProps.size ?? 24, strokeWidth = globalProps.strokeWidth ?? 2, absoluteStrokeWidth = globalProps.absoluteStrokeWidth ?? false, iconNode = [], children, $$slots, $$events, ...props } = $$props;
		const calculatedStrokeWidth = derived(() => absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth);
		$$renderer.push(`<svg${attributes({
			...defaultAttributes,
			...!children && !hasA11yProp(props) && { "aria-hidden": "true" },
			...props,
			width: size,
			height: size,
			stroke: color,
			"stroke-width": calculatedStrokeWidth(),
			class: clsx([
				"lucide-icon lucide",
				globalProps.class,
				name && `lucide-${name}`,
				props.class
			])
		}, void 0, void 0, void 0, 3)}><!--[-->`);
		const each_array = ensure_array_like(iconNode);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [tag, attrs] = each_array[$$index];
			element($$renderer, tag, () => {
				$$renderer.push(`${attributes({ ...attrs }, void 0, void 0, void 0, 3)}`);
			});
		}
		$$renderer.push(`<!--]-->`);
		children?.($$renderer);
		$$renderer.push(`<!----></svg>`);
	});
}
//#endregion
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/icons/arrow-right.svelte
function Arrow_right($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "arrow-right" },
		props,
		{ iconNode: [["path", { "d": "M5 12h14" }], ["path", { "d": "m12 5 7 7-7 7" }]] }
	]));
}
//#endregion
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/icons/calendar.svelte
function Calendar($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "calendar" },
		props,
		{ iconNode: [
			["path", { "d": "M8 2v4" }],
			["path", { "d": "M16 2v4" }],
			["rect", {
				"width": "18",
				"height": "18",
				"x": "3",
				"y": "4",
				"rx": "2"
			}],
			["path", { "d": "M3 10h18" }]
		] }
	]));
}
//#endregion
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/icons/chevron-right.svelte
function Chevron_right($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "chevron-right" },
		props,
		{ iconNode: [["path", { "d": "m9 18 6-6-6-6" }]] }
	]));
}
//#endregion
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/icons/clock.svelte
function Clock($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "clock" },
		props,
		{ iconNode: [["circle", {
			"cx": "12",
			"cy": "12",
			"r": "10"
		}], ["path", { "d": "M12 6v6l4 2" }]] }
	]));
}
//#endregion
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/icons/loader-circle.svelte
function Loader_circle($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "loader-circle" },
		props,
		{ iconNode: [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]] }
	]));
}
//#endregion
//#region node_modules/.pnpm/@lucide+svelte@1.17.0_svelte@5.56.1/node_modules/@lucide/svelte/dist/icons/search.svelte
function Search($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;
	Icon($$renderer, spread_props([
		{ name: "search" },
		props,
		{ iconNode: [["path", { "d": "m21 21-4.34-4.34" }], ["circle", {
			"cx": "11",
			"cy": "11",
			"r": "8"
		}]] }
	]));
}
//#endregion
//#region src/lib/components/search-form.svelte
function Search_form($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function extractEvents(data) {
			const results = [];
			for (const dateKey of Object.keys(data)) {
				const events = data[dateKey];
				if (events) for (const event of events) {
					const compDate = new Date(event.BeginDateTimeWithTZ);
					results.push({
						Id: event.EventId,
						EventName: event.EventName,
						Name: event.Name,
						Date: `${String(compDate.getDate()).padStart(2, "0")}.${String(compDate.getMonth() + 1).padStart(2, "0")}.`,
						Time: `${String(compDate.getHours()).padStart(2, "0")}:${String(compDate.getMinutes()).padStart(2, "0")}`
					});
				}
			}
			return results;
		}
		let query = "";
		let navigatingTo = null;
		let competitions = [];
		let events = {};
		let isLoadingComps = true;
		let isLoadingEvents = false;
		const step = derived(() => "competitions");
		const filteredCompetitions = derived(() => {
			if (!competitions.length) return [];
			const sorted = [...competitions].sort((a, b) => b.Date.localeCompare(a.Date));
			if (!query.trim()) return sorted;
			return sorted.filter((comp) => comp.Name.toLowerCase().includes(query.toLowerCase()));
		});
		const filteredEvents = derived(() => {
			const allEvents = extractEvents(events).sort((a, b) => a.Time.localeCompare(b.Time));
			const eventQuery = query.includes("/") ? query.split("/").pop()?.trim() ?? "" : "";
			if (!eventQuery) return allEvents;
			return allEvents.filter((evt) => evt.EventName.toLowerCase().includes(eventQuery.toLowerCase()));
		});
		const isLoading = derived(() => step() === "competitions" ? isLoadingComps : isLoadingEvents);
		const results = derived(() => step() === "competitions" ? filteredCompetitions() : filteredEvents());
		const hasResults = derived(() => results().length > 0);
		const showDropdown = derived(() => hasResults() || false);
		$$renderer.push(`<div class="relative mx-auto w-full max-w-2xl"><div class="overflow-visible bg-transparent" role="search"><div class="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl"${attr_style(`box-shadow: ${showDropdown() ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"}`)}><div class="relative z-10"><div class="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">`);
		Search($$renderer, { class: "size-5" });
		$$renderer.push(`<!----> <input class="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-base"${attr("placeholder", step() === "events" ? "Hae lajeja..." : "Hae kilpailuja nimellä...")} type="text"${attr("value", query)}/> `);
		if (isLoading()) {
			$$renderer.push("<!--[0-->");
			Loader_circle($$renderer, { class: "size-5 animate-spin text-primary" });
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> `);
		if (showDropdown()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="mx-4 h-px bg-linear-to-r from-transparent via-border to-transparent"></div> <div class="overflow-hidden"><div class="p-2"><div class="max-h-80 overflow-y-auto">`);
			if (isLoading()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<div class="flex flex-col items-center gap-3 py-8"><div class="relative"><div class="absolute inset-0 rounded-full bg-primary/20"></div> `);
				Loader_circle($$renderer, { class: "relative size-6 animate-spin text-primary" });
				$$renderer.push(`<!----></div> <p class="text-muted-foreground text-sm">${escape_html(step() === "events" ? "Ladataan lajeja..." : "Ladataan kilpailuja...")}</p></div>`);
			} else if (!hasResults()) {
				$$renderer.push("<!--[1-->");
				$$renderer.push(`<div class="flex flex-col items-center gap-2 py-8 text-center"><div class="rounded-full bg-muted p-3">`);
				Search($$renderer, { class: "size-5 text-muted-foreground" });
				$$renderer.push(`<!----></div> <p class="text-muted-foreground text-sm">${escape_html(step() === "events" ? "Ei lajeja löytynyt" : "Ei kilpailuja löytynyt")}</p></div>`);
			} else if (step() === "competitions") {
				$$renderer.push("<!--[2-->");
				$$renderer.push(`<div class="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-muted-foreground/70 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wider"><div class="px-2 pb-2 font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider">Kilpailut</div> <!--[-->`);
				const each_array = ensure_array_like(filteredCompetitions().slice(0, 10));
				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let comp = each_array[$$index];
					$$renderer.push(`<button class="group flex w-full cursor-pointer rounded-xl px-2 py-2 text-left transition-colors hover:bg-primary/10 active:bg-primary/15 sm:px-3 sm:py-2.5"><div class="flex flex-1 items-center justify-between gap-2 sm:gap-3"><div class="flex items-center gap-2 sm:gap-3"><div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground sm:size-9">`);
					Calendar($$renderer, { class: "size-4" });
					$$renderer.push(`<!----></div> <div class="flex flex-col"><span class="font-medium text-foreground text-sm sm:text-base">${escape_html(comp.Name)}</span> <span class="text-muted-foreground text-xs">${escape_html(new Date(comp.Date).toLocaleDateString("fi-FI", {
						day: "numeric",
						month: "long",
						year: "numeric"
					}))}</span></div></div> `);
					Arrow_right($$renderer, { class: "size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" });
					$$renderer.push(`<!----></div></button>`);
				}
				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push("<!--[-1-->");
				$$renderer.push(`<div class="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-muted-foreground/70 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wider"><div class="px-2 pb-2 font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider">Lajit</div> <!--[-->`);
				const each_array_1 = ensure_array_like(filteredEvents().slice(0, 15));
				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let evt = each_array_1[$$index_1];
					const isNavigating = navigatingTo === evt.Id;
					$$renderer.push(`<button class="group flex w-full cursor-pointer rounded-xl px-2 py-2 text-left transition-all hover:bg-primary/10 active:bg-primary/15 disabled:pointer-events-none sm:px-3 sm:py-2.5"${attr("disabled", false, true)}${attr_style(`opacity: ${stringify(1)}`)}><div class="flex w-full items-center justify-between gap-2 sm:gap-3"><div class="flex items-center gap-2 sm:gap-3"><div class="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground sm:size-9">`);
					if (isNavigating) {
						$$renderer.push("<!--[0-->");
						Loader_circle($$renderer, { class: "size-4 animate-spin" });
					} else {
						$$renderer.push("<!--[-1-->");
						Clock($$renderer, { class: "size-4" });
					}
					$$renderer.push(`<!--]--></div> <div class="flex flex-col"><span class="font-medium text-foreground text-sm sm:text-base">${escape_html(evt.EventName)}</span> <span class="text-muted-foreground text-xs">${escape_html(evt.Name)}</span></div></div> <div class="flex items-center gap-2 sm:gap-3"><div class="hidden items-center gap-2 text-muted-foreground text-xs sm:flex"><span class="rounded-md bg-muted px-2 py-0.5 font-mono">${escape_html(evt.Time)}</span> <span>${escape_html(evt.Date)}</span></div> <span class="rounded-md bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs sm:hidden">${escape_html(evt.Time)}</span> `);
					if (!isNavigating) {
						$$renderer.push("<!--[0-->");
						Chevron_right($$renderer, { class: "size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" });
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--></div></div></button>`);
				}
				$$renderer.push(`<!--]--></div>`);
			}
			$$renderer.push(`<!--]--></div></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></div> `);
		if (!showDropdown()) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="mt-3 text-center text-muted-foreground/60 text-xs">Vinkki: valitse kilpailu ja rajaa laji kirjoittamalla "/"</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div>`);
	});
}
//#endregion
//#region src/routes/(app)/+page.svelte
function _page($$renderer) {
	$$renderer.push(`<main class="flex min-h-dvh flex-col items-center"><section class="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-24"><div class="mx-auto max-w-3xl text-center"><h1 class="scroll-m-20 text-balance font-extrabold text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">Kilpailutulokset <span class="font-light text-primary">reaaliajassa</span></h1> <p class="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:mt-6 sm:text-lg">Seuraa urheilukilpailuja livenä. Hae kilpailuja ja löydä lajit, joista haluat nähdä tulokset.</p></div> <div class="mt-8 w-full max-w-xl px-2 sm:mt-10 sm:px-0">`);
	Search_form($$renderer, {});
	$$renderer.push(`<!----> <p class="mt-6 text-center text-muted-foreground text-xs sm:text-sm">Powered by tuloslista.com</p></div></section></main> <footer class="border-border/50 border-t py-4 pb-[env(safe-area-inset-bottom)] sm:py-6"><div class="mx-auto max-w-5xl px-4 text-center"><p class="text-muted-foreground text-xs sm:text-sm">Livetila - Kilpailutulokset striimeihin</p></div></footer>`);
}
//#endregion
export { _page as default };
