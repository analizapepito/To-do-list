<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Menu,
    CheckSquare,
    Plus
  } from '@lucide/svelte';
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

  import Sidebar from './lib/components/Sidebar.svelte';
  import RightMetricsRail from './lib/components/RightMetricsRail.svelte';

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

  // Navigation & Layout State
  let currentTab = $state<'dashboard' | 'tasks' | 'categories' | 'lists'>('dashboard');
  let isMobileOpen = $state(false);

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
      toasts.info(`Marked ${updated.status}: "${updated.title}"`);
    }
  }

  async function handleUpdateTaskStatus(task: Task, newStatus: TaskStatus) {
    const updated = await updateTask(task.id, {
      status: newStatus,
      completed_at: newStatus === 'Completed' ? new Date().toISOString() : null
    });
    tasks = tasks.map((t) => (t.id === updated.id ? updated : t));
    toasts.info(`Status updated to "${newStatus}"`);
  }

  function handleBatchDeleteCompletedPrompt() {
    const completedCount = tasks.filter((t) => t.status === 'Completed').length;
    if (completedCount === 0) {
      toasts.info('No completed tasks to clear.');
      return;
    }
    confirmTitle = 'Clear All Completed Tasks';
    confirmMessage = `Are you sure you want to delete all ${completedCount} completed tasks?`;
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

  function handleEditCategory(category: Category) {
    editingCategory = category;
    isCategoryModalOpen = true;
  }

  async function handleSaveCategory(catData: { name: string; color: string; icon: string; description: string }) {
    if (editingCategory) {
      const updated = await updateCategory(editingCategory.id, catData);
      categories = categories.map((c) => (c.id === updated.id ? updated : c));
      tasks = tasks.map((t) => {
        if (t.category_id === updated.id) {
          return { ...t, category: updated };
        }
        return t;
      });
      toasts.success(`Category "${updated.name}" updated`);
    } else {
      const created = await createCategory(catData);
      categories = [...categories, created];
      toasts.success(`Category "${created.name}" created`);
    }
  }

  function handleDeleteCategoryPrompt(category: Category) {
    const associatedTasksCount = tasks.filter((t) => t.category_id === category.id).length;
    confirmTitle = 'Delete Category';
    confirmMessage = `Are you sure you want to delete category "${category.name}"? ${
      associatedTasksCount > 0
        ? `Note: ${associatedTasksCount} tasks in this category will become uncategorized.`
        : ''
    }`;
    confirmIsDanger = true;
    confirmAction = async () => {
      await deleteCategory(category.id);
      categories = categories.filter((c) => c.id !== category.id);
      tasks = tasks.map((t) => (t.category_id === category.id ? { ...t, category_id: null, category: undefined } : t));
      if (selectedCategoryFilter === category.id) {
        selectedCategoryFilter = null;
      }
      toasts.success(`Category "${category.name}" deleted`);
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

  async function handleSaveList(listData: {
    name: string;
    description: string;
    color: string;
    icon: string;
    target_date?: string | null;
  }) {
    if (editingList) {
      const updated = await updateTaskList(editingList.id, listData);
      taskLists = taskLists.map((l) => (l.id === updated.id ? updated : l));
      tasks = tasks.map((t) => {
        if (t.list_id === updated.id) {
          return { ...t, task_list: updated };
        }
        return t;
      });
      toasts.success(`Task List "${updated.name}" updated`);
    } else {
      const created = await createTaskList(listData);
      taskLists = [...taskLists, created];
      toasts.success(`Task List "${created.name}" created`);
    }
  }

  function handleDeleteListPrompt(list: TaskList) {
    const listTasksCount = tasks.filter((t) => t.list_id === list.id).length;
    confirmTitle = 'Delete Task List';
    confirmMessage = `Are you sure you want to delete list "${list.name}"? ${
      listTasksCount > 0
        ? `Warning: ${listTasksCount} associated tasks will also be removed (Cascade Delete).`
        : ''
    }`;
    confirmIsDanger = true;
    confirmAction = async () => {
      await deleteTaskList(list.id);
      taskLists = taskLists.filter((l) => l.id !== list.id);
      tasks = tasks.filter((t) => t.list_id !== list.id);
      if (selectedListFilter === list.id) {
        selectedListFilter = null;
      }
      toasts.success(`Task List "${list.name}" deleted`);
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
</script>

<div class="min-h-screen bg-slate-50/70 text-slate-800 flex relative selection:bg-blue-600 selection:text-white">
  <!-- Subtle Ambient Glass Backdrops -->
  <div class="fixed -top-40 -left-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
  <div class="fixed top-1/3 -right-20 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none"></div>
  <div class="fixed -bottom-40 left-1/3 w-96 h-96 bg-sky-100/35 rounded-full blur-3xl pointer-events-none"></div>

  <!-- 1. LEFT SIDE NAVIGATION -->
  <Sidebar
    {currentTab}
    tasksCount={tasks.length}
    categoriesCount={categories.length}
    listsCount={taskLists.length}
    {isConfigured}
    {isMobileOpen}
    onSelectTab={(tab) => currentTab = tab}
    onOpenNewTask={() => openNewTaskModal()}
    onOpenSchema={() => isSchemaModalOpen = true}
    onCloseMobile={() => isMobileOpen = false}
  />

  <!-- 2. CENTER WORKSPACE (Breathable & Clean) -->
  <div class="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
    <!-- Mobile Top Navigation Header -->
    <header class="lg:hidden sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
      <div class="flex items-center gap-2.5">
        <button
          onclick={() => isMobileOpen = true}
          class="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-2xs"
          aria-label="Open menu"
        >
          <Menu class="w-5 h-5" />
        </button>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <CheckSquare class="w-4 h-4" />
          </div>
          <span class="font-extrabold text-sm text-slate-900">To-Do System</span>
        </div>
      </div>

      <button
        onclick={() => openNewTaskModal()}
        class="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Task</span>
      </button>
    </header>

    <!-- Main Views Container -->
    <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto">
      {#if isLoading}
        <div class="flex flex-col items-center justify-center py-24 gap-3">
          <div class="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p class="text-xs text-slate-500 font-medium">Loading To-Do System data...</p>
        </div>
      {:else}
        {#if currentTab === 'dashboard'}
          <DashboardView
            {tasks}
            {categories}
            {taskLists}
            onNavigate={(tab) => currentTab = tab}
            onFilterList={handleViewListTasks}
            onFilterCategory={handleViewCategoryTasks}
            onOpenNewTaskModal={openNewTaskModal}
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

    <!-- Clean Breathable Footer -->
    <footer class="mt-auto border-t border-slate-200/70 bg-white/50 py-5 text-xs text-slate-500">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <strong class="text-slate-700">TO-DO LIST MANAGEMENT SYSTEM</strong> &bull; Individual Project
        </div>
        <div class="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
          <span>Svelte 5</span>
          <span>&bull;</span>
          <span>Supabase</span>
          <span>&bull;</span>
          <span>PostgreSQL</span>
          <span>&bull;</span>
          <span>Vercel</span>
        </div>
      </div>
    </footer>
  </div>

  <!-- 3. RIGHT SIDE ORGANIZED METRICS RAIL -->
  <RightMetricsRail
    {tasks}
    {categories}
    {taskLists}
    onFilterList={handleViewListTasks}
    onFilterCategory={handleViewCategoryTasks}
  />

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
