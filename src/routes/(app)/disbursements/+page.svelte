<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import type { Id } from '../../../../convex/_generated/dataModel.js';
	import PeriodSelector from '$lib/components/filters/PeriodSelector.svelte';
	import ProfitSummary from '$lib/components/disbursements/ProfitSummary.svelte';
	import ShareholderSharesTable from '$lib/components/disbursements/ShareholderSharesTable.svelte';
	import CreateDisbursementDialog from '$lib/components/disbursements/CreateDisbursementDialog.svelte';
	import DisbursementHistory from '$lib/components/disbursements/DisbursementHistory.svelte';

	type ShareholderShare = {
		shareholderId: Id<'shareholders'>;
		shareholderName: string;
		sharePercentage: number;
		shareAmount: number;
		disbursed: number;
		remaining: number;
	};

	// Period state — default to "this month"
	const now = new Date();
	const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
	const defaultTo = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
		23,
		59,
		59,
		999,
	).getTime();
	const defaultLabel = `${now.getFullYear()}-M${now.getMonth() + 1}`;

	let dateFrom = $state(defaultFrom);
	let dateTo = $state(defaultTo);
	let periodLabel = $state(defaultLabel);

	// Shareholder filter for history
	let historyShareholderFilter = $state('all');

	// Create disbursement dialog state
	let disbDialogOpen = $state(false);
	let disbShareholderId = $state<Id<'shareholders'> | null>(null);
	let disbShareholderName = $state('');
	let disbMaxAmount = $state(0);

	// Build query args reactively
	let profitArgs = $derived({ dateFrom, dateTo });
	let disbursementListArgs = $derived.by(() => {
		const args: {
			dateFrom?: number;
			dateTo?: number;
			shareholderId?: Id<'shareholders'>;
		} = {
			dateFrom,
			dateTo,
		};
		if (historyShareholderFilter !== 'all') {
			args.shareholderId = historyShareholderFilter as Id<'shareholders'>;
		}
		return args;
	});

	// Queries
	const profitSummary = useQuery(api.profit.getProfitSummary, () => profitArgs);
	const shareholderShares = useQuery(api.profit.getShareholderShares, () => profitArgs);
	const disbursements = useQuery(api.disbursements.list, () => disbursementListArgs);

	// Derive shareholder list for the history filter dropdown
	let shareholderOptions = $derived(
		(shareholderShares.data ?? []).map((s: ShareholderShare) => ({
			id: s.shareholderId,
			name: s.shareholderName,
		})),
	);

	function handlePeriodChange(from: number, to: number, label: string) {
		dateFrom = from;
		dateTo = to;
		periodLabel = label;
	}

	function handleDistribute(share: ShareholderShare) {
		disbShareholderId = share.shareholderId;
		disbShareholderName = share.shareholderName;
		disbMaxAmount = share.remaining;
		disbDialogOpen = true;
	}

	function handleDisbDialogClose() {
		disbDialogOpen = false;
		disbShareholderId = null;
		disbShareholderName = '';
		disbMaxAmount = 0;
	}

	function handleShareholderFilterChange(id: string) {
		historyShareholderFilter = id;
	}
</script>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold">التوزيعات</h1>
		<p class="mt-1 text-muted-foreground">تسجيل وعرض توزيعات الأرباح على الشركاء.</p>
	</div>

	<!-- Period Selector -->
	<PeriodSelector {dateFrom} {dateTo} {periodLabel} onPeriodChange={handlePeriodChange} />

	<!-- Profit Summary Cards -->
	<ProfitSummary
		totalIncome={profitSummary.data?.totalIncome ?? 0}
		totalExpenses={profitSummary.data?.totalExpenses ?? 0}
		netProfit={profitSummary.data?.netProfit ?? 0}
		totalDisbursements={profitSummary.data?.totalDisbursements ?? 0}
		availableProfit={profitSummary.data?.availableProfit ?? 0}
		isLoading={profitSummary.isLoading}
	/>

	<!-- Shareholder Shares Table -->
	<ShareholderSharesTable
		shares={shareholderShares.data ?? []}
		isLoading={shareholderShares.isLoading}
		onDistribute={handleDistribute}
	/>

	<!-- Disbursement History -->
	<DisbursementHistory
		disbursements={disbursements.data ?? []}
		shareholders={shareholderOptions}
		isLoading={disbursements.isLoading}
		selectedShareholderId={historyShareholderFilter}
		onShareholderFilterChange={handleShareholderFilterChange}
	/>
</div>

<!-- Create Disbursement Dialog -->
<CreateDisbursementDialog
	bind:open={disbDialogOpen}
	shareholderId={disbShareholderId}
	shareholderName={disbShareholderName}
	maxAmount={disbMaxAmount}
	{periodLabel}
	onClose={handleDisbDialogClose}
/>
