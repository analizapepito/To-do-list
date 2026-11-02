export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string | null;
  created_at?: string;
  task_count?: number;
}

export interface TaskList {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  icon: string;
  target_date?: string | null;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
  total_tasks?: number;
  completed_tasks?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  category_id?: string | null;
  list_id?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  task_list?: TaskList;
}

export interface SystemStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
}
