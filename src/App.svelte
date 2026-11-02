<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    batchDeleteCompletedTasks,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchTaskLists,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    isConfigured
  } from './lib/supabase';
  import type { Task, Category, TaskList, TaskStatus, TaskPriority } from './lib/types';
  import { toasts } from './lib/toast';

  import Toast from './lib/components/Toast.svelte';
  import ConfirmModal from './lib/components/ConfirmModal.svelte';
  import SchemaModal from './lib/components/SchemaModal.svelte';
  import TaskModal from './lib/components/TaskModal.svelte';
  import CategoryModal from './lib/components/CategoryModal.svelte';
  import ListModal from './lib/components/ListModal.svelte';
  import TaskDetailModal from './lib/components/TaskDetailModal.svelte';

  import DashboardView from './lib/components/DashboardView.svelte';
  import TasksView from './lib/components/TasksView.svelte';
  import CategoriesView from './lib/components/CategoriesView.svelte';
  import ListsView from './lib/components/ListsView.svelte';

  // Navigation State
  let currentTab = $state<'dashboard' | 'tasks' | 'categories' | 'lists'>('dashboard');

  // Main Entity State
  let tasks = $state<Task[]>([]);
  let categories = $state<Category[]>([]);
  let taskLists = $state<TaskList[]>([]);
  let isLoading = $state(true);

  // Filter pass-through state
  let selectedCategoryFilter = $state<string | null>(null);
  let selectedListFilter = $state<string | null>(null);

  // Modals Visibility
  let isTaskModalOpen = $state(false);
  let editingTask = $state<Task | null>(null);
  let taskModalDefaultListId = $state<string | null>(null);
  let taskModalDefaultCategoryId = $state<string | null>(null);

  let isDetailModalOpen = $state(false);
  let selectedDetailTask = $state<Task | null>(null);

  let isCategoryModalOpen = $state(false);
  let editingCategory = $state<Category | null>(null);

  let isListModalOpen = $state(false);
  let editingList = $state<TaskList | null>(null);

  let isSchemaModalOpen = $state(false);

  // Confirmation Modal State
  let isConfirmModalOpen = $state(false);
  let confirmTitle = $state('');
  let confirmMessage = $state('');
  let confirmAction = $state<() => Promise<void>>(() => Promise.resolve());
  let confirmIsDanger = $state(true);

  // Load all system data
  async function loadData() {
    try {
      isLoading = true;
      const [fetchedCats, fetchedLists, fetchedTasks] = await Promise.all([
        fetchCategories(),
        fetchTaskLists(),
        fetchTasks()
      ]);
      categories = fetchedCats;
      taskLists = fetchedLists;
      tasks = fetchedTasks;
    } catch (err: any) {
      toasts.error('Failed to load data: ' + (err?.message || 'Unknown error'));
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadData();
  });

  // ---------------------------------------------------------------------------
  // A. TASK CRUD HANDLERS
  // ---------------------------------------------------------------------------

  function openNewTaskModal(opts?: { listId?: string; categoryId?: string }) {
    editingTask = null;
    taskModalDefaultListId = opts?.listId || null;
    taskModalDefaultCategoryId = opts?.categoryId || null;
    isTaskModalOpen = true;
  }

  function handleEditTask(task: Task) {
    editingTask = task;
    isTaskModalOpen = true;
  }

  async function handleSaveTask(taskData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string | null;
    category_id: string | null;
    list_id: string | null;
  }) {
    if (editingTask) {
      const updated = await updateTask(editingTask.id, taskData);
      tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
      toasts.success(`Task "${updated.title}" updated`);
    } else {
      const created = await createTask(taskData);
      tasks = [created, ...tasks];
      toasts.success(`Task "${created.title}" created`);
    }
  }

  function handleDeleteTaskPrompt(task: Task) {
    confirmTitle = 'Delete Task';
    confirmMessage = `Are you sure you want to permanently delete task "${task.title}"?`;
    confirmIsDanger = true;
    confirmAction = async () => {
      await deleteTask(task.id);
      tasks = tasks.filter((t) => t.id !== task.id);
      toasts.success('Task deleted successfully');
      isConfirmModalOpen = false;
    };
    isConfirmModalOpen = true;
  }

  async function handleToggleTaskStatus(task: Task) {
    const updated = await toggleTaskCompletion(task);
    tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
    if (updated.status === 'Completed') {
      toasts.success(`Completed: "${updated.title}"`);
    } else {
      toasts.info(`Reopened: "${updated.title}"`);
    }
  }

  async function handleUpdateTaskStatus(task: Task, newStatus: TaskStatus) {
    const updated = await updateTask(task.id, { status: newStatus });
    tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
    toasts.info(`Status updated to "${newStatus}"`);
  }

  function handleBatchDeleteCompletedPrompt() {
    const completedCount = tasks.filter((t) => t.status === 'Completed').length;
    if (completedCount === 0) return;

    confirmTitle = 'Clear Completed Tasks';
    confirmMessage = `Are you sure you want to remove all ${completedCount} completed task(s)?`;
    confirmIsDanger = true;
    confirmAction = async () => {
      await batchDeleteCompletedTasks();
      tasks = tasks.filter((t) => t.status !== 'Completed');
      toasts.success(`Cleared ${completedCount} completed tasks`);
      isConfirmModalOpen = false;
    };
    isConfirmModalOpen = true;
  }

  function handleSelectTask(task: Task) {
    selectedDetailTask = task;
    isDetailModalOpen = true;
  }

  // ---------------------------------------------------------------------------
  // B. CATEGORY CRUD HANDLERS
  // ---------------------------------------------------------------------------

  function openNewCategoryModal() {
    editingCategory = null;
    isCategoryModalOpen = true;
  }

  function handleEditCategory(cat: Category) {
    editingCategory = cat;
    isCategoryModalOpen = true;
  }

  async function handleSaveCategory(catData: { name: string; color: string; icon: string; description: string }) {
    if (editingCategory) {
      const updated = await updateCategory(editingCategory.id, catData);
      categories = categories.map((c) => (c.id === updated.id ? updated : c));
      tasks = tasks.map((t) => (t.category_id === updated.id ? { ...t, category: updated } : t));
      toasts.success(`Category "${updated.name}" updated`);
    } else {
      const created = await createCategory(catData);
      categories = [...categories, created];
      toasts.success(`Category "${created.name}" created`);
    }
  }

  function handleDeleteCategoryPrompt(cat: Category) {
    confirmTitle = 'Delete Category';
    confirmMessage = `Are you sure you want to delete category "${cat.name}"? Tasks assigned to this category will be preserved as Uncategorized.`;
    confirmIsDanger = true;
    confirmAction = async () => {
      await deleteCategory(cat.id);
      categories = categories.filter((c) => c.id !== cat.id);
      tasks = tasks.map((t) => (t.category_id === cat.id ? { ...t, category_id: null, category: undefined } : t));
      if (selectedCategoryFilter === cat.id) selectedCategoryFilter = null;
      toasts.success(`Category "${cat.name}" removed`);
      isConfirmModalOpen = false;
    };
    isConfirmModalOpen = true;
  }

  function handleViewCategoryTasks(categoryId: string) {
    selectedCategoryFilter = categoryId;
    currentTab = 'tasks';
  }

  // ---------------------------------------------------------------------------
  // C. TASK LIST CRUD HANDLERS
  // ---------------------------------------------------------------------------

  function openNewListModal() {
    editingList = null;
    isListModalOpen = true;
  }

  function handleEditList(list: TaskList) {
    editingList = list;
    isListModalOpen = true;
  }

  async function handleSaveList(listData: { name: string; description: string; color: string; icon: string; target_date?: string | null }) {
    if (editingList) {
      const updated = await updateTaskList(editingList.id, listData);
      taskLists = taskLists.map((l) => (l.id === updated.id ? updated : l));
      tasks = tasks.map((t) => (t.list_id === updated.id ? { ...t, task_list: updated } : t));
      toasts.success(`Task list "${updated.name}" updated`);
    } else {
      const created = await createTaskList(listData);
      taskLists = [created, ...taskLists];
      toasts.success(`Task list "${created.name}" created`);
    }
  }

  function handleDeleteListPrompt(list: TaskList) {
    confirmTitle = 'Delete Task List';
    confirmMessage = `Are you sure you want to delete "${list.name}"? All associated tasks inside this list will also be removed.`;
    confirmIsDanger = true;
    confirmAction = async () => {
      await deleteTaskList(list.id);
      taskLists = taskLists.filter((l) => l.id !== list.id);
      tasks = tasks.filter((t) => t.list_id !== list.id);
      if (selectedListFilter === list.id) selectedListFilter = null;
      toasts.success(`Task list "${list.name}" and associated tasks deleted`);
      isConfirmModalOpen = false;
    };
    isConfirmModalOpen = true;
  }

  function handleViewListTasks(listId: string) {
    selectedListFilter = listId;
    currentTab = 'tasks';
  }

  function handleOpenNewTaskForList(listId: string) {
    openNewTaskModal({ listId });
  }

  // Derived counts for navigation pills
  let pendingCount = $derived(tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length);
  let overdueCount = $derived(tasks.filter((t) => t.status === 'Overdue').length);
