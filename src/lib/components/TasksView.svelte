<script lang="ts">
  import type { Task, Category, TaskList, TaskStatus, TaskPriority } from '../types';

  interface Props {
    tasks: Task[];
    categories: Category[];
    taskLists: TaskList[];
    selectedCategoryFilter: string | null;
    selectedListFilter: string | null;
    onOpenNewTaskModal: (opts?: { listId?: string; categoryId?: string }) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (task: Task) => void;
    onToggleTaskStatus: (task: Task) => void;
    onUpdateTaskStatus: (task: Task, newStatus: TaskStatus) => void;
    onBatchDeleteCompleted: () => void;
    onSelectTask: (task: Task) => void;
  }

  let {
    tasks,
    categories,
    taskLists,
    selectedCategoryFilter = $bindable(null),
    selectedListFilter = $bindable(null),
    onOpenNewTaskModal,
    onEditTask,
    onDeleteTask,
    onToggleTaskStatus,
    onUpdateTaskStatus,
    onBatchDeleteCompleted,
    onSelectTask
  }: Props = $props();

  // Search & Filter state
  let searchQuery = $state('');
  let currentStatusTab = $state<'All' | TaskStatus>('All');
  let selectedPriorityFilter = $state<'All' | TaskPriority>('All');
  let sortBy = $state<'due_date' | 'priority' | 'created_at' | 'title'>('due_date');
  let viewMode = $state<'list' | 'kanban' | 'grid'>('list');

  const STATUS_TABS: { id: 'All' | TaskStatus; label: string }[] = [
    { id: 'All', label: 'All Tasks' },
    { id: 'Pending', label: 'Pending' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Overdue', label: 'Overdue' }
  ];

  const PRIORITY_ORDER: Record<TaskPriority, number> = {
    Urgent: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  // Filter and sort tasks
  let filteredTasks = $derived.by(() => {
    let result = [...tasks];

    // Status Tab Filter
    if (currentStatusTab !== 'All') {
      result = result.filter((t) => t.status === currentStatusTab);
    }

    // Category Filter
    if (selectedCategoryFilter) {
      result = result.filter((t) => t.category_id === selectedCategoryFilter);
    }

    // List Filter
    if (selectedListFilter) {
      result = result.filter((t) => t.list_id === selectedListFilter);
    }

    // Priority Filter
    if (selectedPriorityFilter !== 'All') {
      result = result.filter((t) => t.priority === selectedPriorityFilter);
    }

    // Search Query (Title, Description, Category Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const catMatch = t.category ? t.category.name.toLowerCase().includes(q) : false;
        const listMatch = t.task_list ? t.task_list.name.toLowerCase().includes(q) : false;
        return titleMatch || descMatch || catMatch || listMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'created_at') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      // Default: due_date (soonest / overdue first, nulls at the end)
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

    return result;
  });

  // Kanban grouped columns
  let kanbanPending = $derived(filteredTasks.filter((t) => t.status === 'Pending'));
  let kanbanInProgress = $derived(filteredTasks.filter((t) => t.status === 'In Progress'));
  let kanbanCompleted = $derived(filteredTasks.filter((t) => t.status === 'Completed'));
  let kanbanOverdue = $derived(filteredTasks.filter((t) => t.status === 'Overdue'));

  function formatDisplayDate(isoString?: string | null): string {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }

  function getDueBadge(isoString?: string | null, status?: TaskStatus) {
    if (status === 'Completed') return null;
    if (!isoString) return null;
    const dueTime = new Date(isoString).getTime();
    const now = Date.now();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      const days = Math.ceil(Math.abs(diffHours) / 24);
      return {
        label: `${days}d overdue`,
        className: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
      };
    } else if (diffHours < 24) {
      return {
        label: `${Math.round(diffHours)}h left`,
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
      };
    } else {
      const days = Math.round(diffHours / 24);
      return {
        label: `in ${days}d`,
        className: 'bg-slate-800 text-slate-300 border border-slate-700'
      };
    }
  }
