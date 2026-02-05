<script lang="ts">
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { formatCurrency } from '$lib/utils/format.js';
	import { Banknote } from 'lucide-svelte';

	type ShareholderShare = {
		shareholderId: Id<'shareholders'>;
		shareholderName: string;
		sharePercentage: number;
		shareAmount: number;
		disbursed: number;
		remaining: number;
	};

	type Props = {
		shares: ShareholderShare[];
		isLoading?: boolean;
		onDistribute: (share: ShareholderShare) => void;
	};

	let { shares, isLoading = false, onDistribute }: Props = $props();
</script>

<div class="space-y-3">
	<h2 class="text-lg font-semibold">حصص الشركاء</h2>

	{#if isLoading}
		<div class="space-y-3">
			<div class="h-10 w-full animate-pulse rounded-md bg-muted"></div>
			{#each Array(3) as _}
				<div class="h-14 w-full animate-pulse rounded-md bg-muted/50"></div>
			{/each}
		</div>
	{:else if shares.length === 0}
		<div class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
			<p class="text-muted-foreground">لا يوجد شركاء نشطين لتوزيع الأرباح</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-md border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="text-right">الشريك</Table.Head>
						<Table.Head class="text-right">النسبة</Table.Head>
						<Table.Head class="text-right">حصة الربح</Table.Head>
						<Table.Head class="text-right">تم توزيعه</Table.Head>
						<Table.Head class="text-right">المتبقي</Table.Head>
						<Table.Head class="w-[120px] text-right">الإجراءات</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each shares as share (share.shareholderId)}
						<Table.Row class={share.remaining <= 0 ? 'opacity-50' : ''}>
							<Table.Cell class="font-medium">{share.shareholderName}</Table.Cell>
							<Table.Cell>{share.sharePercentage}%</Table.Cell>
							<Table.Cell>{formatCurrency(share.shareAmount)}</Table.Cell>
							<Table.Cell class="text-muted-foreground">
								{formatCurrency(share.disbursed)}
							</Table.Cell>
							<Table.Cell class="font-semibold {share.remaining > 0 ? 'text-green-600' : 'text-muted-foreground'}">
								{formatCurrency(share.remaining)}
							</Table.Cell>
							<Table.Cell>
								<Button
									variant="outline"
									size="sm"
									disabled={share.remaining <= 0}
									onclick={() => onDistribute(share)}
								>
									<Banknote class="h-4 w-4" />
									توزيع
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	{/if}
</div>
