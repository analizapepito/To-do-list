import { createClient } from '@supabase/supabase-js';
import type { Task, Category, TaskList, TaskStatus } from './types';

const defaultSupabaseUrl = 'https://your-project.supabase.co';
const defaultSupabaseKey = 'your-anon-key-here';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseKey;

// Determine if real Supabase credentials are configured
export const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== defaultSupabaseUrl &&
  !supabaseUrl.includes('your-project')
);

export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://dummy-url.supabase.co',
  isConfigured ? supabaseAnonKey : 'dummy-key'
);

// ---------------------------------------------------------------------------
// LocalStorage Fallback Seed Data (Ensures instantaneous out-of-the-box demo)
// ---------------------------------------------------------------------------

const LOCAL_STORAGE_KEY_TASKS = 'pepito_todo_tasks';
const LOCAL_STORAGE_KEY_CATEGORIES = 'pepito_todo_categories';
const LOCAL_STORAGE_KEY_LISTS = 'pepito_todo_lists';

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'Academics',
    color: '#6366f1',
    icon: 'graduation-cap',
    description: 'School coursework, exams, and individual project deliverables',
    created_at: new Date().toISOString()
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    name: 'Work',
    color: '#3b82f6',
    icon: 'briefcase',
    description: 'Professional assignments, coding tasks, and team coordination',
    created_at: new Date().toISOString()
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    name: 'Personal',
    color: '#ec4899',
    icon: 'user',
    description: 'Personal development, hobbies, and personal errands',
    created_at: new Date().toISOString()
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    name: 'Health & Fitness',
    color: '#10b981',
    icon: 'activity',
    description: 'Workouts, nutrition, sleep schedules, and medical checkups',
    created_at: new Date().toISOString()
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    name: 'Finance',
    color: '#f59e0b',
    icon: 'dollar-sign',
    description: 'Budgeting, bill payments, and financial tracking',
    created_at: new Date().toISOString()
  }
];

const INITIAL_LISTS: TaskList[] = [
  {
    id: 'l1000000-0000-0000-0000-000000000001',
    name: 'Semester Project Sprints',
    description: 'Deliverables and milestone tracking for individual final project submission',
    color: '#6366f1',
    icon: 'folder',
    target_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'l1000000-0000-0000-0000-000000000002',
    name: 'Daily Routine & Focus',
    description: 'High-priority daily habits, urgent errands, and quick actions',
    color: '#3b82f6',
    icon: 'sun',
    target_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'l1000000-0000-0000-0000-000000000003',
    name: 'Health & Wellness Habits',
    description: 'Weekly exercise routines and lifestyle optimization',
    color: '#10b981',
    icon: 'heart',
    target_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't1000000-0000-0000-0000-000000000001',
    title: 'Submit Svelte + Supabase Project Milestone',
    description: 'Review all CRUD operations, verify PostgreSQL schema migrations, and generate production documentation.',
    status: 'In Progress',
    priority: 'Urgent',
    due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
    category_id: 'c1000000-0000-0000-0000-000000000001',
    list_id: 'l1000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't1000000-0000-0000-0000-000000000002',
    title: 'Complete Task Category Management Module',
    description: 'Implement Category create, read, update, delete modal dialogs and color selectors.',
    status: 'Completed',
    priority: 'High',
    due_date: new Date(Date.now() - 1 * 86400000).toISOString(),
    category_id: 'c1000000-0000-0000-0000-000000000001',
    list_id: 'l1000000-0000-0000-0000-000000000001',
    completed_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't1000000-0000-0000-0000-000000000003',
    title: 'Review Database Relations & Foreign Keys',
    description: 'Ensure ON DELETE CASCADE for lists and ON DELETE SET NULL for categories works smoothly.',
    status: 'Completed',
    priority: 'Medium',
    due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    category_id: 'c1000000-0000-0000-0000-000000000001',
    list_id: 'l1000000-0000-0000-0000-000000000001',
    completed_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't1000000-0000-0000-0000-000000000004',
    title: 'Prepare Monthly Budget Report',
    description: 'Reconcile bank accounts, track subscription renewals, and log project hosting receipts.',
    status: 'Overdue',
    priority: 'High',
    due_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    category_id: 'c1000000-0000-0000-0000-000000000005',
    list_id: 'l1000000-0000-0000-0000-000000000002',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't1000000-0000-0000-0000-000000000005',
    title: 'Morning Cardio & Strength Training',
    description: '45-minute HIIT workout session followed by stretching and hydration tracking.',
    status: 'Pending',
    priority: 'Medium',
    due_date: new Date(Date.now() + 1 * 86400000).toISOString(),
    category_id: 'c1000000-0000-0000-0000-000000000004',
    list_id: 'l1000000-0000-0000-0000-000000000003',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't1000000-0000-0000-0000-000000000006',
    title: 'Configure Vercel Production Environment',
    description: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel deployment project settings.',
    status: 'Pending',
    priority: 'Urgent',
    due_date: new Date(Date.now() + 4 * 86400000).toISOString(),
    category_id: 'c1000000-0000-0000-0000-000000000002',
    list_id: 'l1000000-0000-0000-0000-000000000001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper to get local data
function getLocal<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initial;
  } catch {
    return initial;
  }
}

