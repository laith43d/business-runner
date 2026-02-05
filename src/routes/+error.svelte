<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { AlertTriangle } from 'lucide-svelte';
</script>

<div class="flex min-h-screen items-center justify-center bg-background px-4">
	<div class="flex max-w-md flex-col items-center text-center">
		<div class="mb-6 rounded-full bg-destructive/10 p-4">
			<AlertTriangle class="h-12 w-12 text-destructive" />
		</div>

		<h1 class="mb-2 text-4xl font-bold text-foreground">
			{page.status}
		</h1>

		<p class="mb-2 text-xl font-semibold text-foreground">
			حدث خطأ غير متوقع
		</p>

		<p class="mb-8 text-muted-foreground">
			{#if page.status === 404}
				الصفحة التي تبحث عنها غير موجودة.
			{:else}
				عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.
			{/if}
		</p>

		<div class="flex gap-3">
			<a href="/">
				<Button>العودة للرئيسية</Button>
			</a>
			<Button variant="outline" onclick={() => window.location.reload()}>
				إعادة المحاولة
			</Button>
		</div>
	</div>
</div>
