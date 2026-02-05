<script lang="ts">
	import { useAuthActions } from '$lib/auth.svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Menu, LogOut } from 'lucide-svelte';

	let { onToggleSidebar }: { onToggleSidebar: () => void } = $props();

	const { signOut } = useAuthActions();

	async function handleSignOut() {
		await signOut();
		goto('/login');
	}
</script>

<header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-blur:bg-background/60 lg:px-6">
	<div class="flex items-center gap-3">
		<button class="lg:hidden" onclick={onToggleSidebar}>
			<Menu class="h-6 w-6" />
		</button>
		<h2 class="text-lg font-semibold lg:hidden">متتبع المصروفات</h2>
	</div>

	<Button variant="ghost" size="sm" onclick={handleSignOut} class="gap-2">
		<LogOut class="h-4 w-4" />
		<span>تسجيل الخروج</span>
	</Button>
</header>