</script>

<div class="space-y-6 animate-in fade-in">
  <!-- Header Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <span>Task Management</span>
        <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </h2>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">
        Full CRUD operations, status workflows, priorities, due dates, and organization filters.
      </p>
    </div>

    <div class="flex items-center gap-2.5">
      {#if tasks.some((t) => t.status === 'Completed')}
        <button
          onclick={onBatchDeleteCompleted}
          class="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          title="Clear all completed tasks"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Completed
        </button>
      {/if}

      <button
        onclick={() => onOpenNewTaskModal({ listId: selectedListFilter || undefined, categoryId: selectedCategoryFilter || undefined })}
        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center gap-1.5 cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        New Task
      </button>
    </div>
  </div>

  <!-- Filter & Search Controls Bar -->
  <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 backdrop-blur-md">
    <!-- Top Row: Search input + View mode toggle -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search tasks by title, description, category, or list..."
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

      <!-- View Mode Buttons -->
      <div class="flex items-center gap-1 p-1 bg-slate-950/60 border border-slate-800 rounded-xl self-start md:self-auto">
        <button
          onclick={() => viewMode = 'list'}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
          {viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
          title="List View"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          List
        </button>

        <button
          onclick={() => viewMode = 'kanban'}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
          {viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
          title="Kanban Board View"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Kanban
        </button>

        <button
          onclick={() => viewMode = 'grid'}
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
          {viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}"
          title="Grid Card View"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Grid
        </button>
      </div>
    </div>

    <!-- Middle Row: Status Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
      {#each STATUS_TABS as tab}
        {@const count = tab.id === 'All' ? tasks.length : tasks.filter((t) => t.status === tab.id).length}
        <button
          onclick={() => currentStatusTab = tab.id}
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2
          {currentStatusTab === tab.id
            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}"
        >
          <span>{tab.label}</span>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full {currentStatusTab === tab.id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'} font-mono">
            {count}
          </span>
        </button>
      {/each}
    </div>

    <!-- Bottom Row: Multi-Dropdown Filters (Category, List, Priority, Sort) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <!-- Category Filter -->
      <div>
        <label for="filter-category" class="block text-slate-400 text-[11px] mb-1 font-medium">Category</label>
        <select
          id="filter-category"
          bind:value={selectedCategoryFilter}
          class="w-full px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value={null}>All Categories</option>
          {#each categories as cat}
            <option value={cat.id}>{cat.name}</option>
          {/each}
        </select>
      </div>

      <!-- Task List Filter -->
      <div>
        <label for="filter-list" class="block text-slate-400 text-[11px] mb-1 font-medium">Task List</label>
        <select
          id="filter-list"
          bind:value={selectedListFilter}
          class="w-full px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value={null}>All Task Lists</option>
          {#each taskLists as lst}
            <option value={lst.id}>{lst.name}</option>
          {/each}
        </select>
      </div>

      <!-- Priority Filter -->
      <div>
        <label for="filter-priority" class="block text-slate-400 text-[11px] mb-1 font-medium">Priority</label>
        <select
          id="filter-priority"
          bind:value={selectedPriorityFilter}
          class="w-full px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <!-- Sort By -->
      <div>
        <label for="sort-by" class="block text-slate-400 text-[11px] mb-1 font-medium">Sort By</label>
        <select
          id="sort-by"
          bind:value={sortBy}
          class="w-full px-2.5 py-1.5 bg-slate-950/70 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="due_date">Due Date (Soonest)</option>
          <option value="priority">Priority (Highest)</option>
          <option value="created_at">Created (Newest)</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>
    </div>

    <!-- Active filter chips if any are selected -->
    {#if selectedCategoryFilter || selectedListFilter || selectedPriorityFilter !== 'All' || searchQuery}
      <div class="pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-slate-500">Active filters:</span>

        {#if selectedCategoryFilter}
          {@const cat = categories.find((c) => c.id === selectedCategoryFilter)}
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
            Category: {cat ? cat.name : 'Selected'}
            <button onclick={() => selectedCategoryFilter = null} class="hover:text-white">&times;</button>
          </span>
        {/if}

        {#if selectedListFilter}
          {@const lst = taskLists.find((l) => l.id === selectedListFilter)}
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            List: {lst ? lst.name : 'Selected'}
            <button onclick={() => selectedListFilter = null} class="hover:text-white">&times;</button>
          </span>
        {/if}

        {#if selectedPriorityFilter !== 'All'}
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
            Priority: {selectedPriorityFilter}
            <button onclick={() => selectedPriorityFilter = 'All'} class="hover:text-white">&times;</button>
          </span>
        {/if}

        <button
          onclick={() => {
            selectedCategoryFilter = null;
            selectedListFilter = null;
            selectedPriorityFilter = 'All';
            searchQuery = '';
          }}
          class="text-xs text-rose-400 hover:underline ml-2"
        >
          Reset All Filters
        </button>
      </div>
    {/if}
  </div>

  <!-- Content: View Mode 1 - LIST VIEW -->
  {#if viewMode === 'list'}
    {#if filteredTasks.length === 0}
      <div class="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
        <svg class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 class="text-base font-semibold text-slate-300">No tasks found</h3>
        <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No tasks match your selected status, search, or filters. Try adjusting filters or create a new task.
        </p>
        <button
          onclick={() => onOpenNewTaskModal({ listId: selectedListFilter || undefined, categoryId: selectedCategoryFilter || undefined })}
          class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-blue-900/20"
        >
          + Create Task
        </button>
      </div>
    {:else}
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm divide-y divide-slate-800/80">
        {#each filteredTasks as task (task.id)}
          {@const dueBadge = getDueBadge(task.due_date, task.status)}
          <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors group">
            <div class="flex items-start gap-3.5 min-w-0 flex-1">
              <!-- Completion Checkbox -->
              <button
                onclick={() => onToggleTaskStatus(task)}
                class="mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer
                {task.status === 'Completed'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                  : 'border-slate-600 hover:border-blue-400 bg-slate-950/60'}"
                title={task.status === 'Completed' ? 'Mark uncompleted' : 'Mark completed'}
              >
                {#if task.status === 'Completed'}
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                {/if}
              </button>

              <!-- Title, Description & Tags -->
              <div class="min-w-0 flex-1">
                <button
                  onclick={() => onSelectTask(task)}
                  class="text-left group-hover:text-blue-300 transition-colors block w-full"
                >
                  <div class="text-sm font-semibold text-slate-100 {task.status === 'Completed' ? 'line-through text-slate-400 font-normal' : ''}">
                    {task.title}
                  </div>
                  {#if task.description}
                    <div class="text-xs text-slate-400 line-clamp-1 mt-0.5 font-normal">
                      {task.description}
                    </div>
                  {/if}
                </button>

                <!-- Metadata Row (Category, List, Due Date) -->
                <div class="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <!-- Category Badge -->
                  {#if task.category}
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 text-[11px] text-slate-300">
                      <span class="w-2 h-2 rounded-full" style="background-color: {task.category.color};"></span>
                      <span>{task.category.name}</span>
                    </span>
                  {/if}

                  <!-- List Badge -->
                  {#if task.task_list}
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 text-[11px] text-slate-300">
                      <span class="w-2 h-2 rounded-full" style="background-color: {task.task_list.color};"></span>
                      <span>{task.task_list.name}</span>
                    </span>
                  {/if}

                  <!-- Due Date Badge -->
                  {#if task.due_date}
                    <span class="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <svg class="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDisplayDate(task.due_date)}</span>
                    </span>
                  {/if}

                  {#if dueBadge}
                    <span class="text-[10px] px-2 py-0.5 rounded-full {dueBadge.className}">
                      {dueBadge.label}
                    </span>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Right Controls: Status Dropdown, Priority Badge, Edit/Delete Buttons -->
            <div class="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
              <!-- Quick Status Selector -->
              <select
                value={task.status}
                onchange={(e) => onUpdateTaskStatus(task, (e.target as HTMLSelectElement).value as TaskStatus)}
                class="px-2 py-1 bg-slate-950/80 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>

              <!-- Priority Badge -->
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg
                {task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : ''}
                {task.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : ''}
                {task.priority === 'Medium' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : ''}
                {task.priority === 'Low' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : ''}"
              >
                {task.priority}
              </span>

              <!-- Action Menu: Edit & Delete -->
              <div class="flex items-center gap-1">
                <button
                  onclick={() => onEditTask(task)}
                  class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                  title="Edit task"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onclick={() => onDeleteTask(task)}
                  class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

  <!-- Content: View Mode 2 - KANBAN BOARD VIEW -->
  {:else if viewMode === 'kanban'}
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Column 1: Pending -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[450px]">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <span class="font-bold text-sm text-slate-200">Pending</span>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {kanbanPending.length}
          </span>
        </div>

        <div class="mt-3 space-y-3 flex-1 overflow-y-auto">
          {#each kanbanPending as task (task.id)}
            <div class="p-3 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all shadow-sm group">
              <button onclick={() => onSelectTask(task)} class="text-left w-full">
                <div class="text-xs font-bold text-slate-200 group-hover:text-blue-300">
                  {task.title}
                </div>
                {#if task.description}
                  <div class="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {task.description}
                  </div>
                {/if}
              </button>

              <div class="mt-3 flex items-center justify-between text-[10px]">
                <span class="px-1.5 py-0.5 rounded font-bold uppercase
                  {task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}"
                >
                  {task.priority}
                </span>

                <div class="flex items-center gap-1">
                  <button
                    onclick={() => onUpdateTaskStatus(task, 'In Progress')}
                    class="px-2 py-0.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded"
                    title="Move to In Progress"
                  >
                    Start &rarr;
                  </button>
                  <button
                    onclick={() => onEditTask(task)}
                    class="p-1 text-slate-400 hover:text-white"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Column 2: In Progress -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[450px]">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span class="font-bold text-sm text-blue-300">In Progress</span>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
            {kanbanInProgress.length}
          </span>
        </div>

        <div class="mt-3 space-y-3 flex-1 overflow-y-auto">
          {#each kanbanInProgress as task (task.id)}
            <div class="p-3 bg-slate-950/80 border border-blue-900/40 rounded-xl hover:border-blue-700 transition-all shadow-sm group">
              <button onclick={() => onSelectTask(task)} class="text-left w-full">
                <div class="text-xs font-bold text-slate-200 group-hover:text-blue-300">
                  {task.title}
                </div>
                {#if task.description}
                  <div class="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {task.description}
                  </div>
                {/if}
              </button>

              <div class="mt-3 flex items-center justify-between text-[10px]">
                <span class="px-1.5 py-0.5 rounded font-bold uppercase
                  {task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}"
                >
                  {task.priority}
                </span>

                <div class="flex items-center gap-1">
                  <button
                    onclick={() => onUpdateTaskStatus(task, 'Completed')}
                    class="px-2 py-0.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded"
                    title="Complete task"
                  >
                    Done &check;
                  </button>
                  <button
                    onclick={() => onEditTask(task)}
                    class="p-1 text-slate-400 hover:text-white"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Column 3: Completed -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[450px]">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="font-bold text-sm text-emerald-300">Completed</span>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            {kanbanCompleted.length}
          </span>
        </div>

        <div class="mt-3 space-y-3 flex-1 overflow-y-auto">
          {#each kanbanCompleted as task (task.id)}
            <div class="p-3 bg-slate-950/80 border border-emerald-900/30 rounded-xl hover:border-emerald-700 transition-all opacity-85 group">
              <button onclick={() => onSelectTask(task)} class="text-left w-full">
                <div class="text-xs font-semibold text-slate-300 line-through">
                  {task.title}
                </div>
              </button>

              <div class="mt-3 flex items-center justify-between text-[10px]">
                <span class="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-medium">
                  Done
                </span>

                <div class="flex items-center gap-1">
                  <button
                    onclick={() => onUpdateTaskStatus(task, 'Pending')}
                    class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                    title="Reopen task"
                  >
                    Reopen
                  </button>
                  <button
                    onclick={() => onDeleteTask(task)}
                    class="p-1 text-slate-400 hover:text-rose-400"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Column 4: Overdue -->
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[450px]">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span class="font-bold text-sm text-rose-300">Overdue</span>
          </div>
          <span class="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
            {kanbanOverdue.length}
          </span>
        </div>

        <div class="mt-3 space-y-3 flex-1 overflow-y-auto">
          {#each kanbanOverdue as task (task.id)}
            <div class="p-3 bg-rose-950/20 border border-rose-900/40 rounded-xl hover:border-rose-700 transition-all shadow-sm group">
              <button onclick={() => onSelectTask(task)} class="text-left w-full">
                <div class="text-xs font-bold text-rose-200 group-hover:text-rose-100">
                  {task.title}
                </div>
                {#if task.due_date}
                  <div class="text-[10px] text-rose-400 font-semibold mt-1">
                    {formatDisplayDate(task.due_date)}
                  </div>
                {/if}
              </button>

              <div class="mt-3 flex items-center justify-between text-[10px]">
                <button
                  onclick={() => onUpdateTaskStatus(task, 'Completed')}
                  class="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 rounded"
                >
                  Mark Done &check;
                </button>

                <div class="flex items-center gap-1">
                  <button
                    onclick={() => onEditTask(task)}
                    class="p-1 text-slate-400 hover:text-white"
                    title="Edit task"
                    aria-label="Edit task"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onclick={() => onDeleteTask(task)}
                    class="p-1 text-rose-400 hover:text-rose-300"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

  <!-- Content: View Mode 3 - GRID CARDS VIEW -->
  {:else if viewMode === 'grid'}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredTasks as task (task.id)}
        {@const dueBadge = getDueBadge(task.due_date, task.status)}
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                {task.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : ''}
                {task.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : ''}
                {task.status === 'Pending' ? 'bg-slate-800 text-slate-300 border border-slate-700' : ''}
                {task.status === 'Overdue' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : ''}"
              >
                {task.status}
              </span>

              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                {task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'}"
              >
                {task.priority}
              </span>
            </div>

            <button onclick={() => onSelectTask(task)} class="text-left w-full">
              <h3 class="font-bold text-sm text-slate-100 hover:text-blue-300 line-clamp-2 {task.status === 'Completed' ? 'line-through text-slate-400' : ''}">
                {task.title}
              </h3>
              {#if task.description}
                <p class="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {task.description}
                </p>
              {/if}
            </button>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
              {#if task.category}
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-[11px] text-slate-300">
                  <span class="w-1.5 h-1.5 rounded-full" style="background-color: {task.category.color};"></span>
                  {task.category.name}
                </span>
              {/if}
              {#if dueBadge}
                <span class="text-[10px] px-1.5 py-0.5 rounded-full {dueBadge.className}">
                  {dueBadge.label}
                </span>
              {/if}
            </div>

            <div class="flex items-center justify-between pt-1">
              <button
                onclick={() => onToggleTaskStatus(task)}
                class="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors
                {task.status === 'Completed' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'}"
              >
                {task.status === 'Completed' ? 'Undo' : 'Mark Done'}
              </button>

              <div class="flex items-center gap-1">
                <button
                  onclick={() => onEditTask(task)}
                  class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="Edit task"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onclick={() => onDeleteTask(task)}
                  class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Delete task"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
