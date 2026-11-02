<script lang="ts">
  import {
    Plus,
    ArrowRight,
    CheckSquare,
    Clock,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Layers,
    Tag,
    Calendar,
    Sparkles,
    Check
  } from '@lucide/svelte';
  import type { Task, Category, TaskList } from '../types';
  import CategoryIcon from './CategoryIcon.svelte';

  interface Props {
    tasks: Task[];
    categories: Category[];
    taskLists: TaskList[];
    onNavigate: (tab: 'dashboard' | 'tasks' | 'categories' | 'lists') => void;
    onFilterList: (listId: string) => void;
    onFilterCategory: (categoryId: string) => void;
    onOpenNewTaskModal: (opts?: { listId?: string; categoryId?: string }) => void;
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

<div class="space-y-8">
  <!-- Hero Glass Welcome Banner -->
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-purple-50/60 border border-blue-100/80 p-6 sm:p-8 backdrop-blur-xl shadow-xs">
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/60 border border-blue-200/60 text-xs font-bold text-blue-700 mb-3">
          <Sparkles class="w-3.5 h-3.5 text-blue-600" />
          <span>System Overview & Real-Time Tracking</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          To-Do List Management System
        </h1>
        <p class="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
          Full stack individual project featuring task CRUD operations, category taxonomy, and organized list management powered by Svelte, Supabase, and PostgreSQL.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          onclick={() => onOpenNewTaskModal()}
          class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer group"
        >
          <Plus class="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
          <span>Add New Task</span>
        </button>

        <button
          onclick={() => onNavigate('tasks')}
          class="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>View All Tasks</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>

  <!-- Priority & Overdue Action Items Section -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60">
          <AlertCircle class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Priority & Overdue Action Items
          </h3>
          <p class="text-xs text-slate-500">Tasks requiring immediate attention or past deadline</p>
        </div>
      </div>

      <button
        onclick={() => onNavigate('tasks')}
        class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
      >
        <span>Manage All</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </button>
    </div>

    {#if urgentAndOverdueTasks.length === 0}
      <div class="glass-panel rounded-2xl p-6 text-center text-xs text-slate-500 space-y-1">
        <CheckCircle2 class="w-6 h-6 text-emerald-500 mx-auto" />
        <p class="font-bold text-slate-700">All clear!</p>
        <p>No urgent or overdue tasks currently pending.</p>
      </div>
    {:else}
      <div class="space-y-2.5">
        {#each urgentAndOverdueTasks as task (task.id)}
          <div class="glass-card p-4 rounded-2xl border border-slate-200/70 hover:border-blue-300 flex items-center justify-between gap-3 group">
            <div class="flex items-center gap-3 min-w-0">
              <button
                onclick={() => onToggleTaskStatus(task)}
                class="w-5 h-5 rounded-lg border border-slate-300 hover:border-blue-500 bg-white flex items-center justify-center transition-colors shrink-0"
                title="Mark completed"
                aria-label="Mark completed"
              >
                <Check class="w-3 h-3 text-transparent group-hover:text-slate-300" />
              </button>

              <button
                onclick={() => onSelectTask(task)}
                class="text-left min-w-0 cursor-pointer"
              >
                <h4 class="text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 truncate">
                  {task.title}
                </h4>
                <div class="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                  {#if task.category}
                    <span>{task.category.name}</span>
                    <span>•</span>
                  {/if}
                  <span>{formatRelativeDate(task.due_date)}</span>
                </div>
              </button>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border {task.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}">
                {task.priority}
              </span>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border {task.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'}">
                {task.status}
              </span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Task Organization Module (Task Lists) -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
          <Layers class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Task Organization & Lists
          </h3>
          <p class="text-xs text-slate-500">Organized into {taskLists.length} task lists with progress tracking</p>
        </div>
      </div>

      <button
        onclick={() => onNavigate('lists')}
        class="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
      >
        <span>Manage Lists</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {#each taskLists as list (list.id)}
        {@const listTasks = tasks.filter((t) => t.list_id === list.id)}
        {@const listCompleted = listTasks.filter((t) => t.status === 'Completed').length}
        {@const listPct = listTasks.length > 0 ? Math.round((listCompleted / listTasks.length) * 100) : 0}

        <div class="glass-card p-5 rounded-3xl border border-slate-200/70 hover:border-blue-300 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: {list.color || '#3b82f6'};"></span>
              <span class="text-[10px] font-bold text-slate-500">{listCompleted}/{listTasks.length} Done</span>
            </div>

            <h4
              onclick={() => onFilterList(list.id)}
              class="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {list.name}
            </h4>

            {#if list.description}
              <p class="text-xs text-slate-500 line-clamp-2">
                {list.description}
              </p>
            {/if}
          </div>

          <div class="space-y-2.5 pt-2 border-t border-slate-100">
            <!-- Progress Bar -->
            <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                style="width: {listPct}%; background-color: {list.color || '#3b82f6'};"
              ></div>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <button
                onclick={() => onFilterList(list.id)}
                class="text-xs font-bold text-blue-600 hover:underline"
              >
                View Tasks →
              </button>

              <button
                onclick={() => onOpenNewTaskModal({ listId: list.id })}
                class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus class="w-3 h-3" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Categories Taxonomy Quick Access -->
  <div class="glass-panel p-6 rounded-3xl space-y-4 border border-slate-200/70">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Tag class="w-4 h-4 text-blue-600" />
        <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Task Categories ({categories.length})
        </h3>
      </div>

      <button
        onclick={() => onNavigate('categories')}
        class="text-xs font-bold text-blue-600 hover:underline"
      >
        View All →
      </button>
    </div>

    <div class="flex flex-wrap gap-2">
      {#each categories as cat (cat.id)}
        {@const catCount = tasks.filter((t) => t.category_id === cat.id).length}
        <button
          onclick={() => onFilterCategory(cat.id)}
          class="px-3.5 py-2 rounded-xl text-xs font-semibold glass-card border border-slate-200/70 hover:border-blue-300 flex items-center gap-2 transition-all cursor-pointer"
        >
          <span class="w-2 h-2 rounded-full" style="background-color: {cat.color};"></span>
          <CategoryIcon name={cat.icon} class="w-3.5 h-3.5" />
          <span class="text-slate-800">{cat.name}</span>
          <span class="text-[10px] font-bold text-slate-400">({catCount})</span>
        </button>
      {/each}
    </div>
  </div>
</div>
