<script lang="ts">
  import type { Task } from '../types';

  interface Props {
    isOpen: boolean;
    task: Task | null;
    onEdit: (task: Task) => void;
    onToggleStatus: (task: Task) => void;
    onDelete: (task: Task) => void;
    onClose: () => void;
  }

  let { isOpen, task, onEdit, onToggleStatus, onDelete, onClose }: Props = $props();

  function formatFullDate(isoString?: string | null): string {
    if (!isoString) return 'No date specified';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  }

  function getDueStatusText(isoString?: string | null, status?: string) {
    if (status === 'Completed') return { text: 'Completed', color: 'text-emerald-400' };
    if (!isoString) return { text: 'No due date', color: 'text-slate-400' };

    const dueTime = new Date(isoString).getTime();
    const now = Date.now();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      const daysOverdue = Math.ceil(Math.abs(diffHours) / 24);
      return {
        text: `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`,
        color: 'text-rose-400 font-bold'
      };
    } else if (diffHours < 24) {
      return {
        text: `Due in ${Math.round(diffHours)} hours`,
        color: 'text-amber-400 font-medium'
      };
    } else {
      const days = Math.round(diffHours / 24);
      return {
        text: `Due in ${days} day${days > 1 ? 's' : ''}`,
        color: 'text-slate-300'
      };
    }
  }
</script>

{#if isOpen && task}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header with Status & Priority -->
      <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Status Badge -->
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
            {task.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : ''}
            {task.status === 'In Progress' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' : ''}
            {task.status === 'Pending' ? 'bg-slate-800 text-slate-300 border border-slate-700' : ''}
            {task.status === 'Overdue' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : ''}"
          >
            {task.status}
          </span>

          <!-- Priority Badge -->
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
            {task.priority === 'Urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : ''}
            {task.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : ''}
            {task.priority === 'Medium' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : ''}
            {task.priority === 'Low' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : ''}"
          >
            {task.priority} Priority
          </span>
        </div>

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

      <!-- Task Title -->
      <div class="mt-4">
        <h2 class="text-xl font-bold text-white leading-snug {task.status === 'Completed' ? 'line-through text-slate-400' : ''}">
          {task.title}
        </h2>
      </div>

      <!-- Meta Info Row: Category & List -->
      <div class="mt-4 flex flex-wrap gap-2.5">
        {#if task.category}
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: {task.category.color};"></span>
            <span>Category: <strong>{task.category.name}</strong></span>
          </div>
        {:else}
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400">
            <span>Category: Unassigned</span>
          </div>
        {/if}

        {#if task.task_list}
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: {task.task_list.color};"></span>
            <span>List: <strong>{task.task_list.name}</strong></span>
          </div>
        {:else}
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400">
            <span>List: General Inbox</span>
          </div>
        {/if}
      </div>

      <!-- Due Date Section -->
      <div class="mt-4 p-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div>
            <div class="text-xs text-slate-400">Due Deadline</div>
            <div class="text-sm font-semibold text-slate-200">{formatFullDate(task.due_date)}</div>
          </div>
        </div>
        {#if task.due_date}
          {@const dueInfo = getDueStatusText(task.due_date, task.status)}
          <span class="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 {dueInfo.color}">
            {dueInfo.text}
          </span>
        {/if}
      </div>

      <!-- Description / Notes -->
      <div class="mt-4">
        <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description & Notes</h4>
        <div class="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl text-sm text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[70px]">
          {task.description || 'No description provided for this task.'}
        </div>
      </div>

      <!-- Timestamps -->
      <div class="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1.5">
        <div>Created: {formatFullDate(task.created_at)}</div>
        {#if task.completed_at}
          <div class="text-emerald-400/80">Completed: {formatFullDate(task.completed_at)}</div>
        {/if}
      </div>

      <!-- Actions Footer -->
      <div class="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          onclick={() => {
            onToggleStatus(task);
            onClose();
          }}
          class="px-4 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-2
          {task.status === 'Completed' 
            ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30' 
            : 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'}"
        >
          {#if task.status === 'Completed'}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Mark as Pending
          {:else}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Mark as Completed
          {/if}
        </button>

        <div class="flex items-center gap-2">
          <button
            onclick={() => {
              onDelete(task);
              onClose();
            }}
            class="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
            title="Delete task"
          >
            Delete
          </button>
          <button
            onclick={() => {
              onEdit(task);
              onClose();
            }}
            class="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-md shadow-blue-900/30 flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Task
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
