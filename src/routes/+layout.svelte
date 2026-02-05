<script lang="ts">
	import '../app.css';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import { setupConvexAuth } from '$lib/auth.svelte';

	let { children } = $props();

	setupConvex(PUBLIC_CONVEX_URL);
	setupConvexAuth(PUBLIC_CONVEX_URL);
</script>

{@render children()}
