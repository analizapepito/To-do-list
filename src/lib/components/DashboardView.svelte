<script lang="ts">
  import type { Task, Category, TaskList } from '../types';

  interface Props {
    tasks: Task[];
    categories: Category[];
    taskLists: TaskList[];
    onNavigate: (tab: 'dashboard' | 'tasks' | 'categories' | 'lists') => void;
    onFilterList: (listId: string) => void;
    onFilterCategory: (categoryId: string) => void;
    onOpenNewTaskModal: () => void;
    onSelectTask: (task: Task) => void;
    onToggleTaskStatus: (task: Task) => void;
  }

  let {
    tasks,
    categories,
    taskLists,
    onNavigate,
    onFilterList,
    onFilterCategory,
    onOpenNewTaskModal,
    onSelectTask,
    onToggleTaskStatus
  }: Props = $props();

  // Metrics computation
  let totalTasks = $derived(tasks.length);
  let completedTasks = $derived(tasks.filter((t) => t.status === 'Completed').length);
  let pendingTasks = $derived(tasks.filter((t) => t.status === 'Pending').length);
  let inProgressTasks = $derived(tasks.filter((t) => t.status === 'In Progress').length);
  let overdueTasks = $derived(tasks.filter((t) => t.status === 'Overdue').length);

  let completionRate = $derived(
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  );

  let urgentAndOverdueTasks = $derived(
    tasks
      .filter((t) => (t.status === 'Overdue' || t.priority === 'Urgent') && t.status !== 'Completed')
      .slice(0, 5)
  );

  let recentTasks = $derived(
    tasks.slice(0, 6)
  );

  function formatRelativeDate(isoString?: string | null): string {
    if (!isoString) return 'No due date';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }
</script>

