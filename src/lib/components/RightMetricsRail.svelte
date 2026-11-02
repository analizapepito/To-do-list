<script lang="ts">
  import {
    Clock,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    CheckSquare,
    Bookmark,
    Layers,
    ChevronRight,
    TrendingUp
  } from '@lucide/svelte';
  import type { Task, Category, TaskList } from '../types';
  import CategoryIcon from './CategoryIcon.svelte';

  interface Props {
    tasks: Task[];
    categories: Category[];
    taskLists: TaskList[];
    onFilterList?: (listId: string) => void;
    onFilterCategory?: (categoryId: string) => void;
  }

  let { tasks, categories, taskLists, onFilterList, onFilterCategory }: Props = $props();

  // Metrics derivation
  let totalTasks = $derived(tasks.length);
  let pendingTasks = $derived(tasks.filter((t) => t.status === 'Pending').length);
  let inProgressTasks = $derived(tasks.filter((t) => t.status === 'In Progress').length);
  let completedTasks = $derived(tasks.filter((t) => t.status === 'Completed').length);
  let overdueTasks = $derived(tasks.filter((t) => t.status === 'Overdue').length);

  let completionRate = $derived(
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  );
</script>

<aside class="hidden xl:flex flex-col w-80 h-screen sticky top-0 overflow-y-auto p-6 space-y-6 border-l border-slate-200/80 bg-white/70 backdrop-blur-2xl shrink-0">
  <!-- Section Title -->
  <div class="flex items-center justify-between">
    <h2 class="text-xs font-bold text-slate-400 tracking-wider uppercase">System Metrics</h2>
    <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
      <TrendingUp class="w-3 h-3" />
      Real-Time
    </span>
  </div>

  <!-- Total Tasks Hero Card -->
  <div class="glass-card rounded-2xl p-4.5 bg-gradient-to-br from-white/95 to-blue-50/40 border border-blue-100 shadow-sm relative overflow-hidden">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tasks</p>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="text-3xl font-extrabold text-slate-900 tracking-tight">{totalTasks}</span>
          <span class="text-xs font-semibold text-slate-500">records</span>
        </div>
      </div>
      <div class="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
        <CheckSquare class="w-5 h-5 stroke-[2.2]" />
      </div>
    </div>

    <!-- Mini Progress Bar inside Hero Card -->
    <div class="mt-4 space-y-1.5">
      <div class="flex items-center justify-between text-xs font-semibold">
        <span class="text-slate-600 text-[11px]">Completion</span>
        <span class="text-blue-600 font-bold">{completionRate}%</span>
      </div>
      <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
        <div
          class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
          style="width: {completionRate}%"
        ></div>
      </div>
      <p class="text-[10px] text-slate-400 font-medium text-right">{completedTasks} of {totalTasks} finished</p>
    </div>
  </div>

  <!-- Status Grid: 4 Organized Metric Cards -->
  <div class="space-y-2.5">
    <p class="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Status Breakdown</p>

    <div class="grid grid-cols-2 gap-2.5">
      <!-- Pending -->
      <div class="glass-card p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/30 flex flex-col justify-between">
        <div class="flex items-center justify-between text-amber-600 mb-1">
          <Clock class="w-4 h-4" />
          <span class="text-[10px] font-bold uppercase tracking-wider">Pending</span>
        </div>
        <div class="text-2xl font-extrabold text-slate-800">{pendingTasks}</div>
        <p class="text-[10px] text-slate-500 font-medium">To be started</p>
      </div>

      <!-- In Progress -->
      <div class="glass-card p-3.5 rounded-xl border border-blue-200/70 bg-blue-50/30 flex flex-col justify-between">
        <div class="flex items-center justify-between text-blue-600 mb-1">
          <RefreshCw class="w-4 h-4" />
          <span class="text-[10px] font-bold uppercase tracking-wider">Active</span>
        </div>
        <div class="text-2xl font-extrabold text-slate-800">{inProgressTasks}</div>
        <p class="text-[10px] text-slate-500 font-medium">In progress</p>
      </div>

      <!-- Completed -->
      <div class="glass-card p-3.5 rounded-xl border border-emerald-200/70 bg-emerald-50/30 flex flex-col justify-between">
        <div class="flex items-center justify-between text-emerald-600 mb-1">
          <CheckCircle2 class="w-4 h-4" />
          <span class="text-[10px] font-bold uppercase tracking-wider">Done</span>
        </div>
        <div class="text-2xl font-extrabold text-slate-800">{completedTasks}</div>
        <p class="text-[10px] text-slate-500 font-medium">Completed</p>
      </div>

      <!-- Overdue -->
      <div class="glass-card p-3.5 rounded-xl border border-rose-200/70 bg-rose-50/30 flex flex-col justify-between">
        <div class="flex items-center justify-between text-rose-600 mb-1">
          <AlertCircle class="w-4 h-4" />
          <span class="text-[10px] font-bold uppercase tracking-wider">Alert</span>
        </div>
        <div class="text-2xl font-extrabold text-rose-600">{overdueTasks}</div>
        <p class="text-[10px] text-rose-500 font-medium">Past deadline</p>
      </div>
    </div>
  </div>

  <!-- Task Lists Progress Rail -->
  <div class="space-y-2.5">
    <div class="flex items-center justify-between">
      <p class="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Task Lists</p>
      <span class="text-[10px] font-bold text-slate-400">{taskLists.length} Lists</span>
    </div>

    <div class="space-y-2">
      {#each taskLists as list (list.id)}
        {@const listTasks = tasks.filter((t) => t.list_id === list.id)}
        {@const listCompleted = listTasks.filter((t) => t.status === 'Completed').length}
        {@const listPct = listTasks.length > 0 ? Math.round((listCompleted / listTasks.length) * 100) : 0}

        <button
          onclick={() => onFilterList && onFilterList(list.id)}
          class="w-full text-left p-2.5 rounded-xl glass-card border border-slate-200/70 hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div class="flex items-center justify-between text-xs mb-1.5">
            <span class="font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
              {list.name}
            </span>
            <span class="text-[10px] font-bold text-slate-500">{listCompleted}/{listTasks.length}</span>
          </div>

          <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              style="width: {listPct}%; background-color: {list.color || '#3b82f6'};"
            ></div>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Categories Rail -->
  <div class="space-y-2.5">
    <div class="flex items-center justify-between">
      <p class="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Categories</p>
      <span class="text-[10px] font-bold text-slate-400">{categories.length} Tags</span>
    </div>

    <div class="flex flex-wrap gap-1.5">
      {#each categories as category (category.id)}
        {@const catCount = tasks.filter((t) => t.category_id === category.id).length}
        <button
          onclick={() => onFilterCategory && onFilterCategory(category.id)}
          class="px-2.5 py-1 rounded-lg text-xs font-medium glass-card border border-slate-200/60 hover:border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span class="w-2 h-2 rounded-full" style="background-color: {category.color};"></span>
          <span class="text-slate-700">{category.name}</span>
          <span class="text-[10px] font-bold text-slate-400">({catCount})</span>
        </button>
      {/each}
    </div>
  </div>
</aside>
