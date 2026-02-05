<script lang="ts">
	import { goto } from '$app/navigation';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import { useAuthActions } from '$lib/auth.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { toast } from 'svelte-sonner';
	import { User, Mail, LogOut, KeyRound, Loader2 } from 'lucide-svelte';

	const viewer = useQuery(api.users.viewer, {});
	const { signIn, signOut } = useAuthActions();

	// Sign-out
	let isSigningOut = $state(false);

	async function handleSignOut() {
		isSigningOut = true;
		try {
			await signOut();
			goto('/login');
		} catch {
			toast.error('حدث خطأ أثناء تسجيل الخروج');
		} finally {
			isSigningOut = false;
		}
	}

	// Password change form
	let newPassword = $state('');
	let confirmPassword = $state('');
	let isChangingPassword = $state(false);
	let passwordError = $state('');

	async function handleChangePassword(e: SubmitEvent) {
		e.preventDefault();
		passwordError = '';

		if (!newPassword || !confirmPassword) {
			passwordError = 'يرجى ملء جميع الحقول';
			return;
		}

		if (newPassword.length < 6) {
			passwordError = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
			return;
		}

		if (newPassword !== confirmPassword) {
			passwordError = 'كلمة المرور الجديدة غير متطابقة';
			return;
		}

		const email = viewer.data?.email;
		if (!email) {
			passwordError = 'لا يمكن تغيير كلمة المرور بدون بريد إلكتروني';
			return;
		}

		isChangingPassword = true;
		try {
			// Re-register with same email to update password
			const result = await signIn('password', {
				email,
				password: newPassword,
				flow: 'signUp',
			});
			if (result.signingIn) {
				toast.success('تم تغيير كلمة المرور بنجاح');
				newPassword = '';
				confirmPassword = '';
			} else {
				passwordError = 'فشل تغيير كلمة المرور';
			}
		} catch (err: any) {
			passwordError = err?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
		} finally {
			isChangingPassword = false;
		}
	}
</script>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-3xl font-bold">الإعدادات</h1>
		<p class="mt-1 text-muted-foreground">إعدادات التطبيق وتفضيلات المستخدم.</p>
	</div>

	<!-- Account Section -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<User class="h-5 w-5" />
				الحساب
			</Card.Title>
			<Card.Description>بيانات حسابك في النظام</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if viewer.isLoading}
				<div class="space-y-4">
					<div class="h-5 w-48 animate-pulse rounded bg-muted"></div>
					<div class="h-5 w-64 animate-pulse rounded bg-muted"></div>
				</div>
			{:else if viewer.data}
				<div class="space-y-4">
					{#if viewer.data.name}
						<div class="flex items-center gap-3">
							<User class="h-4 w-4 text-muted-foreground" />
							<div>
								<p class="text-xs text-muted-foreground">الاسم</p>
								<p class="font-medium">{viewer.data.name}</p>
							</div>
						</div>
					{/if}
					{#if viewer.data.email}
						<div class="flex items-center gap-3">
							<Mail class="h-4 w-4 text-muted-foreground" />
							<div>
								<p class="text-xs text-muted-foreground">البريد الإلكتروني</p>
								<p class="font-medium" dir="ltr">{viewer.data.email}</p>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Change Password Section -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<KeyRound class="h-5 w-5" />
				تغيير كلمة المرور
			</Card.Title>
			<Card.Description>قم بتحديث كلمة المرور الخاصة بك</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleChangePassword} class="space-y-4">
				<div class="space-y-2">
					<Label for="new-password">كلمة المرور الجديدة</Label>
					<Input
						id="new-password"
						type="password"
						placeholder="••••••••"
						bind:value={newPassword}
						dir="ltr"
						autocomplete="new-password"
					/>
				</div>
				<div class="space-y-2">
					<Label for="confirm-password">تأكيد كلمة المرور الجديدة</Label>
					<Input
						id="confirm-password"
						type="password"
						placeholder="••••••••"
						bind:value={confirmPassword}
						dir="ltr"
						autocomplete="new-password"
					/>
				</div>

				{#if passwordError}
					<p class="text-sm text-destructive">{passwordError}</p>
				{/if}

				<Button type="submit" disabled={isChangingPassword}>
					{#if isChangingPassword}
						<Loader2 class="h-4 w-4 animate-spin" />
						جاري التحديث...
					{:else}
						تغيير كلمة المرور
					{/if}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Sign Out Section -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<LogOut class="h-5 w-5" />
				تسجيل الخروج
			</Card.Title>
			<Card.Description>تسجيل الخروج من حسابك في النظام</Card.Description>
		</Card.Header>
		<Card.Content>
			<Button variant="destructive" onclick={handleSignOut} disabled={isSigningOut}>
				{#if isSigningOut}
					<Loader2 class="h-4 w-4 animate-spin" />
					جاري تسجيل الخروج...
				{:else}
					<LogOut class="h-4 w-4" />
					تسجيل الخروج
				{/if}
			</Button>
		</Card.Content>
	</Card.Root>
</div>
