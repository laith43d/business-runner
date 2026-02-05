<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../convex/_generated/api.js';
	import { formatCurrency } from '$lib/utils/format.js';
	import DateRangeFilter from '$lib/components/filters/DateRangeFilter.svelte';
	import MetricCard from '$lib/components/dashboard/MetricCard.svelte';
	import IncomeExpensesChart from '$lib/components/dashboard/IncomeExpensesChart.svelte';
	import ExpenseBreakdownChart from '$lib/components/dashboard/ExpenseBreakdownChart.svelte';
	import MonthlyIncomeChart from '$lib/components/dashboard/MonthlyIncomeChart.svelte';
	import ProfitMarginChart from '$lib/components/dashboard/ProfitMarginChart.svelte';
	import TopCategoriesChart from '$lib/components/dashboard/TopCategoriesChart.svelte';
	import {
		TrendingUp,
		TrendingDown,
		DollarSign,
		Wallet,
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	// Default to "all" (no date filter) — matches DateRangeFilter default preset
	let dateFrom = $state<number | undefined>(undefined);
	let dateTo = $state<number | undefined>(undefined);

	// Use safe defaults for queries — always provide a date range
	let queryFrom = $derived(dateFrom ?? new Date(2000, 0, 1).getTime());
	let queryTo = $derived(dateTo ?? new Date(2099, 11, 31).getTime());

	const metricsQuery = useQuery(api.dashboard.getMetrics, () => ({
		dateFrom: queryFrom,
		dateTo: queryTo,
	}));

	const monthlyTrendQuery = useQuery(api.dashboard.getMonthlyTrend, () => ({
		dateFrom: queryFrom,
		dateTo: queryTo,
	}));

	const expenseBreakdownQuery = useQuery(api.dashboard.getExpenseBreakdown, () => ({
		dateFrom: queryFrom,
		dateTo: queryTo,
	}));

	const topCategoriesQuery = useQuery(api.dashboard.getTopExpenseCategories, () => ({
		dateFrom: queryFrom,
		dateTo: queryTo,
		limit: 5,
	}));

	function handleDateChange(from: number | undefined, to: number | undefined) {
		dateFrom = from;
		dateTo = to;
	}

	// Check if there's any data at all
	let hasNoData = $derived(
		metricsQuery.data !== undefined &&
		metricsQuery.data.totalIncome === 0 &&
		metricsQuery.data.totalExpenses === 0
	);

	let isLoading = $derived(
		metricsQuery.isLoading ||
		monthlyTrendQuery.isLoading ||
		expenseBreakdownQuery.isLoading ||
		topCategoriesQuery.isLoading
	);
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold">لوحة التحكم</h1>
			<p class="text-sm text-muted-foreground">ملخص الأداء المالي لعملك</p>
		</div>
		<DateRangeFilter {dateFrom} {dateTo} onDateChange={handleDateChange} />
	</div>

	{#if hasNoData && !isLoading}
		<!-- Empty state -->
		<div class="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 text-center">
			<div class="mb-4 rounded-full bg-muted p-4">
				<DollarSign class="h-10 w-10 text-muted-foreground" />
			</div>
			<h2 class="mb-2 text-xl font-semibold">لا توجد معاملات بعد</h2>
			<p class="mb-6 max-w-md text-sm text-muted-foreground">
				ابدأ بإضافة إيراداتك ومصروفاتك لرؤية تحليلات مالية مفصلة هنا.
			</p>
			<div class="flex gap-3">
				<a href="/income">
					<Button>إضافة إيراد</Button>
				</a>
				<a href="/expenses">
					<Button variant="outline">إضافة مصروف</Button>
				</a>
			</div>
		</div>
	{:else}
		<!-- Metric Cards -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<MetricCard
				label="إجمالي الإيرادات"
				value={metricsQuery.data ? formatCurrency(metricsQuery.data.totalIncome) : ''}
				icon={TrendingUp}
				iconColor="text-green-500"
				loading={metricsQuery.isLoading}
			/>
			<MetricCard
				label="إجمالي المصروفات"
				value={metricsQuery.data ? formatCurrency(metricsQuery.data.totalExpenses) : ''}
				icon={TrendingDown}
				iconColor="text-red-500"
				loading={metricsQuery.isLoading}
			/>
			<MetricCard
				label="صافي الربح"
				value={metricsQuery.data ? formatCurrency(metricsQuery.data.netProfit) : ''}
				subtitle={metricsQuery.data ? `هامش الربح: ${metricsQuery.data.profitMargin}%` : ''}
				icon={DollarSign}
				iconColor="text-blue-500"
				valueColor={metricsQuery.data
					? metricsQuery.data.netProfit >= 0
						? 'text-green-600'
						: 'text-red-600'
					: ''}
				loading={metricsQuery.isLoading}
			/>
			<MetricCard
				label="الأرباح المتاحة"
				value={metricsQuery.data ? formatCurrency(metricsQuery.data.availableProfit) : ''}
				icon={Wallet}
				iconColor="text-purple-500"
				loading={metricsQuery.isLoading}
			/>
		</div>

		<!-- Charts Grid -->
		<div class="grid gap-4 lg:grid-cols-2">
			<IncomeExpensesChart
				data={monthlyTrendQuery.data ?? []}
				loading={monthlyTrendQuery.isLoading}
			/>
			<ExpenseBreakdownChart
				data={expenseBreakdownQuery.data ?? []}
				loading={expenseBreakdownQuery.isLoading}
			/>
			<MonthlyIncomeChart
				data={monthlyTrendQuery.data ?? []}
				loading={monthlyTrendQuery.isLoading}
			/>
			<ProfitMarginChart
				data={monthlyTrendQuery.data ?? []}
				loading={monthlyTrendQuery.isLoading}
			/>
		</div>

		<!-- Top Categories (full width) -->
		<TopCategoriesChart
			data={topCategoriesQuery.data ?? []}
			loading={topCategoriesQuery.isLoading}
		/>
	{/if}
</div>
