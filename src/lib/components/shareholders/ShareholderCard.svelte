<script lang="ts">
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Pencil, Trash2, Mail, Percent } from 'lucide-svelte';

	type Shareholder = {
		_id: Id<'shareholders'>;
		_creationTime: number;
		name: string;
		email: string;
		sharePercentage: number;
		isActive: boolean;
		createdAt: number;
		updatedAt: number;
	};

	type Props = {
		shareholder: Shareholder;
		onEdit: (shareholder: Shareholder) => void;
		onDeactivate: (shareholder: Shareholder) => void;
	};

	let { shareholder, onEdit, onDeactivate }: Props = $props();
</script>

<Card.Root class="relative overflow-hidden transition-shadow hover:shadow-md">
	<Card.Header class="pb-3">
		<div class="flex items-start justify-between">
			<div class="space-y-1">
				<Card.Title class="text-lg">{shareholder.name}</Card.Title>
				<div class="flex items-center gap-1.5 text-sm text-muted-foreground">
					<Mail class="h-3.5 w-3.5" />
					<span dir="ltr">{shareholder.email}</span>
				</div>
			</div>
			{#if shareholder.isActive}
				<Badge variant="default">نشط</Badge>
			{:else}
				<Badge variant="secondary">غير نشط</Badge>
			{/if}
		</div>
	</Card.Header>

	<Card.Content class="pb-3">
		<div class="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
			<Percent class="h-5 w-5 text-primary" />
			<div>
				<p class="text-2xl font-bold text-primary">{shareholder.sharePercentage}%</p>
				<p class="text-xs text-muted-foreground">نسبة الملكية</p>
			</div>
		</div>
	</Card.Content>

	<Card.Footer class="flex justify-end gap-1 border-t pt-3">
		<Button
			variant="ghost"
			size="sm"
			onclick={() => onEdit(shareholder)}
			title="تعديل"
		>
			<Pencil class="h-4 w-4" />
			تعديل
		</Button>
		{#if shareholder.isActive}
			<Button
				variant="ghost"
				size="sm"
				onclick={() => onDeactivate(shareholder)}
				title="إلغاء التفعيل"
				class="text-destructive hover:text-destructive"
			>
				<Trash2 class="h-4 w-4" />
				حذف
			</Button>
		{/if}
	</Card.Footer>
</Card.Root>
