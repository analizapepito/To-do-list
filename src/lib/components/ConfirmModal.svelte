<script lang="ts">
  interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let {
    isOpen = false,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    isDanger = true,
    onConfirm,
    onCancel
  }: Props = $props();
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl transition-all"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-start gap-4">
        {#if isDanger}
          <div class="p-3 bg-rose-500/10 text-rose-400 rounded-xl shrink-0">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        {:else}
          <div class="p-3 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        {/if}

        <div class="flex-1">
          <h3 class="text-lg font-bold text-white">{title}</h3>
          <p class="mt-2 text-sm text-slate-400 leading-relaxed">{message}</p>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onclick={onCancel}
          class="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onclick={onConfirm}
          class="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-lg
          {isDanger 
            ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30' 
            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'}"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
