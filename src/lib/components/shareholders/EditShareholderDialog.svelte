<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { toast } from 'svelte-sonner';

	type Shareholder = {
		_id: Id<'shareholders'>;
		name: string;
		email: string;
		sharePercentage: number;
	};

	type Props = {
		open: boolean;
		shareholder: Shareholder | null;
		/** Total remaining percentage (excluding all active shareholders) */
		totalRemaining: number;
		onClose: () => void;
	};

	let { open = $bindable(), shareholder, totalRemaining, onClose }: Props = $props();

	let name = $state('');
	let email = $state('');
	let sharePercentage = $state<number | ''>('');
	let isSubmitting = $state(false);

	let nameError = $state('');
	let emailError = $state('');
	let percentageError = $state('');

	const client = useConvexClient();

	// The available remaining for this shareholder = totalRemaining + their current percentage
	let availableRemaining = $derived(
		shareholder ? totalRemaining + shareholder.sharePercentage : totalRemaining,
	);

	// Populate form when shareholder changes
	$effect(() => {
		if (shareholder) {
			name = shareholder.name;
			email = shareholder.email;
			sharePercentage = shareholder.sharePercentage;
			nameError = '';
			emailError = '';
			percentageError = '';
		}
	});

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
		} else if (pct > availableRemaining) {
			percentageError = `النسبة المتاحة ${availableRemaining}% فقط`;
			valid = false;
		}

		return valid;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate() || !shareholder) return;

		isSubmitting = true;
		try {
			await client.mutation(api.shareholders.update, {
				id: shareholder._id,
				name: name.trim(),
				email: email.trim(),
				sharePercentage: Number(sharePercentage),
			});
			toast.success('تم تعديل بيانات الشريك بنجاح');
			onClose();
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء تعديل بيانات الشريك';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => { if (!v) onClose(); }}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>تعديل بيانات الشريك</Dialog.Title>
			<Dialog.Description>تعديل بيانات الشريك ونسبة ملكيته</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="edit-sh-name">الاسم *</Label>
				<Input
					id="edit-sh-name"
					bind:value={name}
					placeholder="اسم الشريك"
					class={nameError ? 'border-destructive' : ''}
				/>
				{#if nameError}
					<p class="text-sm text-destructive">{nameError}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="edit-sh-email">البريد الإلكتروني *</Label>
				<Input
					id="edit-sh-email"
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
				<Label for="edit-sh-percentage">نسبة الملكية (%) *</Label>
				<Input
					id="edit-sh-percentage"
					type="number"
					dir="ltr"
					min="0.01"
					max="100"
					step="0.01"
					bind:value={sharePercentage}
					placeholder="مثال: 25"
					class={percentageError ? 'border-destructive' : ''}
				/>
				<p class="text-sm text-muted-foreground">
					النسبة المتاحة: {availableRemaining}%
				</p>
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
						حفظ التعديلات
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
