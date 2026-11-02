<script lang="ts">
  import { Database, X, Copy, Check, Server } from '@lucide/svelte';
  import { isConfigured } from '../supabase';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();
  let copied = $state(false);

  const SCHEMA_SQL = `-- TO-DO LIST MANAGEMENT SYSTEM - POSTGRESQL SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TASK LISTS (Organization)
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

-- 2. TASK CATEGORIES (Taxonomy)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT 'tag',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS (Management & CRUD)
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

-- RLS POLICIES & SECURITY
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public task_lists read" ON public.task_lists FOR SELECT USING (true);
CREATE POLICY "Public task_lists write" ON public.task_lists FOR ALL USING (true);

CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public categories write" ON public.categories FOR ALL USING (true);

CREATE POLICY "Public tasks read" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public tasks write" ON public.tasks FOR ALL USING (true);`;

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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
    <div 
      class="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] space-y-4"
      role="dialog"
      aria-modal="true"
    >
      <!-- Header -->
      <div class="flex items-start justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 class="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Database class="w-4 h-4" />
            </div>
            <span>Database Schema & Architecture</span>
          </h3>
          <p class="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Status:</span>
            {#if isConfigured}
              <span class="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Connected to Live Supabase Backend
              </span>
            {:else}
              <span class="inline-flex items-center gap-1 text-amber-700 font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Running in Local Demo Storage Mode
              </span>
            {/if}
          </p>
        </div>

        <button
          onclick={onClose}
          class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Quick Context Box -->
      <div class="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-xs text-blue-900 leading-relaxed">
        <strong>PostgreSQL Architecture Notes:</strong>
        <p class="mt-0.5 text-slate-600">
          The database utilizes foreign keys with <code class="bg-blue-100/60 text-blue-800 px-1 py-0.5 rounded text-[11px] font-mono">ON DELETE CASCADE</code> for Task Lists and <code class="bg-blue-100/60 text-blue-800 px-1 py-0.5 rounded text-[11px] font-mono">ON DELETE SET NULL</code> for Categories to prevent orphaned records.
        </p>
      </div>

      <!-- SQL Box -->
      <div class="relative flex-1 overflow-hidden border border-slate-200 rounded-2xl bg-slate-950 font-mono text-xs shadow-inner">
        <div class="flex items-center justify-between px-3.5 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
          <span class="text-[11px] font-semibold text-slate-300">supabase/schema.sql</span>
          <button
            onclick={handleCopy}
            class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {#if copied}
              <Check class="w-3.5 h-3.5 text-emerald-400" />
              <span class="text-emerald-400 font-bold">Copied!</span>
            {:else}
              <Copy class="w-3.5 h-3.5" />
              <span>Copy SQL</span>
            {/if}
          </button>
        </div>

        <pre class="p-4 overflow-y-auto max-h-[260px] text-slate-200 text-xs leading-relaxed"><code>{SCHEMA_SQL}</code></pre>
      </div>

      <!-- Footer -->
      <div class="pt-3 border-t border-slate-100 flex justify-end">
        <button
          onclick={onClose}
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
