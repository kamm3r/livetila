<script lang="ts">
  // Results say it in words; broadcast graphics keep the compact dots.
  let { active, labelled = false }: { active: boolean; labelled?: boolean } =
    $props();
</script>

{#if active && labelled}
  <span
    class="inline-flex items-center rounded-full bg-primary/12 px-1.5 align-[1px] font-semibold text-2xs text-primary leading-4"
    data-active-attempt>Vuorossa</span
  >
{:else if active}
  <span class="active-attempt" title="Vuorossa" data-active-attempt>
    <span class="sr-only">Vuorossa</span>
    <span class="dot" aria-hidden="true"></span>
    <span class="dot" aria-hidden="true"></span>
    <span class="dot" aria-hidden="true"></span>
  </span>
{/if}

<style>
  .active-attempt {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
    vertical-align: middle;
    color: inherit;
  }
  .dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: currentColor;
    animation: thinking 900ms linear infinite;
  }
  .dot:nth-of-type(3) {
    animation-delay: 150ms;
  }
  .dot:nth-of-type(4) {
    animation-delay: 300ms;
  }
  @keyframes thinking {
    0%,
    60%,
    100% {
      opacity: 0.3;
    }
    30% {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .dot {
      animation: none;
      opacity: 0.7;
    }
  }
</style>
