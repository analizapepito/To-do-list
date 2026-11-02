<script lang="ts">
  import {
    Layers,
    X,
    AlertCircle,
    Check
  } from '@lucide/svelte';
  import type { TaskList } from '../types';

  interface Props {
    isOpen: boolean;
    list?: TaskList | null;
    onSave: (listData: { name: string; description: string; color: string; icon: string; target_date?: string | null }) => Promise<void>;
    onClose: () => void;
  }

  let { isOpen, list = null, onSave, onClose }: Props = $props();

  let name = $state('');
  let description = $state('');
  let color = $state('#3b82f6');
  let icon = $state('folder');
  let target_date = $state('');
  let isSubmitting = $state(false);
  let errorMsg = $state('');

  const COLOR_PRESETS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Cyan', value: '#06b6d4' }
  ];

  $effect(() => {
    if (isOpen) {
      if (list) {
        name = list.name;
        description = list.description || '';
        color = list.color || '#3b82f6';
        icon = list.icon || 'folder';
        target_date = list.target_date || '';
      } else {
        name = '';
        description = '';
        color = '#3b82f6';
        icon = 'folder';
        target_date = '';
      }
      errorMsg = '';
      isSubmitting = false;
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!name.trim()) {
      errorMsg = 'Task list name is required';
      return;
    }

    try {
      isSubmitting = true;
      errorMsg = '';
      await onSave({
        name: name.trim(),
        description: description.trim(),
        color,
        icon,
        target_date: target_date ? target_date : null
      });
      onClose();
    } catch (err: any) {
      errorMsg = err?.message || 'Failed to save task list';
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers class="w-4 h-4" />
          </div>
          <span>{list ? 'Edit Task List' : 'Create Task List'}</span>
        </h3>
        <button
          onclick={onClose}
          class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      {#if errorMsg}
        <div class="mt-4 p-3 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      {/if}

      <form onsubmit={handleSubmit} class="mt-5 space-y-4">
        <!-- List Name -->
        <div>
          <label for="list-name" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            List Name <span class="text-rose-500">*</span>
          </label>
          <input
            id="list-name"
            type="text"
            bind:value={name}
            placeholder="e.g. Sprint Deliverables, Weekly Goals..."
            class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-medium transition-all"
            required
          />
        </div>

        <!-- Description -->
        <div>
          <label for="list-desc" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            id="list-desc"
            bind:value={description}
            rows="2"
            placeholder="What is the scope and objective of this task list?"
            class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-medium transition-all"
          ></textarea>
        </div>

        <!-- Target Deadline Date -->
        <div>
          <label for="list-deadline" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Target Completion Deadline
          </label>
          <input
            id="list-deadline"
            type="date"
            bind:value={target_date}
            class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
          />
        </div>

        <!-- Color Marker Palette -->
        <div>
          <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Theme Color
          </span>
          <div class="flex flex-wrap gap-2.5">
            {#each COLOR_PRESETS as p}
              <button
                type="button"
                onclick={() => color = p.value}
                style="background-color: {p.value};"
                class="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-transform active:scale-95 cursor-pointer shadow-xs
                {color === p.value ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105'}"
                title={p.name}
              >
                {#if color === p.value}
                  <Check class="w-4 h-4 stroke-[3]" />
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {#if isSubmitting}
              <div class="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            {:else}
              <span>{list ? 'Update List' : 'Create List'}</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