function setLocal<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving to localStorage key "${key}":`, err);
  }
}

// Ensure overdue calculation is accurate
export function checkAndNormalizeTaskStatus(task: Task): Task {
  if (task.status === 'Completed') return task;
  if (task.due_date) {
    const dueDate = new Date(task.due_date);
    if (!isNaN(dueDate.getTime()) && dueDate.getTime() < Date.now()) {
      return { ...task, status: 'Overdue' };
    }
  }
  return task;
}

// ---------------------------------------------------------------------------
// A. Task Category Management CRUD
// ---------------------------------------------------------------------------

export async function fetchCategories(): Promise<Category[]> {
  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data) {
        return data as Category[];
      }
    } catch (e) {
      console.warn('Supabase fetchCategories failed, falling back to local storage:', e);
    }
  }

  const local = getLocal<Category[]>(LOCAL_STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES)) {
    setLocal(LOCAL_STORAGE_KEY_CATEGORIES, local);
  }
  return local;
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  const newCat: Category = {
    ...category,
    id: crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCat.name, color: newCat.color, icon: newCat.icon, description: newCat.description }])
        .select()
        .single();
      if (!error && data) {
        return data as Category;
      }
    } catch (e) {
      console.warn('Supabase createCategory failed, writing locally:', e);
    }
  }

  const current = await fetchCategories();
  const updated = [...current, newCat];
  setLocal(LOCAL_STORAGE_KEY_CATEGORIES, updated);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        return data as Category;
      }
    } catch (e) {
      console.warn('Supabase updateCategory failed, writing locally:', e);
    }
  }

  const current = await fetchCategories();
  const index = current.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Category not found');
  const updatedItem = { ...current[index], ...updates };
  current[index] = updatedItem;
  setLocal(LOCAL_STORAGE_KEY_CATEGORIES, current);
  return updatedItem;
}

export async function deleteCategory(id: string): Promise<void> {
  if (isConfigured) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (!error) return;
    } catch (e) {
      console.warn('Supabase deleteCategory failed, updating locally:', e);
    }
  }

  const current = await fetchCategories();
  setLocal(LOCAL_STORAGE_KEY_CATEGORIES, current.filter((c) => c.id !== id));

  // Detach category from tasks locally
  const tasks = await fetchTasks();
  const updatedTasks = tasks.map((t) => (t.category_id === id ? { ...t, category_id: null } : t));
  setLocal(LOCAL_STORAGE_KEY_TASKS, updatedTasks);
}

// ---------------------------------------------------------------------------
// B. Task Organization Management CRUD (Task Lists)
// ---------------------------------------------------------------------------

export async function fetchTaskLists(): Promise<TaskList[]> {
  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('task_lists')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data as TaskList[];
      }
    } catch (e) {
      console.warn('Supabase fetchTaskLists failed, falling back to local storage:', e);
    }
  }

  const local = getLocal<TaskList[]>(LOCAL_STORAGE_KEY_LISTS, INITIAL_LISTS);
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_LISTS)) {
    setLocal(LOCAL_STORAGE_KEY_LISTS, local);
  }
  return local;
}

export async function createTaskList(list: Omit<TaskList, 'id' | 'created_at' | 'updated_at'>): Promise<TaskList> {
  const newList: TaskList = {
    ...list,
    id: crypto.randomUUID ? crypto.randomUUID() : `list-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('task_lists')
        .insert([{
          name: newList.name,
          description: newList.description,
          color: newList.color,
          icon: newList.icon,
          target_date: newList.target_date
        }])
        .select()
        .single();
      if (!error && data) {
        return data as TaskList;
      }
    } catch (e) {
      console.warn('Supabase createTaskList failed, writing locally:', e);
    }
  }

  const current = await fetchTaskLists();
  const updated = [newList, ...current];
  setLocal(LOCAL_STORAGE_KEY_LISTS, updated);
  return newList;
}

export async function updateTaskList(id: string, updates: Partial<TaskList>): Promise<TaskList> {
  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('task_lists')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) {
        return data as TaskList;
      }
    } catch (e) {
      console.warn('Supabase updateTaskList failed, writing locally:', e);
    }
  }

  const current = await fetchTaskLists();
  const index = current.findIndex((l) => l.id === id);
  if (index === -1) throw new Error('Task list not found');
  const updatedItem = { ...current[index], ...updates, updated_at: new Date().toISOString() };
  current[index] = updatedItem;
  setLocal(LOCAL_STORAGE_KEY_LISTS, current);
  return updatedItem;
}

