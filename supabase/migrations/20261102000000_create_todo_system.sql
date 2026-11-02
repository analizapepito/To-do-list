-- ========================================================================
-- TO-DO LIST MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Technology Stack: PostgreSQL + Supabase
-- Modules: Task Management, Category Management, Task Organization
-- ========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------
-- 1. TASK LISTS (Task Organization Management)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'folder',
  target_date DATE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_lists_created_at ON public.task_lists(created_at DESC);

-- ------------------------------------------------------------------------
-- 2. TASK CATEGORIES (Category Management)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT 'tag',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- ------------------------------------------------------------------------
-- 3. TASKS (Task Management & CRUD)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' 
    CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Overdue')),
  priority TEXT NOT NULL DEFAULT 'Medium' 
    CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  due_date TIMESTAMPTZ,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  list_id UUID REFERENCES public.task_lists(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON public.tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON public.tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);

-- ------------------------------------------------------------------------
-- 4. AUTOMATIC TIMESTAMP TRIGGER
-- ------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_task_lists_updated_at ON public.task_lists;
CREATE TRIGGER set_task_lists_updated_at
  BEFORE UPDATE ON public.task_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_lists' AND policyname = 'Allow public read access to task_lists') THEN
    CREATE POLICY "Allow public read access to task_lists" ON public.task_lists FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_lists' AND policyname = 'Allow public insert to task_lists') THEN
    CREATE POLICY "Allow public insert to task_lists" ON public.task_lists FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_lists' AND policyname = 'Allow public update to task_lists') THEN
    CREATE POLICY "Allow public update to task_lists" ON public.task_lists FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'task_lists' AND policyname = 'Allow public delete to task_lists') THEN
    CREATE POLICY "Allow public delete to task_lists" ON public.task_lists FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public read access to categories') THEN
    CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public insert to categories') THEN
    CREATE POLICY "Allow public insert to categories" ON public.categories FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public update to categories') THEN
    CREATE POLICY "Allow public update to categories" ON public.categories FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Allow public delete to categories') THEN
    CREATE POLICY "Allow public delete to categories" ON public.categories FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Allow public read access to tasks') THEN
    CREATE POLICY "Allow public read access to tasks" ON public.tasks FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Allow public insert to tasks') THEN
    CREATE POLICY "Allow public insert to tasks" ON public.tasks FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Allow public update to tasks') THEN
    CREATE POLICY "Allow public update to tasks" ON public.tasks FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Allow public delete to tasks') THEN
    CREATE POLICY "Allow public delete to tasks" ON public.tasks FOR DELETE USING (true);
  END IF;
END $$;

-- ------------------------------------------------------------------------
-- 6. INITIAL SEED DATA
-- ------------------------------------------------------------------------
INSERT INTO public.categories (id, name, color, icon, description) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Academics', '#6366f1', 'graduation-cap', 'School coursework, exams, and individual project deliverables'),
  ('c1000000-0000-0000-0000-000000000002', 'Work', '#3b82f6', 'briefcase', 'Professional assignments, coding tasks, and team coordination'),
  ('c1000000-0000-0000-0000-000000000003', 'Personal', '#ec4899', 'user', 'Personal development, hobbies, and personal errands'),
  ('c1000000-0000-0000-0000-000000000004', 'Health & Fitness', '#10b981', 'activity', 'Workouts, nutrition, sleep schedules, and medical checkups'),
  ('c1000000-0000-0000-0000-000000000005', 'Finance', '#f59e0b', 'dollar-sign', 'Budgeting, bill payments, and financial tracking')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.task_lists (id, name, description, color, icon, target_date) VALUES
  ('l1000000-0000-0000-0000-000000000001', 'Semester Project Sprints', 'Deliverables and milestone tracking for individual final project submission', '#6366f1', 'folder', CURRENT_DATE + INTERVAL '14 days'),
  ('l1000000-0000-0000-0000-000000000002', 'Daily Routine & Focus', 'High-priority daily habits, urgent errands, and quick actions', '#3b82f6', 'sun', CURRENT_DATE + INTERVAL '1 day'),
  ('l1000000-0000-0000-0000-000000000003', 'Health & Wellness Habits', 'Weekly exercise routines and lifestyle optimization', '#10b981', 'heart', CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tasks (id, title, description, status, priority, due_date, category_id, list_id, completed_at) VALUES
  (
    't1000000-0000-0000-0000-000000000001',
    'Submit Svelte + Supabase Project Milestone',
    'Review all CRUD operations, verify PostgreSQL schema migrations, and generate production documentation.',
    'In Progress',
    'Urgent',
    NOW() + INTERVAL '2 days',
    'c1000000-0000-0000-0000-000000000001',
    'l1000000-0000-0000-0000-000000000001',
    NULL
  ),
  (
    't1000000-0000-0000-0000-000000000002',
    'Complete Task Category Management Module',
    'Implement Category create, read, update, delete modal dialogs and color selectors.',
    'Completed',
    'High',
    NOW() - INTERVAL '1 day',
    'c1000000-0000-0000-0000-000000000001',
    'l1000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '6 hours'
  ),
  (
    't1000000-0000-0000-0000-000000000003',
    'Review Database Relations & Foreign Keys',
    'Ensure ON DELETE CASCADE for lists and ON DELETE SET NULL for categories works smoothly.',
    'Completed',
    'Medium',
    NOW() - INTERVAL '2 days',
    'c1000000-0000-0000-0000-000000000001',
    'l1000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 day'
  ),
  (
    't1000000-0000-0000-0000-000000000004',
    'Prepare Monthly Budget Report',
    'Reconcile bank accounts, track subscription renewals, and log project hosting receipts.',
    'Overdue',
    'High',
    NOW() - INTERVAL '3 days',
    'c1000000-0000-0000-0000-000000000005',
    'l1000000-0000-0000-0000-000000000002',
    NULL
  ),
  (
    't1000000-0000-0000-0000-000000000005',
    'Morning Cardio & Strength Training',
    '45-minute HIIT workout session followed by stretching and hydration tracking.',
    'Pending',
    'Medium',
    NOW() + INTERVAL '1 day',
    'c1000000-0000-0000-0000-000000000004',
    'l1000000-0000-0000-0000-000000000003',
    NULL
  ),
  (
    't1000000-0000-0000-0000-000000000006',
    'Configure Vercel Production Environment',
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Vercel deployment project settings.',
    'Pending',
    'Urgent',
    NOW() + INTERVAL '4 days',
    'c1000000-0000-0000-0000-000000000002',
    'l1000000-0000-0000-0000-000000000001',
    NULL
  )
ON CONFLICT (id) DO NOTHING;