</script>

<div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
  <!-- Top Navigation Header -->
  <header class="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-4">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect width="18" height="18" x="3" y="3" rx="2" stroke-width="2"/>
              <path d="m9 12 2 2 4-4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div>
            <div class="text-sm font-black tracking-tight text-white flex items-center gap-2">
              <span>TO-DO LIST MANAGEMENT SYSTEM</span>
              <span class="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Individual Project
              </span>
            </div>
            <div class="text-[11px] text-slate-400 flex items-center gap-2">
              <span class="font-medium text-slate-300">Svelte</span>
              <span>&bull;</span>
              <span class="font-medium text-slate-300">Supabase</span>
              <span>&bull;</span>
              <span class="font-medium text-slate-300">PostgreSQL</span>
              <span>&bull;</span>
              <span class="font-medium text-slate-300">Vercel</span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="hidden md:flex items-center gap-1">
          <button
            onclick={() => currentTab = 'dashboard'}
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer
            {currentTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>

          <button
            onclick={() => currentTab = 'tasks'}
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer
            {currentTab === 'tasks' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Tasks
            {#if overdueCount > 0}
              <span class="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono animate-pulse">
                {overdueCount}
              </span>
            {:else if pendingCount > 0}
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                {pendingCount}
              </span>
            {/if}
          </button>

          <button
            onclick={() => currentTab = 'categories'}
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer
            {currentTab === 'categories' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Categories
            <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
              {categories.length}
            </span>
          </button>

          <button
            onclick={() => currentTab = 'lists'}
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer
            {currentTab === 'lists' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Task Lists
            <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
              {taskLists.length}
            </span>
          </button>
        </nav>

        <!-- Right Side: DB Schema & Status -->
        <div class="flex items-center gap-2.5">
          <button
            onclick={() => isSchemaModalOpen = true}
            class="px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Inspect Database Schema and Supabase Backend"
          >
            <span class="w-2 h-2 rounded-full {isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
            <span class="hidden sm:inline">Database & Architecture</span>
            <span class="sm:hidden">DB</span>
          </button>

          <button
            onclick={() => openNewTaskModal()}
            class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/30 flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      <!-- Mobile Tab Bar -->
      <div class="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs font-semibold">
        <button
          onclick={() => currentTab = 'dashboard'}
          class="px-2.5 py-1 rounded-lg transition-colors {currentTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'}"
        >
          Dashboard
        </button>
        <button
          onclick={() => currentTab = 'tasks'}
          class="px-2.5 py-1 rounded-lg transition-colors {currentTab === 'tasks' ? 'text-blue-400 font-bold' : 'text-slate-400'}"
        >
          Tasks ({tasks.length})
        </button>
        <button
          onclick={() => currentTab = 'categories'}
          class="px-2.5 py-1 rounded-lg transition-colors {currentTab === 'categories' ? 'text-blue-400 font-bold' : 'text-slate-400'}"
        >
          Categories ({categories.length})
        </button>
        <button
          onclick={() => currentTab = 'lists'}
          class="px-2.5 py-1 rounded-lg transition-colors {currentTab === 'lists' ? 'text-blue-400 font-bold' : 'text-slate-400'}"
        >
          Lists ({taskLists.length})
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if isLoading}
      <div class="flex flex-col items-center justify-center py-24 gap-3">
        <div class="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p class="text-xs text-slate-400 font-medium">Loading To-Do System data...</p>
      </div>
    {:else}
      {#if currentTab === 'dashboard'}
        <DashboardView
          {tasks}
          {categories}
          {taskLists}
          onNavigate={(tab) => currentTab = tab}
          onFilterList={(listId) => {
            selectedListFilter = listId;
            currentTab = 'tasks';
          }}
          onFilterCategory={(catId) => {
            selectedCategoryFilter = catId;
            currentTab = 'tasks';
          }}
          onOpenNewTaskModal={() => openNewTaskModal()}
          onSelectTask={handleSelectTask}
          onToggleTaskStatus={handleToggleTaskStatus}
        />
      {:else if currentTab === 'tasks'}
        <TasksView
          {tasks}
          {categories}
          {taskLists}
          bind:selectedCategoryFilter
          bind:selectedListFilter
          onOpenNewTaskModal={openNewTaskModal}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTaskPrompt}
          onToggleTaskStatus={handleToggleTaskStatus}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onBatchDeleteCompleted={handleBatchDeleteCompletedPrompt}
          onSelectTask={handleSelectTask}
        />
      {:else if currentTab === 'categories'}
        <CategoriesView
          {categories}
          {tasks}
          onOpenNewCategoryModal={openNewCategoryModal}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategoryPrompt}
          onViewCategoryTasks={handleViewCategoryTasks}
        />
      {:else if currentTab === 'lists'}
        <ListsView
          {taskLists}
          {tasks}
          onOpenNewListModal={openNewListModal}
          onEditList={handleEditList}
          onDeleteList={handleDeleteListPrompt}
          onViewListTasks={handleViewListTasks}
          onOpenNewTaskForList={handleOpenNewTaskForList}
        />
      {/if}
    {/if}
  </main>

  <!-- Footer -->
  <footer class="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div>
        <strong class="text-slate-400">TO-DO LIST MANAGEMENT SYSTEM</strong> &bull; Individual Project
      </div>
      <div class="flex items-center gap-4">
        <span>Svelte Frontend</span>
        <span>&bull;</span>
        <span>Supabase Backend</span>
        <span>&bull;</span>
        <span>PostgreSQL</span>
        <span>&bull;</span>
        <span>Vercel Edge Ready</span>
      </div>
    </div>
  </footer>

  <!-- Modals -->
  <TaskModal
    isOpen={isTaskModalOpen}
    task={editingTask}
    {categories}
    {taskLists}
    defaultListId={taskModalDefaultListId}
    defaultCategoryId={taskModalDefaultCategoryId}
    onSave={handleSaveTask}
    onClose={() => isTaskModalOpen = false}
  />

  <TaskDetailModal
    isOpen={isDetailModalOpen}
    task={selectedDetailTask}
    onEdit={(t) => {
      isDetailModalOpen = false;
      handleEditTask(t);
    }}
    onToggleStatus={handleToggleTaskStatus}
    onDelete={(t) => {
      isDetailModalOpen = false;
      handleDeleteTaskPrompt(t);
    }}
    onClose={() => isDetailModalOpen = false}
  />

  <CategoryModal
    isOpen={isCategoryModalOpen}
    category={editingCategory}
    onSave={handleSaveCategory}
    onClose={() => isCategoryModalOpen = false}
  />

  <ListModal
    isOpen={isListModalOpen}
    list={editingList}
    onSave={handleSaveList}
    onClose={() => isListModalOpen = false}
  />

  <SchemaModal
    isOpen={isSchemaModalOpen}
    onClose={() => isSchemaModalOpen = false}
  />

  <ConfirmModal
    isOpen={isConfirmModalOpen}
    title={confirmTitle}
    message={confirmMessage}
    isDanger={confirmIsDanger}
    onConfirm={confirmAction}
    onCancel={() => isConfirmModalOpen = false}
  />

  <Toast />
</div>
