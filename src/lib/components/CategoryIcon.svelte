<script lang="ts">
  import {
    GraduationCap,
    Briefcase,
    User,
    Activity,
    DollarSign,
    Folder,
    Book,
    Code,
    CheckSquare,
    Star,
    Heart,
    Zap,
    Tag,
    Layers,
    ListTodo,
    Bookmark
  } from '@lucide/svelte';

  interface Props {
    name?: string;
    class?: string;
    size?: number;
  }

  let { name = 'tag', class: className = 'w-4 h-4', size = 16 }: Props = $props();
</script>

{#if name === 'graduation-cap'}
  <GraduationCap class={className} {size} />
{:else if name === 'briefcase'}
  <Briefcase class={className} {size} />
{:else if name === 'user'}
  <User class={className} {size} />
{:else if name === 'activity'}
  <Activity class={className} {size} />
{:else if name === 'dollar-sign'}
  <DollarSign class={className} {size} />
{:else if name === 'folder'}
  <Folder class={className} {size} />
{:else if name === 'book'}
  <Book class={className} {size} />
{:else if name === 'code'}
  <Code class={className} {size} />
{:else if name === 'check-square'}
  <CheckSquare class={className} {size} />
{:else if name === 'star'}
  <Star class={className} {size} />
{:else if name === 'heart'}
  <Heart class={className} {size} />
{:else if name === 'zap'}
  <Zap class={className} {size} />
{:else if name === 'layers'}
  <Layers class={className} {size} />
{:else if name === 'bookmark'}
  <Bookmark class={className} {size} />
{:else if name === 'list-todo'}
  <ListTodo class={className} {size} />
{:else}
  <Tag class={className} {size} />
{/if}
