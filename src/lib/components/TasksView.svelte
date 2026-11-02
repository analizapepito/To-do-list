<script lang="ts">
  import {
    Search,
    Plus,
    Trash2,
    Edit3,
    Check,
    CheckSquare,
    Clock,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Calendar,
    List,
    Kanban,
    LayoutGrid,
    Layers,
    Tag,
    X,
    SlidersHorizontal,
    ArrowUpDown
  } from '@lucide/svelte';
  import type { Task, Category, TaskList, TaskStatus, TaskPriority } from '../types';
  import CategoryIcon from './CategoryIcon.svelte';

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

    // Search Query (Title, Description, Category Name, List Name)
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
        className: 'bg-rose-50 text-rose-700 border border-rose-200/80 font-bold'
      };
    } else if (diffHours < 24) {
      return {
        label: `${Math.round(diffHours)}h left`,
        className: 'bg-amber-50 text-amber-700 border border-amber-200/80 font-medium'
      };
    } else {
      const days = Math.round(diffHours / 24);
      return {
        label: `in ${days}d`,
        className: 'bg-slate-100 text-slate-600 border border-slate-200'
      };
    }
  }

  function getPriorityColor(p: TaskPriority) {
    switch (p) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }
</script>

<div class="space-y-6">
  <!-- Top Section: Header & Action Bar -->
  <div class="glass-panel p-6 rounded-3xl space-y-5 border border-white/80 shadow-xs">
    <!-- Row 1: Title + Contextual Add Task Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>Task Management</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-bold">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Full CRUD workflows with clean filters, priorities, and organized task lists.
        </p>
      </div>

      <!-- Action Group: Batch Delete + Prominent Add Task Button Next to Lists -->
      <div class="flex items-center gap-2.5">
        {#if tasks.some((t) => t.status === 'Completed')}
          <button
            onclick={onBatchDeleteCompleted}
            class="px-3 py-2 rounded-xl border border-rose-200/80 bg-rose-50/70 hover:bg-rose-100/80 text-xs font-semibold text-rose-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Clear all completed tasks"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span class="hidden md:inline">Clear Completed</span>
          </button>
        {/if}

        <!-- Primary Add Task Button placed directly next to the list selection -->
        <button
          onclick={() => onOpenNewTaskModal({ listId: selectedListFilter || undefined, categoryId: selectedCategoryFilter || undefined })}
          class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer group"
        >
          <Plus class="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
          <span>Add Task</span>
        </button>
      </div>
    </div>

    <!-- Row 2: Search Input & View Switchers -->
    <div class="flex flex-col md:flex-row gap-3 pt-2">
      <!-- Search Bar -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search tasks by title, description, category, or list..."
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

      <!-- View Switcher (List, Kanban, Grid) -->
      <div class="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 self-start md:self-auto">
        <button
          onclick={() => viewMode = 'list'}
          class="p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer {viewMode === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}"
          title="List View"
        >
          <List class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">List</span>
        </button>
        <button
          onclick={() => viewMode = 'kanban'}
          class="p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer {viewMode === 'kanban' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}"
          title="Kanban Board View"
        >
          <Kanban class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Kanban</span>
        </button>
        <button
          onclick={() => viewMode = 'grid'}
          class="p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer {viewMode === 'grid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}"
          title="Grid Card View"
        >
          <LayoutGrid class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Grid</span>
        </button>
      </div>
    </div>

    <!-- Row 3: Status Filter Pills + Dropdown Filters -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
      <!-- Status Tabs -->
      <div class="flex flex-wrap items-center gap-1.5">
        {#each STATUS_TABS as tab (tab.id)}
          {@const count = tab.id === 'All' ? tasks.length : tasks.filter((t) => t.status === tab.id).length}
          <button
            onclick={() => currentStatusTab = tab.id}
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer {currentStatusTab === tab.id ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/70'}"
          >
            <span>{tab.label}</span>
            <span class="ml-1 text-[10px] opacity-80">({count})</span>
          </button>
        {/each}
      </div>

      <!-- Dropdown Selectors: Task List, Category, Priority, Sort -->
      <div class="flex flex-wrap items-center gap-2 w-full lg:w-auto">
        <!-- List Filter -->
        <select
          bind:value={selectedListFilter}
          aria-label="Filter by task list"
          class="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
        >
          <option value={null}>All Task Lists</option>
          {#each taskLists as list (list.id)}
            <option value={list.id}>{list.name}</option>
          {/each}
        </select>

        <!-- Category Filter -->
        <select
          bind:value={selectedCategoryFilter}
          aria-label="Filter by category"
          class="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
        >
          <option value={null}>All Categories</option>
          {#each categories as cat (cat.id)}
            <option value={cat.id}>{cat.name}</option>
          {/each}
        </select>

        <!-- Priority Filter -->
        <select
          bind:value={selectedPriorityFilter}
          aria-label="Filter by priority"
          class="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
        >
          <option value="All">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <!-- Sort Filter -->
        <select
          bind:value={sortBy}
          aria-label="Sort tasks by"
          class="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
        >
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
          <option value="created_at">Newest</option>
          <option value="title">Title (A-Z)</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Content Rendering: List, Kanban, or Grid View -->
  {#if filteredTasks.length === 0}
    <div class="glass-panel rounded-3xl p-12 text-center space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
        <CheckSquare class="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 class="text-base font-bold text-slate-800">No tasks found</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        {#if searchQuery || selectedCategoryFilter || selectedListFilter || currentStatusTab !== 'All'}
          No tasks match your active filters or search terms. Try clearing your filters or create a new task.
        {:else}
          Your workspace is clean. Create your first task to get started!
        {/if}
      </p>
      <button
        onclick={() => onOpenNewTaskModal({ listId: selectedListFilter || undefined, categoryId: selectedCategoryFilter || undefined })}
        class="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>Create First Task</span>
      </button>
    </div>
  {:else if viewMode === 'list'}
    <!-- LIST VIEW -->
    <div class="space-y-2.5">
      {#each filteredTasks as task (task.id)}
        {@const dueBadge = getDueBadge(task.due_date, task.status)}
        <div
          class="glass-card rounded-2xl p-4 border border-slate-200/70 hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
        >
          <!-- Left: Checkbox + Title + Description -->
          <div class="flex items-start gap-3.5 flex-1 min-w-0">
            <!-- Checkbox Toggle -->
            <button
              onclick={() => onToggleTaskStatus(task)}
              class="mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer {task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-blue-500 bg-white'}"
              title={task.status === 'Completed' ? 'Mark as incomplete' : 'Mark as completed'}
              aria-label={task.status === 'Completed' ? 'Mark as incomplete' : 'Mark as completed'}
            >
              {#if task.status === 'Completed'}
                <Check class="w-3.5 h-3.5 stroke-[3]" />
              {/if}
            </button>

            <!-- Text & Metadata -->
            <div class="flex-1 min-w-0 cursor-pointer" onclick={() => onSelectTask(task)}>
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h4 class="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors truncate {task.status === 'Completed' ? 'line-through text-slate-400' : ''}">
                  {task.title}
                </h4>

                <!-- Priority Badge -->
                <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border {getPriorityColor(task.priority)}">
                  {task.priority}
                </span>

                <!-- Due Date Badge -->
                {#if dueBadge}
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold {dueBadge.className}">
                    {dueBadge.label}
                  </span>
                {/if}
              </div>

              {#if task.description}
                <p class="text-xs text-slate-500 line-clamp-1 mb-2">
                  {task.description}
                </p>
              {/if}

              <!-- Tags / Relational Pills -->
              <div class="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                {#if task.category}
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200/60">
                    <span class="w-1.5 h-1.5 rounded-full" style="background-color: {task.category.color};"></span>
                    <CategoryIcon name={task.category.icon} class="w-3 h-3" />
                    <span>{task.category.name}</span>
                  </span>
                {/if}

                {#if task.task_list}
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-200/60">
                    <Layers class="w-3 h-3" />
                    <span>{task.task_list.name}</span>
                  </span>
                {/if}

                {#if task.due_date}
                  <span class="inline-flex items-center gap-1 text-slate-400">
                    <Calendar class="w-3 h-3" />
                    <span>{formatDisplayDate(task.due_date)}</span>
                  </span>
                {/if}
              </div>
            </div>
          </div>

          <!-- Right: Status Dropdown & Action Controls -->
          <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
            <!-- Inline Status Selector -->
            <select
              value={task.status}
              onchange={(e) => onUpdateTaskStatus(task, (e.target as HTMLSelectElement).value as TaskStatus)}
              aria-label="Update task status"
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer {task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : task.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>

            <!-- Edit Button -->
            <button
              onclick={() => onEditTask(task)}
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Edit task"
              aria-label="Edit task"
            >
              <Edit3 class="w-4 h-4" />
            </button>

            <!-- Delete Button -->
            <button
              onclick={() => onDeleteTask(task)}
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete task"
              aria-label="Delete task"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else if viewMode === 'kanban'}
    <!-- KANBAN BOARD VIEW (4 Distinct Columns) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      <!-- 1. Pending Column -->
      <div class="glass-panel p-4 rounded-3xl space-y-3 border-amber-200/60 bg-amber-50/20">
        <div class="flex items-center justify-between pb-2 border-b border-amber-100">
          <div class="flex items-center gap-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
            <Clock class="w-4 h-4" />
            <span>Pending</span>
            <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {kanbanPending.length}
            </span>
          </div>
          <button
            onclick={() => onOpenNewTaskModal({ listId: selectedListFilter || undefined, categoryId: selectedCategoryFilter || undefined })}
            class="p-1 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
            title="Add pending task"
            aria-label="Add pending task"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-2.5">
          {#each kanbanPending as task (task.id)}
            <div class="glass-card p-3.5 rounded-2xl border border-slate-200/70 space-y-2 cursor-pointer hover:border-amber-300" onclick={() => onSelectTask(task)}>
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-xs font-bold text-slate-800 line-clamp-2">{task.title}</h4>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border {getPriorityColor(task.priority)}">
                  {task.priority}
                </span>
              </div>
              {#if task.description}
                <p class="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
              {/if}
              <div class="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>{task.category?.name || 'General'}</span>
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    onUpdateTaskStatus(task, 'In Progress');
                  }}
                  class="text-blue-600 hover:underline font-bold"
                >
                  Start →
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 2. In Progress Column -->
      <div class="glass-panel p-4 rounded-3xl space-y-3 border-blue-200/60 bg-blue-50/20">
        <div class="flex items-center justify-between pb-2 border-b border-blue-100">
          <div class="flex items-center gap-2 text-blue-700 font-extrabold text-xs uppercase tracking-wider">
            <RefreshCw class="w-4 h-4" />
            <span>In Progress</span>
            <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {kanbanInProgress.length}
            </span>
          </div>
          <button
            onclick={() => onOpenNewTaskModal({ listId: selectedListFilter || undefined, categoryId: selectedCategoryFilter || undefined })}
            class="p-1 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
            title="Add active task"
            aria-label="Add active task"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-2.5">
          {#each kanbanInProgress as task (task.id)}
            <div class="glass-card p-3.5 rounded-2xl border border-slate-200/70 space-y-2 cursor-pointer hover:border-blue-300" onclick={() => onSelectTask(task)}>
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-xs font-bold text-slate-800 line-clamp-2">{task.title}</h4>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border {getPriorityColor(task.priority)}">
                  {task.priority}
                </span>
              </div>
              {#if task.description}
                <p class="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
              {/if}
              <div class="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>{task.category?.name || 'General'}</span>
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    onUpdateTaskStatus(task, 'Completed');
                  }}
                  class="text-emerald-600 hover:underline font-bold"
                >
                  Done ✓
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 3. Completed Column -->
      <div class="glass-panel p-4 rounded-3xl space-y-3 border-emerald-200/60 bg-emerald-50/20">
        <div class="flex items-center justify-between pb-2 border-b border-emerald-100">
          <div class="flex items-center gap-2 text-emerald-700 font-extrabold text-xs uppercase tracking-wider">
            <CheckCircle2 class="w-4 h-4" />
            <span>Completed</span>
            <span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {kanbanCompleted.length}
            </span>
          </div>
        </div>

        <div class="space-y-2.5">
          {#each kanbanCompleted as task (task.id)}
            <div class="glass-card p-3.5 rounded-2xl border border-slate-200/70 space-y-2 cursor-pointer hover:border-emerald-300 opacity-80" onclick={() => onSelectTask(task)}>
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-xs font-bold text-slate-600 line-through line-clamp-2">{task.title}</h4>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Done
                </span>
              </div>
              <div class="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>{task.category?.name || 'General'}</span>
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    onUpdateTaskStatus(task, 'Pending');
                  }}
                  class="text-slate-500 hover:underline font-bold"
                >
                  Undo
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- 4. Overdue Column -->
      <div class="glass-panel p-4 rounded-3xl space-y-3 border-rose-200/60 bg-rose-50/20">
        <div class="flex items-center justify-between pb-2 border-b border-rose-100">
          <div class="flex items-center gap-2 text-rose-700 font-extrabold text-xs uppercase tracking-wider">
            <AlertCircle class="w-4 h-4" />
            <span>Overdue</span>
            <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px]">
              {kanbanOverdue.length}
            </span>
          </div>
        </div>

        <div class="space-y-2.5">
          {#each kanbanOverdue as task (task.id)}
            <div class="glass-card p-3.5 rounded-2xl border border-rose-200 space-y-2 cursor-pointer hover:border-rose-400 bg-rose-50/40" onclick={() => onSelectTask(task)}>
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-xs font-bold text-rose-900 line-clamp-2">{task.title}</h4>
                <span class="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border {getPriorityColor(task.priority)}">
                  {task.priority}
                </span>
              </div>
              {#if task.description}
                <p class="text-[11px] text-slate-600 line-clamp-2">{task.description}</p>
              {/if}
              <div class="flex items-center justify-between pt-1 text-[10px] text-rose-600 font-bold">
                <span>{task.due_date ? formatDisplayDate(task.due_date) : 'Overdue'}</span>
                <button
                  onclick={(e) => {
                    e.stopPropagation();
                    onUpdateTaskStatus(task, 'Completed');
                  }}
                  class="text-emerald-700 hover:underline"
                >
                  Resolve ✓
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if viewMode === 'grid'}
    <!-- GRID CARD VIEW -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each filteredTasks as task (task.id)}
        {@const dueBadge = getDueBadge(task.due_date, task.status)}
        <div class="glass-card p-5 rounded-3xl border border-slate-200/70 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
          <div class="space-y-2.5">
            <!-- Top Card Header: Priority & Status Pill -->
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border {getPriorityColor(task.priority)}">
                {task.priority}
              </span>

              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border {task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : task.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}">
                {task.status}
              </span>
            </div>

            <!-- Title & Description -->
            <h4
              onclick={() => onSelectTask(task)}
              class="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer {task.status === 'Completed' ? 'line-through text-slate-400' : ''}"
            >
              {task.title}
            </h4>

            {#if task.description}
              <p class="text-xs text-slate-500 line-clamp-3">
                {task.description}
              </p>
            {/if}
          </div>

          <!-- Bottom Card Footer: Tags & Actions -->
          <div class="space-y-3 pt-3 border-t border-slate-100">
            <div class="flex flex-wrap items-center gap-1.5 text-[10px]">
              {#if task.category}
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full" style="background-color: {task.category.color};"></span>
                  <span>{task.category.name}</span>
                </span>
              {/if}
              {#if task.task_list}
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                  <Layers class="w-3 h-3" />
                  <span>{task.task_list.name}</span>
                </span>
              {/if}
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              {#if dueBadge}
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md {dueBadge.className}">
                  {dueBadge.label}
                </span>
              {:else if task.due_date}
                <span class="text-[10px] text-slate-400">
                  {formatDisplayDate(task.due_date)}
                </span>
              {:else}
                <span></span>
              {/if}

              <div class="flex items-center gap-1">
                <button
                  onclick={() => onToggleTaskStatus(task)}
                  class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Toggle status"
                >
                  <Check class="w-3.5 h-3.5" />
                </button>
                <button
                  onclick={() => onEditTask(task)}
                  class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Edit task"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                </button>
                <button
                  onclick={() => onDeleteTask(task)}
                  class="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete task"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
