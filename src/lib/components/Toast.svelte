<script lang="ts">
  import { toasts } from '../toast';

  function dismiss(id: string) {
    toasts.dismiss(id);
  }
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
  {#each $toasts as item (item.id)}
    <div
      class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-2
      {item.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' : ''}
      {item.type === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-200' : ''}
      {item.type === 'warning' ? 'bg-amber-950/90 border-amber-500/40 text-amber-200' : ''}
      {item.type === 'info' ? 'bg-blue-950/90 border-blue-500/40 text-blue-200' : ''}"
    >
      <div class="flex items-center gap-2.5">
        {#if item.type === 'success'}
          <svg class="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        {:else if item.type === 'error'}
          <svg class="w-5 h-5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else if item.type === 'warning'}
          <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        {:else}
          <svg class="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {/if}
        <span>{item.message}</span>
      </div>

      <button
        onclick={() => dismiss(item.id)}
        class="text-slate-400 hover:text-white transition-colors p-1"
        aria-label="Dismiss notification"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>
