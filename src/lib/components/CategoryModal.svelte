<script lang="ts">
  import type { Category } from '../types';

  interface Props {
    isOpen: boolean;
    category?: Category | null;
    onSave: (catData: { name: string; color: string; icon: string; description: string }) => Promise<void>;
    onClose: () => void;
  }

  let { isOpen, category = null, onSave, onClose }: Props = $props();

  let name = $state('');
  let description = $state('');
  let color = $state('#6366f1');
  let icon = $state('tag');
  let isSubmitting = $state(false);
  let errorMsg = $state('');

  const COLOR_PRESETS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Slate', value: '#64748b' }
  ];

  const ICON_PRESETS = [
    { id: 'tag', label: 'Tag' },
    { id: 'graduation-cap', label: 'Academics' },
    { id: 'briefcase', label: 'Work' },
    { id: 'user', label: 'Personal' },
    { id: 'activity', label: 'Fitness' },
    { id: 'dollar-sign', label: 'Finance' },
    { id: 'shopping-cart', label: 'Shopping' },
    { id: 'star', label: 'Priority' },
    { id: 'bookmark', label: 'Reference' }
  ];

  $effect(() => {
    if (isOpen) {
      if (category) {
        name = category.name;
        description = category.description || '';
        color = category.color || '#6366f1';
        icon = category.icon || 'tag';
      } else {
        name = '';
        description = '';
        color = '#6366f1';
        icon = 'tag';
      }
      errorMsg = '';
      isSubmitting = false;
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!name.trim()) {
      errorMsg = 'Category name is required';
      return;
    }

    try {
      isSubmitting = true;
      errorMsg = '';
      await onSave({
        name: name.trim(),
        description: description.trim(),
        color,
        icon
      });
      onClose();
    } catch (err: any) {
      errorMsg = err?.message || 'Failed to save category';
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <span 
            class="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
            style="background-color: {color};"
          ></span>
          {category ? 'Edit Category' : 'Create New Category'}
        </h3>
        <button
          onclick={onClose}
          class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {#if errorMsg}
        <div class="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMsg}
        </div>
      {/if}

      <form onsubmit={handleSubmit} class="mt-4 space-y-4">
        <div>
          <label for="cat-name" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Category Name <span class="text-rose-400">*</span>
          </label>
          <input
            id="cat-name"
            type="text"
            bind:value={name}
            placeholder="e.g. Academics, Work, Health"
            class="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
            required
          />
        </div>

        <div>
          <label for="cat-desc" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            id="cat-desc"
            bind:value={description}
            rows="2"
            placeholder="Short purpose or scope of this category..."
            class="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
          ></textarea>
        </div>

        <div>
          <span class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Badge Color
          </span>
          <div class="flex flex-wrap gap-2 items-center">
            {#each COLOR_PRESETS as preset}
              <button
                type="button"
                onclick={() => color = preset.value}
                class="w-7 h-7 rounded-full transition-transform flex items-center justify-center border-2"
                style="background-color: {preset.value}; border-color: {color === preset.value ? '#ffffff' : 'transparent'}; transform: {color === preset.value ? 'scale(1.15)' : 'scale(1)'};"
                title={preset.name}
              >
                {#if color === preset.value}
                  <svg class="w-3.5 h-3.5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                {/if}
              </button>
            {/each}
            <div class="flex items-center gap-1.5 ml-2">
              <input
                type="color"
                bind:value={color}
                class="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                title="Custom color picker"
              />
              <span class="text-xs font-mono text-slate-400">{color}</span>
            </div>
          </div>
        </div>

        <div>
          <span class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Icon Style
          </span>
          <div class="grid grid-cols-3 gap-2">
            {#each ICON_PRESETS as iconItem}
              <button
                type="button"
                onclick={() => icon = iconItem.id}
                class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left
                {icon === iconItem.id 
                  ? 'bg-blue-600/20 border-blue-500 text-blue-200 shadow-sm' 
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'}"
              >
                <span class="w-2 h-2 rounded-full" style="background-color: {color};"></span>
                <span class="truncate">{iconItem.label}</span>
              </button>
            {/each}
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-blue-900/30 flex items-center gap-2"
          >
            {#if isSubmitting}
              <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            {/if}
            {category ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
