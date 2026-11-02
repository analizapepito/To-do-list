<script lang="ts">
  import type { Category, Task } from '../types';

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

<div class="space-y-6 animate-in fade-in">
  <!-- Header Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <span>Task Category Management</span>
        <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
        </span>
      </h2>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">
        Module B: Create, read, update, and delete task categories with custom color tags and scopes.
      </p>
    </div>

    <button
      onclick={onOpenNewCategoryModal}
      class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
      </svg>
      New Category
    </button>
  </div>

  <!-- Search Bar -->
  <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
    <div class="relative">
      <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search categories by name or description..."
        class="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      {#if searchQuery}
        <button
          onclick={() => searchQuery = ''}
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
        >
          &times;
        </button>
      {/if}
    </div>
  </div>

  <!-- Categories Grid -->
  {#if filteredCategories.length === 0}
    <div class="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
      <svg class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
      <h3 class="text-base font-semibold text-slate-300">No categories found</h3>
      <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        No categories match your search. Create one now to organize your tasks.
      </p>
      <button
        onclick={onOpenNewCategoryModal}
        class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-blue-900/20"
      >
        + Create Category
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each filteredCategories as cat (cat.id)}
        {@const catTasks = tasks.filter((t) => t.category_id === cat.id)}
        {@const completedCatTasks = catTasks.filter((t) => t.status === 'Completed').length}
        {@const pendingCatTasks = catTasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length}
        {@const overdueCatTasks = catTasks.filter((t) => t.status === 'Overdue').length}

        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <!-- Top Accent Border -->
          <div 
            class="absolute top-0 left-0 right-0 h-1 transition-all"
            style="background-color: {cat.color};"
          ></div>

          <div>
            <!-- Category Header -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="flex items-center gap-2.5">
                <span 
                  class="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 font-bold text-xs"
                  style="background-color: {cat.color};"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </span>
                <div>
                  <h3 class="font-bold text-base text-white group-hover:text-blue-300 transition-colors">
                    {cat.name}
                  </h3>
                  <span class="text-[11px] font-mono text-slate-400">
                    {catTasks.length} {catTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onclick={() => onEditCategory(cat)}
                  class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Edit Category"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onclick={() => onDeleteCategory(cat)}
                  class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs text-slate-400 leading-relaxed min-h-[36px]">
              {cat.description || 'No description provided for this category.'}
            </p>

            <!-- Task Status Mini Badges -->
            <div class="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-medium">
              <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div class="text-slate-400 text-[10px] uppercase">Active</div>
                <div class="text-sm font-bold text-white mt-0.5">{pendingCatTasks}</div>
              </div>
              <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div class="text-emerald-400 text-[10px] uppercase">Done</div>
                <div class="text-sm font-bold text-emerald-400 mt-0.5">{completedCatTasks}</div>
              </div>
              <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div class="{overdueCatTasks > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'} text-[10px] uppercase">Overdue</div>
                <div class="text-sm font-bold {overdueCatTasks > 0 ? 'text-rose-400' : 'text-slate-400'} mt-0.5">{overdueCatTasks}</div>
              </div>
            </div>
          </div>

          <!-- Bottom Action: Filter Tasks -->
          <div class="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span class="text-[11px] font-mono text-slate-500">Color: {cat.color}</span>
            <button
              onclick={() => onViewCategoryTasks(cat.id)}
              class="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>View Tasks</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
