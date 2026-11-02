<script lang="ts">
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

<div class="space-y-6 animate-in fade-in">
  <!-- Header Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h2 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
        <span>Task Organization Management</span>
        <span class="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
          {filteredLists.length} {filteredLists.length === 1 ? 'list' : 'lists'}
        </span>
      </h2>
      <p class="text-xs sm:text-sm text-slate-400 mt-1">
        Module C: Create, organize, prioritize, track deadlines, and manage completion across dedicated task projects.
      </p>
    </div>

    <button
      onclick={onOpenNewListModal}
      class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
      </svg>
      New Task List
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
        placeholder="Search task lists by title or description..."
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

  <!-- Lists Grid -->
  {#if filteredLists.length === 0}
    <div class="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
      <svg class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
      <h3 class="text-base font-semibold text-slate-300">No task lists found</h3>
      <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        Create structured task lists to group sprint goals, daily routines, or academic milestones.
      </p>
      <button
        onclick={onOpenNewListModal}
        class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-md shadow-blue-900/20 cursor-pointer"
      >
        + Create Task List
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each filteredLists as list (list.id)}
        {@const listTasks = tasks.filter((t) => t.list_id === list.id)}
        {@const completedListTasks = listTasks.filter((t) => t.status === 'Completed').length}
        {@const pendingListTasks = listTasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length}
        {@const overdueListTasks = listTasks.filter((t) => t.status === 'Overdue').length}
        {@const pct = listTasks.length > 0 ? Math.round((completedListTasks / listTasks.length) * 100) : 0}

        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <!-- Top Accent Band -->
          <div 
            class="absolute top-0 left-0 right-0 h-1.5 transition-all"
            style="background-color: {list.color || '#3b82f6'};"
          ></div>

          <div>
            <!-- Header Row: Title & Action Menu -->
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex items-center gap-3">
                <span 
                  class="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 font-bold"
                  style="background-color: {list.color || '#3b82f6'};"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                <div>
                  <h3 class="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">
                    {list.name}
                  </h3>
                  {#if list.target_date}
                    <div class="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Deadline: {formatDisplayDate(list.target_date)}</span>
                    </div>
                  {/if}
                </div>
              </div>

              <!-- Action icons -->
              <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onclick={() => onEditList(list)}
                  class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Edit List"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onclick={() => onDeleteList(list)}
                  class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete List & Associated Tasks"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Description -->
            <p class="text-xs text-slate-400 leading-relaxed mt-2 min-h-[36px]">
              {list.description || 'No description set for this task list.'}
            </p>

            <!-- Completion Tracking Progress Bar -->
            <div class="mt-4 p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium">Completion Tracking</span>
                <span class="font-extrabold text-white font-mono">{pct}%</span>
              </div>
              <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-500"
                  style="width: {pct}%; background-color: {list.color || '#3b82f6'};"
                ></div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                <span>{completedListTasks} of {listTasks.length} Completed</span>
                {#if overdueListTasks > 0}
                  <span class="text-rose-400 font-bold">{overdueListTasks} Overdue</span>
                {/if}
              </div>
            </div>

            <!-- Task Status Metrics -->
            <div class="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-medium">
              <div class="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                <div class="text-slate-400 text-[10px] uppercase">Active</div>
                <div class="text-sm font-bold text-white mt-0.5">{pendingListTasks}</div>
              </div>
              <div class="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                <div class="text-emerald-400 text-[10px] uppercase">Done</div>
                <div class="text-sm font-bold text-emerald-400 mt-0.5">{completedListTasks}</div>
              </div>
              <div class="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
                <div class="{overdueListTasks > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'} text-[10px] uppercase">Overdue</div>
                <div class="text-sm font-bold {overdueListTasks > 0 ? 'text-rose-400' : 'text-slate-400'} mt-0.5">{overdueListTasks}</div>
              </div>
            </div>
          </div>

          <!-- Bottom Actions: Add Task to this list & View Tasks -->
          <div class="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              onclick={() => onOpenNewTaskForList(list.id)}
              class="text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Task</span>
            </button>

            <button
              onclick={() => onViewListTasks(list.id)}
              class="text-xs font-semibold px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
