<script lang="ts">
  import {
    CheckSquare,
    X,
    AlertCircle,
    Calendar,
    Tag,
    Layers,
    Clock,
    RefreshCw,
    CheckCircle2
  } from '@lucide/svelte';
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

  const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
    { id: 'Pending', label: 'Pending' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Overdue', label: 'Overdue' }
  ];

  const PRIORITY_OPTIONS: { id: TaskPriority; label: string }[] = [
    { id: 'Low', label: 'Low' },
    { id: 'Medium', label: 'Medium' },
    { id: 'High', label: 'High' },
    { id: 'Urgent', label: 'Urgent' }
  ];

  function formatDateTimeLocal(isoString?: string | null): string {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${mins}`;
    } catch {
      return '';
    }
  }

  $effect(() => {
    if (isOpen) {
      errorMsg = '';
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
        category_id = defaultCategoryId || null;
        list_id = defaultListId || null;
      }
    }
  });

  async function handleSubmit(e: Event) {
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
        formattedIsoDue = new Date(due_date).toISOString();
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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 class="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckSquare class="w-4 h-4" />
          </div>
          <span>{task ? 'Edit Task' : 'Create New Task'}</span>
        </h3>
        <button
          onclick={onClose}
          class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      {#if errorMsg}
        <div class="mt-4 p-3 bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      {/if}

      <form onsubmit={handleSubmit} class="mt-5 space-y-4">
        <!-- Task Title -->
        <div>
          <label for="task-title" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Task Title <span class="text-rose-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            bind:value={title}
            placeholder="e.g. Complete Database Migration for To-Do System"
            class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-medium transition-all"
            required
          />
        </div>

        <!-- Task Description -->
        <div>
          <label for="task-desc" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description & Notes
          </label>
          <textarea
            id="task-desc"
            bind:value={description}
            rows="3"
            placeholder="Add detailed task notes, instructions, sub-steps or requirements..."
            class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-xs sm:text-sm font-medium transition-all"
          ></textarea>
        </div>

        <!-- Status & Priority Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Status -->
          <div>
            <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </span>
            <div class="grid grid-cols-2 gap-1.5">
              {#each STATUS_OPTIONS as opt}
                <button
                  type="button"
                  onclick={() => status = opt.id}
                  class="px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer
                  {status === opt.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}"
                >
                  {opt.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- Priority -->
          <div>
            <span class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Priority
            </span>
            <div class="grid grid-cols-2 gap-1.5">
              {#each PRIORITY_OPTIONS as opt}
                <button
                  type="button"
                  onclick={() => priority = opt.id}
                  class="px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer
                  {priority === opt.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}"
                >
                  {opt.label}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Due Date -->
        <div>
          <label for="task-due" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Deadline / Due Date
          </label>
          <div class="relative">
            <input
              id="task-due"
              type="datetime-local"
              bind:value={due_date}
              class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>

        <!-- Category & List Dropdowns -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category Selector -->
          <div>
            <label for="task-cat" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              id="task-cat"
              bind:value={category_id}
              class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer shadow-2xs"
            >
              <option value={null}>Uncategorized</option>
              {#each categories as cat (cat.id)}
                <option value={cat.id}>{cat.name}</option>
              {/each}
            </select>
          </div>

          <!-- Task List Selector -->
          <div>
            <label for="task-list" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task List / Project
            </label>
            <select
              id="task-list"
              bind:value={list_id}
              class="w-full px-3.5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer shadow-2xs"
            >
              <option value={null}>No List (Standalone)</option>
              {#each taskLists as list (list.id)}
                <option value={list.id}>{list.name}</option>
              {/each}
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onclick={onClose}
            class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {#if isSubmitting}
              <div class="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            {:else}
              <span>{task ? 'Update Task' : 'Create Task'}</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
