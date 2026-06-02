<script lang="ts">
	import SearchForm from "$lib/components/search-form.svelte";
</script>

<main class="flex min-h-dvh flex-col items-center">
	<section class="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-24">
		<div class="mx-auto max-w-3xl text-center">
			<h1 class="scroll-m-20 text-balance font-extrabold text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
				Kilpailutulokset <span class="font-light text-primary">reaaliajassa</span>
			</h1>
			<p class="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:mt-6 sm:text-lg">
				Seuraa urheilukilpailuja livenä. Hae kilpailuja ja löydä lajit, joista haluat nähdä tulokset.
			</p>
		</div>

		<div class="mt-8 w-full max-w-xl px-2 sm:mt-10 sm:px-0">
			<SearchForm />
			<p class="mt-6 text-center text-muted-foreground text-xs sm:text-sm">
				Powered by tuloslista.com
			</p>
		</div>
	</section>
</main>
<footer class="border-border/50 border-t py-4 pb-[env(safe-area-inset-bottom)] sm:py-6">
	<div class="mx-auto max-w-5xl px-4 text-center">
		<p class="text-muted-foreground text-xs sm:text-sm">
			Livetila - Kilpailutulokset striimeihin
		</p>
	</div>
</footer>
