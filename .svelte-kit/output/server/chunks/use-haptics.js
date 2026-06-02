import "./client.js";
async function initHaptics() {
	try {
		(await import("./dist.js")).createHaptics?.();
	} catch {}
}
initHaptics();
//#endregion
export {};
