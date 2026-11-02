<script lang="ts">
  import type { Task, Category, TaskList, TaskStatus, TaskPriority } from '../types';

  interface Props {
    isOpen: boolean;
    task?: Task | null;
    categories: Category[];
    taskLists: TaskList[];
    defaultListId?: string | null;
    defaultCategoryId?: string | null;
    onSave: (taskData: {
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
      due_date: string | null;
      category_id: string | null;
      list_id: string | null;
    }) => Promise<void>;
    onClose: () => void;
  }

  let {
    isOpen,
    task = null,
    categories = [],
    taskLists = [],
    defaultListId = null,
    defaultCategoryId = null,
    onSave,
    onClose
  }: Props = $props();

  let title = $state('');
  let description = $state('');
  let status = $state<TaskStatus>('Pending');
  let priority = $state<TaskPriority>('Medium');
  let due_date = $state('');
  let category_id = $state<string | null>(null);
  let list_id = $state<string | null>(null);

  let isSubmitting = $state(false);
  let errorMsg = $state('');

  const STATUS_OPTIONS: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'Pending', label: 'Pending', color: 'bg-slate-700 text-slate-300' },
    { id: 'In Progress', label: 'In Progress', color: 'bg-blue-600/30 text-blue-300 border border-blue-500/40' },
    { id: 'Completed', label: 'Completed', color: 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' },
    { id: 'Overdue', label: 'Overdue', color: 'bg-rose-600/30 text-rose-300 border border-rose-500/40' }
  ];

  const PRIORITY_OPTIONS: { id: TaskPriority; label: string; badge: string }[] = [
    { id: 'Low', label: 'Low', badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    { id: 'Medium', label: 'Medium', badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    { id: 'High', label: 'High', badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    { id: 'Urgent', label: 'Urgent', badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40' }
  ];

  function formatDateTimeLocal(isoString?: string | null): string {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  }

  function setDateShortcut(daysOffset: number) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    d.setHours(18, 0, 0, 0); // default to 6:00 PM
    due_date = formatDateTimeLocal(d.toISOString());
  }

  $effect(() => {
    if (isOpen) {
      if (task) {
        title = task.title;
        description = task.description || '';
        status = task.status;
        priority = task.priority;
        due_date = formatDateTimeLocal(task.due_date);
        category_id = task.category_id || null;
        list_id = task.list_id || null;
      } else {
        title = '';
        description = '';
        status = 'Pending';
        priority = 'Medium';
        due_date = '';
        category_id = defaultCategoryId || (categories.length > 0 ? categories[0].id : null);
        list_id = defaultListId || (taskLists.length > 0 ? taskLists[0].id : null);
      }
      errorMsg = '';
      isSubmitting = false;
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!title.trim()) {
      errorMsg = 'Task title is required';
      return;
    }

    try {
      isSubmitting = true;
      errorMsg = '';

      let formattedIsoDue: string | null = null;
      if (due_date) {
        const parsed = new Date(due_date);
        if (!isNaN(parsed.getTime())) {
          formattedIsoDue = parsed.toISOString();
        }
      }

      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: formattedIsoDue,
        category_id: category_id || null,
        list_id: list_id || null
      });

      onClose();
    } catch (err: any) {
      errorMsg = err?.message || 'Failed to save task';
    } finally {
      isSubmitting = false;
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {task ? 'Edit Task' : 'Create New Task'}
        </h3>
        <button
          onclick={onClose}
          class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {#if errorMsg}
        <div class="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMsg}
        </div>
      {/if}

      <form onsubmit={handleSubmit} class="mt-4 space-y-4">
        <!-- Task Title -->
        <div>
          <label for="task-title" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Task Title <span class="text-rose-400">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            bind:value={title}
            placeholder="e.g. Complete Database Migration for To-Do System"
            class="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
            required
          />
        </div>

        <!-- Task Description -->
        <div>
          <label for="task-desc" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description & Notes
          </label>
          <textarea
            id="task-desc"
            bind:value={description}
            rows="3"
            placeholder="Add detailed task notes, instructions, sub-steps or requirements..."
            class="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
          ></textarea>
        </div>

        <!-- Status & Priority Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Status -->
          <div>
            <span class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Status
            </span>
            <div class="grid grid-cols-2 gap-1.5">
              {#each STATUS_OPTIONS as opt}
                <button
                  type="button"
                  onclick={() => status = opt.id}
                  class="px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-center border
                  {status === opt.id 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30 font-semibold' 
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-slate-200'}"
                >
                  {opt.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- Priority -->
          <div>
            <span class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority Level
            </span>
            <div class="grid grid-cols-2 gap-1.5">
              {#each PRIORITY_OPTIONS as opt}
                <button
                  type="button"
                  onclick={() => priority = opt.id}
                  class="px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-center border
                  {priority === opt.id 
                    ? 'ring-2 ring-blue-500 font-semibold ' + opt.badge
                    : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-slate-200'}"
                >
                  {opt.label}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Task Organization: Category & List Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category -->
          <div>
            <label for="task-category" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              id="task-category"
              bind:value={category_id}
              class="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value={null}>-- No Category (General) --</option>
              {#each categories as cat}
                <option value={cat.id}>{cat.name}</option>
              {/each}
            </select>
          </div>

          <!-- Task List / Project -->
          <div>
            <label for="task-list" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Task List / Project
            </label>
            <select
              id="task-list"
              bind:value={list_id}
              class="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value={null}>-- Inbox / General List --</option>
              {#each taskLists as lst}
                <option value={lst.id}>{lst.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Due Date and Time -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label for="task-due" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Due Date & Time
            </label>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                onclick={() => setDateShortcut(0)}
                class="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onclick={() => setDateShortcut(1)}
                class="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onclick={() => setDateShortcut(7)}
                class="text-[11px] px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
              >
                +1 Week
              </button>
              {#if due_date}
                <button
                  type="button"
                  onclick={() => due_date = ''}
                  class="text-[11px] px-1.5 py-0.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  title="Clear deadline"
                >
                  Clear
                </button>
              {/if}
            </div>
          </div>
          <input
            id="task-due"
            type="datetime-local"
            bind:value={due_date}
            class="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div class="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-blue-900/30 flex items-center gap-2"
          >
            {#if isSubmitting}
              <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            {/if}
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