<div class="space-y-8 animate-in fade-in">
  <!-- Hero Section -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/30 border border-slate-800 p-6 sm:p-8 backdrop-blur-md">
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-3">
          <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          System Overview & Real-Time Tracking
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          To-Do List Management System
        </h1>
        <p class="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed">
          Full stack individual project featuring task CRUD operations, category taxonomy, and organized list management powered by Svelte, Supabase, and PostgreSQL.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          onclick={onOpenNewTaskModal}
          class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add New Task
        </button>
        <button
          onclick={() => onNavigate('tasks')}
          class="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          View All Tasks
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Metric Overview Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
    <!-- Total Tasks -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
        <div class="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl sm:text-3xl font-extrabold text-white">{totalTasks}</span>
        <span class="text-xs text-slate-400">records</span>
      </div>
    </div>

    <!-- Pending Tasks -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</span>
        <div class="p-2 bg-slate-700/50 text-slate-300 rounded-xl">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2" />
          </svg>
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl sm:text-3xl font-extrabold text-white">{pendingTasks}</span>
        <span class="text-xs text-slate-400">to start</span>
      </div>
    </div>

    <!-- In Progress -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
        <div class="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl sm:text-3xl font-extrabold text-white">{inProgressTasks}</span>
        <span class="text-xs text-indigo-400 font-medium">active</span>
      </div>
    </div>

    <!-- Completed Tasks -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
        <div class="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl sm:text-3xl font-extrabold text-emerald-400">{completedTasks}</span>
        <span class="text-xs text-emerald-400/80 font-medium">{completionRate}% done</span>
      </div>
    </div>

    <!-- Overdue Tasks -->
    <div class="col-span-2 lg:col-span-1 bg-slate-900/80 border {overdueTasks > 0 ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800'} rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-sm">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold {overdueTasks > 0 ? 'text-rose-400' : 'text-slate-400'} uppercase tracking-wider">Overdue</span>
        <div class="p-2 {overdueTasks > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'} rounded-xl">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
      <div class="mt-3 flex items-baseline gap-2">
        <span class="text-2xl sm:text-3xl font-extrabold {overdueTasks > 0 ? 'text-rose-400' : 'text-white'}">{overdueTasks}</span>
        <span class="text-xs {overdueTasks > 0 ? 'text-rose-400/80' : 'text-slate-400'}">past due</span>
      </div>
    </div>
  </div>

  <!-- Progress Bar Overall -->
  <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
    <div class="flex items-center justify-between text-sm mb-2">
      <div class="flex items-center gap-2">
        <span class="font-bold text-white">System Completion Progress</span>
        <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
          {completedTasks}/{totalTasks} Tasks
        </span>
      </div>
      <span class="font-extrabold text-blue-400">{completionRate}%</span>
    </div>
    <div class="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-0.5">
      <div 
        class="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-sm"
        style="width: {completionRate}%"
      ></div>
    </div>
  </div>

  <!-- Two Column Layout: Urgent/Overdue Focus + Lists & Categories -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Attention Needed / Urgent & Overdue -->
    <div class="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="font-bold text-white text-base">Priority & Overdue Action Items</h3>
          </div>
          <button 
            onclick={() => onNavigate('tasks')}
            class="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Manage All &rarr;
          </button>
        </div>

        {#if urgentAndOverdueTasks.length === 0}
          <div class="py-12 text-center text-slate-500">
            <svg class="w-10 h-10 mx-auto text-emerald-400/60 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm font-medium text-slate-300">All caught up! No urgent or overdue tasks.</p>
            <p class="text-xs text-slate-500 mt-1">Great job staying on top of your deadlines.</p>
          </div>
        {:else}
          <div class="mt-4 divide-y divide-slate-800/60">
            {#each urgentAndOverdueTasks as task (task.id)}
              <div class="py-3 flex items-center justify-between gap-3 group">
                <div class="flex items-center gap-3 min-w-0">
                  <button
                    onclick={() => onToggleTaskStatus(task)}
                    class="w-5 h-5 rounded border border-slate-600 hover:border-emerald-500 flex items-center justify-center transition-colors shrink-0"
                    title="Mark completed"
                  >
                    {#if task.status === 'Completed'}
                      <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    {/if}
                  </button>

                  <button
                    onclick={() => onSelectTask(task)}
                    class="text-left truncate hover:text-blue-400 transition-colors"
                  >
                    <div class="text-sm font-medium text-slate-200 group-hover:text-blue-300 truncate">
                      {task.title}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      {#if task.category}
                        <span class="flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full" style="background-color: {task.category.color};"></span>
                          {task.category.name}
                        </span>
                      {/if}
                      <span>&bull;</span>
                      <span class="{task.status === 'Overdue' ? 'text-rose-400 font-semibold' : 'text-slate-400'}">
                        {formatRelativeDate(task.due_date)}
                      </span>
                    </div>
                  </button>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                    {task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}"
                  >
                    {task.priority}
                  </span>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                    {task.status === 'Overdue' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'}"
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 mt-4">
        <span>Organized into {taskLists.length} task lists</span>
        <button onclick={onOpenNewTaskModal} class="text-blue-400 hover:text-blue-300 font-medium">
          + Quick Add
        </button>
      </div>
    </div>

    <!-- Task Lists / Organization Quick Summary -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 class="font-bold text-white text-base">Task Lists Progress</h3>
          </div>
          <button 
            onclick={() => onNavigate('lists')}
            class="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Manage &rarr;
          </button>
        </div>

        <div class="mt-4 space-y-4">
          {#each taskLists as list (list.id)}
            {@const listTasks = tasks.filter((t) => t.list_id === list.id)}
            {@const listCompleted = listTasks.filter((t) => t.status === 'Completed').length}
            {@const pct = listTasks.length > 0 ? Math.round((listCompleted / listTasks.length) * 100) : 0}

            <div class="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <button 
                  onclick={() => {
                    onFilterList(list.id);
                    onNavigate('tasks');
                  }}
                  class="font-semibold text-slate-200 hover:text-blue-400 transition-colors flex items-center gap-1.5 truncate text-left"
                >
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: {list.color};"></span>
                  <span class="truncate">{list.name}</span>
                </button>
                <span class="font-mono text-slate-400 text-[11px] shrink-0">
                  {listCompleted}/{listTasks.length} ({pct}%)
                </span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-500"
                  style="width: {pct}%; background-color: {list.color || '#3b82f6'};"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Categories Pills -->
      <div class="mt-6 pt-4 border-t border-slate-800">
        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Categories</span>
          <button onclick={() => onNavigate('categories')} class="text-[11px] text-blue-400 hover:text-blue-300">
            View All ({categories.length})
          </button>
        </div>
        <div class="flex flex-wrap gap-1.5">
          {#each categories as cat}
            {@const count = tasks.filter((t) => t.category_id === cat.id).length}
            <button
              onclick={() => {
                onFilterCategory(cat.id);
                onNavigate('tasks');
              }}
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
            >
              <span class="w-2 h-2 rounded-full" style="background-color: {cat.color};"></span>
              <span>{cat.name}</span>
              <span class="text-[10px] text-slate-500 font-mono">({count})</span>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
