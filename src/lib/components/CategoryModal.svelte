<script lang="ts">
  import {
    Tag,
    X,
    AlertCircle,
    Check
  } from '@lucide/svelte';
  import type { Category } from '../types';
  import CategoryIcon from './CategoryIcon.svelte';

  interface Props {
    isOpen: boolean;
    category?: Category | null;
    onSave: (catData: { name: string; color: string; icon: string; description: string }) => Promise<void>;
    onClose: () => void;
  }

  let { isOpen, category = null, onSave, onClose }: Props = $props();

  let name = $state('');
  let description = $state('');
  let color = $state('#3b82f6');
  let icon = $state('tag');
  let isSubmitting = $state(false);
  let errorMsg = $state('');

  const COLOR_PRESETS = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
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
    { id: 'folder', label: 'Folder' },
    { id: 'star', label: 'Star' },
    { id: 'bookmark', label: 'Bookmark' }
  ];

  $effect(() => {
    if (isOpen) {
      if (category) {
        name = category.name;
        description = category.description || '';
        color = category.color || '#3b82f6';
        icon = category.icon || 'tag';
      } else {
        name = '';
        description = '';
        color = '#3b82f6';
        icon = 'tag';
      }
      errorMsg = '';
      isSubmitting = false;
    }
  });

  async function handleSubmit(e: Event) {
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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Tag class="w-4 h-4" />
          </div>
          <span>{category ? 'Edit Category' : 'Create Category'}</span>
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
        <!-- Category Name -->
        <div>
          <label for="cat-name" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category Name <span class="text-rose-500">*</span>
          </label>
          <input
            id="cat-name"
            type="text"
            bind:value={name}
            placeholder="e.g. Research, Academics, Marketing..."
            class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-medium transition-all"
            required
          />
        </div>

        <!-- Description -->
        <div>
          <label for="cat-desc" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            id="cat-desc"
            bind:value={description}
            rows="2"
            placeholder="What tasks belong in this category?"
            class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-medium transition-all"
          ></textarea>
        </div>

        <!-- Icon Picker (Lucide SVG presets) -->
        <div>
          <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            SVG Icon
          </span>
          <div class="grid grid-cols-3 gap-2">
            {#each ICON_PRESETS as p}
              <button
                type="button"
                onclick={() => icon = p.id}
                class="px-2.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer
                {icon === p.id 
                  ? 'bg-blue-50 text-blue-700 border-blue-400 font-bold shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}"
              >
                <CategoryIcon name={p.id} class="w-3.5 h-3.5 shrink-0" />
                <span class="truncate">{p.label}</span>
              </button>
            {/each}
          </div>
        </div>

        <!-- Color Palette Picker -->
        <div>
          <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Color Marker
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
              <span>{category ? 'Update Category' : 'Create Category'}</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
