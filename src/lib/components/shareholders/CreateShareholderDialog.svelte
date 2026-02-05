<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';
	import { Plus } from 'lucide-svelte';

	type Props = {
		remaining: number;
	};

	let { remaining }: Props = $props();

	let open = $state(false);
	let name = $state('');
	let email = $state('');
	let sharePercentage = $state<number | ''>('');
	let isSubmitting = $state(false);

	let nameError = $state('');
	let emailError = $state('');
	let percentageError = $state('');

	const client = useConvexClient();

	function resetForm() {
		name = '';
		email = '';
		sharePercentage = '';
		nameError = '';
		emailError = '';
		percentageError = '';
		isSubmitting = false;
	}

	function validate(): boolean {
		nameError = '';
		emailError = '';
		percentageError = '';
		let valid = true;

		if (!name.trim()) {
			nameError = 'اسم الشريك مطلوب';
			valid = false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email.trim()) {
			emailError = 'البريد الإلكتروني مطلوب';
			valid = false;
		} else if (!emailRegex.test(email.trim())) {
			emailError = 'البريد الإلكتروني غير صالح';
			valid = false;
		}

		const pct = Number(sharePercentage);
		if (sharePercentage === '' || isNaN(pct)) {
			percentageError = 'نسبة الملكية مطلوبة';
			valid = false;
		} else if (pct <= 0 || pct > 100) {
			percentageError = 'نسبة الملكية يجب أن تكون بين 0 و 100';
			valid = false;
		} else if (pct > remaining) {
			percentageError = `النسبة المتاحة ${remaining}% فقط`;
			valid = false;
		}

		return valid;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate()) return;

		isSubmitting = true;
		try {
			await client.mutation(api.shareholders.create, {
				name: name.trim(),
				email: email.trim(),
				sharePercentage: Number(sharePercentage),
			});
			toast.success('تم إضافة الشريك بنجاح');
			open = false;
			resetForm();
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء إضافة الشريك';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => { if (!v) resetForm(); }}>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button {...props}>
				<Plus class="h-4 w-4" />
				إضافة شريك
			</Button>
		{/snippet}
	</Dialog.Trigger>

	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>إضافة شريك جديد</Dialog.Title>
			<Dialog.Description>أدخل بيانات الشريك الجديد ونسبة ملكيته</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="sh-name">الاسم *</Label>
				<Input
					id="sh-name"
					bind:value={name}
					placeholder="اسم الشريك"
					class={nameError ? 'border-destructive' : ''}
				/>
				{#if nameError}
					<p class="text-sm text-destructive">{nameError}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="sh-email">البريد الإلكتروني *</Label>
				<Input
					id="sh-email"
					type="email"
					dir="ltr"
					bind:value={email}
					placeholder="example@email.com"
					class={emailError ? 'border-destructive' : ''}
				/>
				{#if emailError}
					<p class="text-sm text-destructive">{emailError}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="sh-percentage">نسبة الملكية (%) *</Label>
				<Input
					id="sh-percentage"
					type="number"
					dir="ltr"
					min="0.01"
					max="100"
					step="0.01"
					bind:value={sharePercentage}
					placeholder="مثال: 25"
					class={percentageError ? 'border-destructive' : ''}
				/>
				<p class="text-sm text-muted-foreground">النسبة المتاحة: {remaining}%</p>
				{#if percentageError}
					<p class="text-sm text-destructive">{percentageError}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Dialog.Close>
					{#snippet child({ props })}
						<Button {...props} variant="outline" type="button">إلغاء</Button>
					{/snippet}
				</Dialog.Close>
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						جاري الحفظ...
					{:else}
						حفظ
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
