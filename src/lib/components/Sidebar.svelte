<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '$lib/utils/index.js';
	import {
		LayoutDashboard,
		TrendingUp,
		TrendingDown,
		FolderOpen,
		Users,
		Wallet,
		Settings,
		X,
	} from 'lucide-svelte';

	let { open = $bindable(false) } = $props();

	const links = [
		{ href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
		{ href: '/income', label: 'الإيرادات', icon: TrendingUp },
		{ href: '/expenses', label: 'المصروفات', icon: TrendingDown },
		{ href: '/categories', label: 'التصنيفات', icon: FolderOpen },
		{ href: '/shareholders', label: 'الشركاء', icon: Users },
		{ href: '/disbursements', label: 'التوزيعات', icon: Wallet },
		{ href: '/settings', label: 'الإعدادات', icon: Settings },
	];

	function isActive(href: string): boolean {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<!-- Mobile overlay -->
{#if open}
	<div
		class="fixed inset-0 z-40 bg-black/50 lg:hidden"
		role="presentation"
		onclick={() => (open = false)}
	></div>
{/if}

<!-- Sidebar -->
<aside
	class={cn(
		'fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-s bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:translate-x-0',
		open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
	)}
>
	<!-- Sidebar header -->
	<div class="flex h-16 items-center justify-between border-b px-6">
		<h1 class="text-lg font-bold">متتبع المصروفات</h1>
		<button class="lg:hidden" onclick={() => (open = false)} aria-label="إغلاق القائمة الجانبية">
			<X class="h-5 w-5" />
		</button>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 space-y-1 px-3 py-4" aria-label="القائمة الرئيسية">
		{#each links as link (link.href)}
			{@const active = isActive(link.href)}
			<a
				href={link.href}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
					active
						? 'bg-sidebar-accent text-sidebar-accent-foreground'
						: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
				)}
				onclick={() => (open = false)}
			>
				<link.icon class="h-5 w-5 shrink-0" />
				<span>{link.label}</span>
			</a>
		{/each}
	</nav>
</aside>
