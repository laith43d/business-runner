<script lang="ts">
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { toast } from 'svelte-sonner';

	type Props = {
		open: boolean;
		category: {
			_id: Id<'expenseCategories'>;
			name: string;
			description?: string;
		} | null;
		onClose: () => void;
	};

	let { open = $bindable(), category, onClose }: Props = $props();

	let name = $state('');
	let description = $state('');
	let isSubmitting = $state(false);
	let nameError = $state('');

	const client = useConvexClient();

	// Populate form when category changes
	$effect(() => {
		if (category) {
			name = category.name;
			description = category.description ?? '';
			nameError = '';
		}
	});

	function validate(): boolean {
		nameError = '';
		if (!name.trim()) {
			nameError = 'اسم الفئة مطلوب';
			return false;
		}
		return true;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate() || !category) return;

		isSubmitting = true;
		try {
			await client.mutation(api.expenseCategories.update, {
				id: category._id,
				name: name.trim(),
				description: description.trim() || undefined,
			});
			toast.success('تم تعديل الفئة بنجاح');
			onClose();
		} catch (err: any) {
			const message = err?.data?.message || 'حدث خطأ أثناء تعديل الفئة';
			toast.error(message);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={(v) => { if (!v) onClose(); }}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>تعديل الفئة</Dialog.Title>
			<Dialog.Description>تعديل بيانات فئة المصروفات</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<Label for="edit-name">الاسم *</Label>
				<Input
					id="edit-name"
					bind:value={name}
					placeholder="مثال: إيجار"
					class={nameError ? 'border-destructive' : ''}
				/>
				{#if nameError}
					<p class="text-sm text-destructive">{nameError}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="edit-description">الوصف</Label>
				<Textarea
					id="edit-description"
					bind:value={description}
					placeholder="وصف اختياري للفئة"
					rows={3}
				/>
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
