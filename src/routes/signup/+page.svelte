<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuthActions } from '$lib/auth.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	const { signIn } = useAuthActions();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!name || !email || !password || !confirmPassword) {
			error = 'يرجى ملء جميع الحقول';
			return;
		}

		if (password !== confirmPassword) {
			error = 'كلمة المرور غير متطابقة';
			return;
		}

		if (password.length < 8) {
			error = 'يجب أن تكون كلمة المرور 8 أحرف على الأقل';
			return;
		}

		loading = true;
		try {
			const result = await signIn('password', {
				email,
				password,
				name,
				flow: 'signUp',
			});
			if (result.signingIn) {
				goto('/');
			} else {
				error = 'فشل إنشاء الحساب';
			}
		} catch (e: any) {
			error = e?.message || 'حدث خطأ أثناء إنشاء الحساب';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-background px-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="space-y-1 text-center">
			<Card.Title class="text-2xl font-bold">إنشاء حساب جديد</Card.Title>
			<Card.Description>
				أدخل بياناتك لإنشاء حساب جديد
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit} class="space-y-4">
				<div class="space-y-2">
					<Label for="name">الاسم</Label>
					<Input
						id="name"
						type="text"
						placeholder="محمد"
						bind:value={name}
					/>
				</div>
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
				<div class="space-y-2">
					<Label for="confirmPassword">تأكيد كلمة المرور</Label>
					<Input
						id="confirmPassword"
						type="password"
						placeholder="••••••••"
						bind:value={confirmPassword}
						dir="ltr"
					/>
				</div>

				{#if error}
					<p class="text-sm text-destructive">{error}</p>
				{/if}

				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				لديك حساب بالفعل؟
				<a href="/login" class="text-primary underline-offset-4 hover:underline">
					تسجيل الدخول
				</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
