<script lang="ts">
  import { isConfigured } from '../supabase';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();
  let copied = $state(false);

  const SCHEMA_SQL = `-- TO-DO LIST MANAGEMENT SYSTEM - POSTGRESQL SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TASK LISTS
CREATE TABLE public.task_lists (
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

-- 2. TASK CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT 'tag',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS
CREATE TABLE public.tasks (
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

-- RLS POLICIES & TRIGGERS
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to task_lists" ON public.task_lists FOR SELECT USING (true);
CREATE POLICY "Allow public insert to task_lists" ON public.task_lists FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to task_lists" ON public.task_lists FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to task_lists" ON public.task_lists FOR DELETE USING (true);

CREATE POLICY "Allow public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert to categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to categories" ON public.categories FOR DELETE USING (true);

CREATE POLICY "Allow public read access to tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert to tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to tasks" ON public.tasks FOR DELETE USING (true);`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SCHEMA_SQL);
      copied = true;
      setTimeout(() => (copied = false), 2500);
    } catch {
      // fallback
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-start justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            PostgreSQL Database Schema & Architecture
          </h3>
          <p class="text-xs text-slate-400 mt-1">
            Status: 
            {#if isConfigured}
              <span class="text-emerald-400 font-semibold">&bull; Connected to Live Supabase Backend</span>
            {:else}
              <span class="text-amber-400 font-semibold">&bull; Running in Local Demo Storage Mode (Ready to link Supabase)</span>
            {/if}
          </p>
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

      <!-- Quick Steps -->
      <div class="my-4 p-3.5 bg-blue-950/30 border border-blue-900/40 rounded-xl text-xs text-blue-200 leading-relaxed">
        <strong>Supabase Setup Instructions:</strong>
        <ol class="list-decimal list-inside mt-1 space-y-0.5 text-slate-300">
          <li>Create a project on <a href="https://supabase.com" target="_blank" rel="noreferrer" class="text-blue-400 underline">supabase.com</a>.</li>
          <li>Navigate to the <strong>SQL Editor</strong> and execute the schema script below.</li>
          <li>Add your project URL & Anon key to <code class="bg-slate-800 px-1 py-0.5 rounded text-blue-300">.env</code>.</li>
        </ol>
      </div>

      <!-- SQL Box -->
      <div class="relative flex-1 overflow-hidden border border-slate-800 rounded-xl bg-slate-950 font-mono text-xs">
        <div class="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
          <span>supabase/schema.sql</span>
          <button
            onclick={handleCopy}
            class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {#if copied}
              <span class="text-emerald-400 font-bold">&check; Copied!</span>
            {:else}
              <span>Copy SQL</span>
            {/if}
          </button>
        </div>

        <pre class="p-4 overflow-y-auto max-h-[300px] text-slate-300 leading-relaxed scrollbar-thin"><code>{SCHEMA_SQL}</code></pre>
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-3 border-t border-slate-800 flex justify-end">
        <button
          onclick={onClose}
          class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
