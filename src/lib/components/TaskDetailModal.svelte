<script lang="ts">
  import {
    CheckSquare,
    X,
    Edit3,
    Trash2,
    Check,
    Calendar,
    Clock,
    Layers,
    Tag,
    AlertCircle,
    CheckCircle2,
    RefreshCw
  } from '@lucide/svelte';
  import type { Task } from '../types';
  import CategoryIcon from './CategoryIcon.svelte';

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
    if (status === 'Completed') return { text: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (!isoString) return { text: 'No due date', color: 'text-slate-600 bg-slate-100 border-slate-200' };

    const dueTime = new Date(isoString).getTime();
    const now = Date.now();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      const daysOverdue = Math.ceil(Math.abs(diffHours) / 24);
      return {
        text: `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`,
        color: 'text-rose-700 bg-rose-50 border-rose-200 font-bold'
      };
    } else if (diffHours < 24) {
      return {
        text: `Due in ${Math.round(diffHours)} hours`,
        color: 'text-amber-700 bg-amber-50 border-amber-200 font-medium'
      };
    } else {
      const days = Math.round(diffHours / 24);
      return {
        text: `Due in ${days} day${days > 1 ? 's' : ''}`,
        color: 'text-slate-700 bg-slate-100 border-slate-200'
      };
    }
  }
</script>

{#if isOpen && task}
  {@const dueInfo = getDueStatusText(task.due_date, task.status)}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh] space-y-6"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <!-- Status Badge -->
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold border {task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : task.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'}">
              {task.status}
            </span>

            <!-- Priority Badge -->
            <span class="px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase border {task.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' : task.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' : task.priority === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}">
              {task.priority} Priority
            </span>
          </div>

          <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 pt-1 {task.status === 'Completed' ? 'line-through text-slate-400' : ''}">
            {task.title}
          </h3>
        </div>

        <button
          onclick={onClose}
          class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Description Body -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Description & Notes</h4>
        <div class="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {task.description || 'No description provided for this task.'}
        </div>
      </div>

      <!-- Metadata Bento Grid -->
      <div class="grid grid-cols-2 gap-3">
        <!-- Category -->
        <div class="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-1">
          <div class="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Tag class="w-3.5 h-3.5" />
            <span>Category</span>
          </div>
          {#if task.category}
            <div class="flex items-center gap-2 pt-0.5">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: {task.category.color};"></span>
              <span class="text-xs font-bold text-slate-800">{task.category.name}</span>
            </div>
          {:else}
            <p class="text-xs text-slate-500 font-medium">Uncategorized</p>
          {/if}
        </div>

        <!-- Task List -->
        <div class="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-1">
          <div class="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Layers class="w-3.5 h-3.5" />
            <span>Task List</span>
          </div>
          {#if task.task_list}
            <p class="text-xs font-bold text-slate-800 truncate pt-0.5">{task.task_list.name}</p>
          {:else}
            <p class="text-xs text-slate-500 font-medium">No List Assigned</p>
          {/if}
        </div>

        <!-- Due Date -->
        <div class="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-1 col-span-2">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <div class="flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5" />
              <span>Deadline</span>
            </div>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold border {dueInfo.color}">
              {dueInfo.text}
            </span>
          </div>
          <p class="text-xs font-bold text-slate-800 pt-0.5">
            {formatFullDate(task.due_date)}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          onclick={() => onDelete(task)}
          class="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 class="w-4 h-4" />
          <span>Delete</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            onclick={() => onToggleStatus(task)}
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-colors border flex items-center gap-1.5 cursor-pointer {task.status === 'Completed' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'}"
          >
            <Check class="w-4 h-4 stroke-[2.5]" />
            <span>{task.status === 'Completed' ? 'Mark Incomplete' : 'Complete Task'}</span>
          </button>

          <button
            onclick={() => onEdit(task)}
            class="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 class="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
