<script lang="ts">
  import {
    Layers,
    Plus,
    Search,
    Edit3,
    Trash2,
    ArrowRight,
    Calendar,
    CheckCircle2,
    X,
    CheckSquare
  } from '@lucide/svelte';
  import type { TaskList, Task } from '../types';

  interface Props {
    taskLists: TaskList[];
    tasks: Task[];
    onOpenNewListModal: () => void;
    onEditList: (list: TaskList) => void;
    onDeleteList: (list: TaskList) => void;
    onViewListTasks: (listId: string) => void;
    onOpenNewTaskForList: (listId: string) => void;
  }

  let {
    taskLists,
    tasks,
    onOpenNewListModal,
    onEditList,
    onDeleteList,
    onViewListTasks,
    onOpenNewTaskForList
  }: Props = $props();

  let searchQuery = $state('');

  let filteredLists = $derived.by(() => {
    if (!searchQuery.trim()) return taskLists;
    const q = searchQuery.toLowerCase().trim();
    return taskLists.filter((l) =>
      l.name.toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q)
    );
  });

  function formatDisplayDate(dateStr?: string | null): string {
    if (!dateStr) return 'No deadline';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
</script>

<div class="space-y-6">
  <!-- Top Glass Header Bar -->
  <div class="glass-panel p-6 rounded-3xl space-y-4 border border-white/80 shadow-xs">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>Task Organization Management</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-bold">
            {filteredLists.length} {filteredLists.length === 1 ? 'list' : 'lists'}
          </span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Organize tasks into structured project lists, track deadlines, priorities, and monitor overall completion.
        </p>
      </div>

      <button
        onclick={onOpenNewListModal}
        class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer group shrink-0"
      >
        <Plus class="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
        <span>New Task List</span>
      </button>
    </div>

    <!-- Search Bar -->
    <div class="relative">
      <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search task lists by name or description..."
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

  <!-- Task List Cards Grid -->
  {#if filteredLists.length === 0}
    <div class="glass-panel rounded-3xl p-12 text-center space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
        <Layers class="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 class="text-base font-bold text-slate-800">No task lists found</h3>
      <p class="text-xs text-slate-500 max-w-sm mx-auto">
        Create task lists to categorize your tasks into projects, sprints, or daily routines.
      </p>
      <button
        onclick={onOpenNewListModal}
        class="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>Create First List</span>
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {#each filteredLists as list (list.id)}
        {@const listTasks = tasks.filter((t) => t.list_id === list.id)}
        {@const completedCount = listTasks.filter((t) => t.status === 'Completed').length}
        {@const pendingCount = listTasks.filter((t) => t.status === 'Pending').length}
        {@const inProgressCount = listTasks.filter((t) => t.status === 'In Progress').length}
        {@const overdueCount = listTasks.filter((t) => t.status === 'Overdue').length}
        {@const completionPct = listTasks.length > 0 ? Math.round((completedCount / listTasks.length) * 100) : 0}

        <div class="glass-card p-6 rounded-3xl border border-slate-200/70 hover:border-blue-300 transition-all flex flex-col justify-between space-y-5">
          <div class="space-y-3.5">
            <!-- Header Row: Color bar + List Name + Add Task Button Directly Next to List -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-3.5 h-3.5 rounded-lg shrink-0 shadow-xs" style="background-color: {list.color || '#3b82f6'};"></span>
                <h3 class="text-base font-bold text-slate-900 truncate">
                  {list.name}
                </h3>
              </div>

              <!-- Dedicated "+ Add Task" button right next to the list! -->
              <button
                onclick={() => onOpenNewTaskForList(list.id)}
                class="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer shrink-0"
                title="Add task directly to {list.name}"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <!-- Description -->
            {#if list.description}
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {list.description}
              </p>
            {/if}

            <!-- Progress Meter -->
            <div class="space-y-2 pt-1">
              <div class="flex items-center justify-between text-xs font-semibold">
                <span class="text-slate-600">Completion</span>
                <span class="text-blue-600 font-bold">{completionPct}% ({completedCount}/{listTasks.length})</span>
              </div>
              <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  style="width: {completionPct}%; background-color: {list.color || '#3b82f6'};"
                ></div>
              </div>
            </div>

            <!-- Status Breakdown Badges -->
            <div class="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold pt-1">
              <div class="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60">
                <div>{pendingCount}</div>
                <div class="text-[9px] font-medium opacity-80">Pending</div>
              </div>
              <div class="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
                <div>{inProgressCount}</div>
                <div class="text-[9px] font-medium opacity-80">Active</div>
              </div>
              <div class="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <div>{completedCount}</div>
                <div class="text-[9px] font-medium opacity-80">Done</div>
              </div>
              <div class="p-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60">
                <div>{overdueCount}</div>
                <div class="text-[9px] font-medium opacity-80">Overdue</div>
              </div>
            </div>
          </div>

          <!-- Bottom Card Actions -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <button
              onclick={() => onViewListTasks(list.id)}
              class="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Tasks</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </button>

            <div class="flex items-center gap-1">
              <button
                onclick={() => onEditList(list)}
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Edit list"
                aria-label="Edit list"
              >
                <Edit3 class="w-4 h-4" />
              </button>

              <button
                onclick={() => onDeleteList(list)}
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete list"
                aria-label="Delete list"
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
