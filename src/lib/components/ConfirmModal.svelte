<script lang="ts">
  import { AlertTriangle, Info } from '@lucide/svelte';

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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl transition-all space-y-5"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-start gap-4">
        {#if isDanger}
          <div class="p-3 bg-rose-50 text-rose-600 border border-rose-200/80 rounded-2xl shrink-0">
            <AlertTriangle class="w-6 h-6 stroke-[2]" />
          </div>
        {:else}
          <div class="p-3 bg-blue-50 text-blue-600 border border-blue-200/80 rounded-2xl shrink-0">
            <Info class="w-6 h-6 stroke-[2]" />
          </div>
        {/if}

        <div class="flex-1">
          <h3 class="text-base sm:text-lg font-extrabold text-slate-900">{title}</h3>
          <p class="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onclick={onCancel}
          class="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onclick={onConfirm}
          class="px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-md cursor-pointer
          {isDanger 
            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' 
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}
