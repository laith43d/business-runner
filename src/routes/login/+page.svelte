<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuthActions } from '$lib/auth.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const { signIn } = useAuthActions();

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!email || !password) {
			error = 'يرجى ملء جميع الحقول';
			return;
		}

		loading = true;
		try {
			const result = await signIn('password', {
				email,
				password,
				flow: 'signIn',
			});
			if (result.signingIn) {
				goto('/');
			} else {
				error = 'فشل تسجيل الدخول';
			}
		} catch (e: any) {
			error = e?.message || 'حدث خطأ أثناء تسجيل الدخول';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-background px-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="space-y-1 text-center">
			<Card.Title class="text-2xl font-bold">تسجيل الدخول</Card.Title>
			<Card.Description>
				أدخل بريدك الإلكتروني وكلمة المرور للدخول
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="email">البريد الإلكتروني</Label>
					<Input
						id="email"
						type="email"
						placeholder="email@example.com"
						bind:value={email}
						dir="ltr"
						class="text-start"
					/>
				</div>
				<div class="space-y-2">
					<Label for="password">كلمة المرور</Label>
					<Input
						id="password"
						type="password"
						placeholder="••••••••"
						bind:value={password}
						dir="ltr"
					/>
				</div>

				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}

				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				ليس لديك حساب؟
				<a href="/signup" class="text-primary underline-offset-4 hover:underline">
					إنشاء حساب جديد
				</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
