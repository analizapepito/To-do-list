<script lang="ts">
  import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from '@lucide/svelte';
  import { toasts } from '../toast';

  function dismiss(id: string) {
    toasts.dismiss(id);
  }
</script>

<div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
  {#each $toasts as item (item.id)}
    <div
      class="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2
      {item.type === 'success' ? 'bg-white/95 border-emerald-200 text-emerald-800' : ''}
      {item.type === 'error' ? 'bg-white/95 border-rose-200 text-rose-800' : ''}
      {item.type === 'warning' ? 'bg-white/95 border-amber-200 text-amber-800' : ''}
      {item.type === 'info' ? 'bg-white/95 border-blue-200 text-blue-800' : ''}"
    >
      <div class="flex items-center gap-2.5">
        {#if item.type === 'success'}
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
        {:else if item.type === 'error'}
          <AlertCircle class="w-4 h-4 text-rose-600 shrink-0" />
        {:else if item.type === 'warning'}
          <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
        {:else}
          <Info class="w-4 h-4 text-blue-600 shrink-0" />
        {/if}
        <span>{item.message}</span>
      </div>

      <button
        onclick={() => dismiss(item.id)}
        class="text-slate-400 hover:text-slate-700 transition-colors p-1"
        aria-label="Dismiss notification"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  {/each}
</div>
