<script lang="ts">
  import {
    Tag,
    Plus,
    Search,
    Edit3,
    Trash2,
    ArrowRight,
    X,
    CheckSquare
  } from '@lucide/svelte';
  import type { Category, Task } from '../types';
  import CategoryIcon from './CategoryIcon.svelte';

  interface Props {
    categories: Category[];
    tasks: Task[];
    onOpenNewCategoryModal: () => void;
    onEditCategory: (category: Category) => void;
    onDeleteCategory: (category: Category) => void;
    onViewCategoryTasks: (categoryId: string) => void;
  }

  let {
    categories,
    tasks,
    onOpenNewCategoryModal,
    onEditCategory,
    onDeleteCategory,
    onViewCategoryTasks
  }: Props = $props();

  let searchQuery = $state('');

  let filteredCategories = $derived.by(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter((c) =>
      c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
    );
  });
</script>

<div class="space-y-6">
  <!-- Top Glass Header Bar -->
  <div class="glass-panel p-6 rounded-3xl space-y-4 border border-white/80 shadow-xs">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>Task Category Management</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-bold">
            {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
          </span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Create, edit, and organize task taxonomy with customizable color markers and Lucide SVG icons.
        </p>
      </div>

      <button
        onclick={onOpenNewCategoryModal}
        class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer group shrink-0"
      >
        <Plus class="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
        <span>New Category</span>
      </button>
    </div>

    <!-- Search Input -->
    <div class="relative">
      <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search categories by name or description..."
        class="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all shadow-2xs"
      />
      {#if searchQuery}
        <button
          onclick={() => searchQuery = ''}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      {/if}
    </div>
  </div>

  <!-- Category Grid Cards -->
  {#if filteredCategories.length === 0}
    <div class="glass-panel rounded-3xl p-12 text-center space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
        <Tag class="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 class="text-base font-bold text-slate-800">No categories found</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        No category matched your search query. Add a new category to categorize your tasks.
      </p>
      <button
        onclick={onOpenNewCategoryModal}
        class="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>Add Category</span>
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each filteredCategories as category (category.id)}
        {@const catTasks = tasks.filter((t) => t.category_id === category.id)}
        {@const completedCount = catTasks.filter((t) => t.status === 'Completed').length}

        <div class="glass-card p-6 rounded-3xl border border-slate-200/70 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <!-- Icon & Color Swatch Header -->
            <div class="flex items-center justify-between">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                style="background-color: {category.color};"
              >
                <CategoryIcon name={category.icon} class="w-5 h-5" />
              </div>

              <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                {catTasks.length} {catTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <!-- Name & Description -->
            <div>
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{category.name}</span>
              </h3>
              {#if category.description}
                <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
              {/if}
            </div>

            <!-- Task Status Mini Progress -->
            <div class="text-[11px] text-slate-500 pt-1">
              <span>{completedCount} completed of {catTasks.length} tasks</span>
            </div>
          </div>

          <!-- Bottom Card Controls -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <button
              onclick={() => onViewCategoryTasks(category.id)}
              class="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Tasks</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>

            <div class="flex items-center gap-1">
              <button
                onclick={() => onEditCategory(category)}
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Edit category"
                aria-label="Edit category"
              >
                <Edit3 class="w-4 h-4" />
              </button>

              <button
                onclick={() => onDeleteCategory(category)}
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete category"
                aria-label="Delete category"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