export async function deleteTaskList(id: string): Promise<void> {
  if (isConfigured) {
    try {
      const { error } = await supabase.from('task_lists').delete().eq('id', id);
      if (!error) return;
    } catch (e) {
      console.warn('Supabase deleteTaskList failed, updating locally:', e);
    }
  }

  const current = await fetchTaskLists();
  setLocal(LOCAL_STORAGE_KEY_LISTS, current.filter((l) => l.id !== id));

  // Cascade delete associated tasks locally
  const tasks = await fetchTasks();
  const remainingTasks = tasks.filter((t) => t.list_id !== id);
  setLocal(LOCAL_STORAGE_KEY_TASKS, remainingTasks);
}

// ---------------------------------------------------------------------------
// C. Task Management CRUD
// ---------------------------------------------------------------------------

export async function fetchTasks(): Promise<Task[]> {
  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(*),
          task_list:task_lists(*)
        `)
        .order('created_at', { ascending: false });
      if (!error && data) {
        return (data as Task[]).map(checkAndNormalizeTaskStatus);
      }
    } catch (e) {
      console.warn('Supabase fetchTasks failed, falling back to local storage:', e);
    }
  }

  const local = getLocal<Task[]>(LOCAL_STORAGE_KEY_TASKS, INITIAL_TASKS);
  if (!localStorage.getItem(LOCAL_STORAGE_KEY_TASKS)) {
    setLocal(LOCAL_STORAGE_KEY_TASKS, local);
  }

  // Populate joined entities locally
  const categories = getLocal<Category[]>(LOCAL_STORAGE_KEY_CATEGORIES, INITIAL_CATEGORIES);
  const lists = getLocal<TaskList[]>(LOCAL_STORAGE_KEY_LISTS, INITIAL_LISTS);

  const populated = local.map((task) => {
    const normalized = checkAndNormalizeTaskStatus(task);
    return {
      ...normalized,
      category: categories.find((c) => c.id === task.category_id),
      task_list: lists.find((l) => l.id === task.list_id)
    };
  });

  return populated;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: task.status === 'Completed' ? new Date().toISOString() : null
  };

  const normalized = checkAndNormalizeTaskStatus(newTask);

  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: normalized.title,
          description: normalized.description,
          status: normalized.status,
          priority: normalized.priority,
          due_date: normalized.due_date,
          category_id: normalized.category_id,
          list_id: normalized.list_id,
          completed_at: normalized.completed_at
        }])
        .select(`
          *,
          category:categories(*),
          task_list:task_lists(*)
        `)
        .single();
      if (!error && data) {
        return checkAndNormalizeTaskStatus(data as Task);
      }
    } catch (e) {
      console.warn('Supabase createTask failed, writing locally:', e);
    }
  }

  const current = await fetchTasks();
  const updated = [normalized, ...current];
  setLocal(LOCAL_STORAGE_KEY_TASKS, updated);
  return normalized;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const payload: Partial<Task> = {
    ...updates,
    updated_at: new Date().toISOString()
  };

  if (updates.status === 'Completed' && !updates.completed_at) {
    payload.completed_at = new Date().toISOString();
  } else if (updates.status && updates.status !== 'Completed') {
    payload.completed_at = null;
  }

  if (isConfigured) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', id)
        .select(`
          *,
          category:categories(*),
          task_list:task_lists(*)
        `)
        .single();
      if (!error && data) {
        return checkAndNormalizeTaskStatus(data as Task);
      }
    } catch (e) {
      console.warn('Supabase updateTask failed, writing locally:', e);
    }
  }

  const current = await fetchTasks();
  const index = current.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Task not found');
  const updatedItem = checkAndNormalizeTaskStatus({ ...current[index], ...payload });
  current[index] = updatedItem;
  setLocal(LOCAL_STORAGE_KEY_TASKS, current);
  return updatedItem;
}

export async function deleteTask(id: string): Promise<void> {
  if (isConfigured) {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (!error) return;
    } catch (e) {
      console.warn('Supabase deleteTask failed, updating locally:', e);
    }
  }

  const current = await fetchTasks();
  setLocal(LOCAL_STORAGE_KEY_TASKS, current.filter((t) => t.id !== id));
}

export async function toggleTaskCompletion(task: Task): Promise<Task> {
  const isCurrentlyCompleted = task.status === 'Completed';
  let nextStatus: TaskStatus = 'Completed';

  if (isCurrentlyCompleted) {
    // Revert back to Pending or Overdue depending on due date
    if (task.due_date && new Date(task.due_date).getTime() < Date.now()) {
      nextStatus = 'Overdue';
    } else {
      nextStatus = 'Pending';
    }
  }

  return updateTask(task.id, {
    status: nextStatus,
    completed_at: nextStatus === 'Completed' ? new Date().toISOString() : null
  });
}

export async function batchDeleteCompletedTasks(): Promise<void> {
  if (isConfigured) {
    try {
      await supabase.from('tasks').delete().eq('status', 'Completed');
      return;
    } catch (e) {
      console.warn('Supabase batchDeleteCompletedTasks failed, deleting locally:', e);
    }
  }

  const current = await fetchTasks();
  setLocal(LOCAL_STORAGE_KEY_TASKS, current.filter((t) => t.status !== 'Completed'));
}
