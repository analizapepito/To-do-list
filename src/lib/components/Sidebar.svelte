<script lang="ts">
  import {
    LayoutDashboard,
    CheckSquare,
    Tags,
    Layers,
    Plus,
    Database,
    ExternalLink,
    Sparkles,
    ShieldCheck,
    X
  } from '@lucide/svelte';

  interface Props {
    currentTab: 'dashboard' | 'tasks' | 'categories' | 'lists';
    tasksCount: number;
    categoriesCount: number;
    listsCount: number;
    isConfigured: boolean;
    isMobileOpen?: boolean;
    onSelectTab: (tab: 'dashboard' | 'tasks' | 'categories' | 'lists') => void;
    onOpenNewTask: () => void;
    onOpenSchema: () => void;
    onCloseMobile?: () => void;
  }

  let {
    currentTab,
    tasksCount,
    categoriesCount,
    listsCount,
    isConfigured,
    isMobileOpen = false,
    onSelectTab,
    onOpenNewTask,
    onOpenSchema,
    onCloseMobile
  }: Props = $props();
</script>

<!-- Mobile Overlay Backdrop -->
{#if isMobileOpen}
  <button
    type="button"
    class="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden cursor-default transition-opacity"
    onclick={onCloseMobile}
    aria-label="Close menu overlay"
  ></button>
{/if}

<!-- Sidebar Container -->
<aside
  class="fixed inset-y-0 left-0 z-50 w-72 bg-white/85 backdrop-blur-2xl border-r border-slate-200/80 shadow-lg lg:shadow-none flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 {isMobileOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <!-- Top Branding & Navigation -->
  <div class="p-6 space-y-6 flex-1 overflow-y-auto">
    <!-- Brand Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
          <CheckSquare class="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 class="text-sm font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            To-Do System
          </h1>
          <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            Individual Project
          </span>
        </div>
      </div>

      <!-- Mobile Close Button -->
      {#if onCloseMobile}
        <button
          onclick={onCloseMobile}
          class="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close navigation"
        >
          <X class="w-5 h-5" />
        </button>
      {/if}
    </div>

    <!-- Quick Primary Action Button -->
    <button
      onclick={() => {
        onOpenNewTask();
        if (onCloseMobile) onCloseMobile();
      }}
      class="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-xs tracking-wide shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
    >
      <Plus class="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      <span>Add New Task</span>
    </button>

    <!-- Navigation Section -->
    <nav class="space-y-1.5">
      <p class="px-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">Menu</p>

      <button
        onclick={() => {
          onSelectTab('dashboard');
          if (onCloseMobile) onCloseMobile();
        }}
        class="w-full px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all cursor-pointer {currentTab === 'dashboard' ? 'bg-blue-50/80 text-blue-700 font-bold border border-blue-200/60 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
      >
        <div class="flex items-center gap-3">
          <LayoutDashboard class="w-4 h-4 {currentTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}" />
          <span>Dashboard</span>
        </div>
      </button>

      <button
        onclick={() => {
          onSelectTab('tasks');
          if (onCloseMobile) onCloseMobile();
        }}
        class="w-full px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all cursor-pointer {currentTab === 'tasks' ? 'bg-blue-50/80 text-blue-700 font-bold border border-blue-200/60 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
      >
        <div class="flex items-center gap-3">
          <CheckSquare class="w-4 h-4 {currentTab === 'tasks' ? 'text-blue-600' : 'text-slate-400'}" />
          <span>Tasks</span>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold {currentTab === 'tasks' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}">
          {tasksCount}
        </span>
      </button>

      <button
        onclick={() => {
          onSelectTab('categories');
          if (onCloseMobile) onCloseMobile();
        }}
        class="w-full px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all cursor-pointer {currentTab === 'categories' ? 'bg-blue-50/80 text-blue-700 font-bold border border-blue-200/60 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
      >
        <div class="flex items-center gap-3">
          <Tags class="w-4 h-4 {currentTab === 'categories' ? 'text-blue-600' : 'text-slate-400'}" />
          <span>Categories</span>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold {currentTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}">
          {categoriesCount}
        </span>
      </button>

      <button
        onclick={() => {
          onSelectTab('lists');
          if (onCloseMobile) onCloseMobile();
        }}
        class="w-full px-3.5 py-2.5 rounded-xl font-medium text-xs flex items-center justify-between transition-all cursor-pointer {currentTab === 'lists' ? 'bg-blue-50/80 text-blue-700 font-bold border border-blue-200/60 shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}"
      >
        <div class="flex items-center gap-3">
          <Layers class="w-4 h-4 {currentTab === 'lists' ? 'text-blue-600' : 'text-slate-400'}" />
          <span>Task Lists</span>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold {currentTab === 'lists' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}">
          {listsCount}
        </span>
      </button>
    </nav>
  </div>

  <!-- Bottom System Card -->
  <div class="p-5 border-t border-slate-200/80 bg-slate-50/60 space-y-3">
    <!-- Live Status Pill -->
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          {#if isConfigured}
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          {:else}
            <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          {/if}
        </span>
        <span class="font-semibold text-slate-700 text-[11px]">
          {isConfigured ? 'Supabase Live' : 'Local Storage Demo'}
        </span>
      </div>
      <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider">PostgreSQL</span>
    </div>

    <!-- DB & Architecture Inspector Trigger -->
    <button
      onclick={() => {
        onOpenSchema();
        if (onCloseMobile) onCloseMobile();
      }}
      class="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
    >
      <Database class="w-3.5 h-3.5 text-blue-600" />
      <span>Database & Architecture</span>
    </button>

    <!-- Mini Tech Footer -->
    <div class="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-400">
      <span>Svelte 5</span>
      <span>•</span>
      <span>PostgreSQL</span>
      <span>•</span>
      <span>Vercel</span>
    </div>
  </div>
</aside>
