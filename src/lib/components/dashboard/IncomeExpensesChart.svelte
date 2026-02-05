<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Tooltip,
		Legend,
		Filler,
	} from 'chart.js';
	import ChartContainer from '$lib/components/charts/ChartContainer.svelte';
	import { formatCurrency } from '$lib/utils/format.js';

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

	type MonthlyData = {
		month: string;
		monthKey: string;
		income: number;
		expenses: number;
		profit: number;
	};

	type Props = {
		data: MonthlyData[];
		loading?: boolean;
	};

	let { data, loading = false }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	function createChart() {
		if (!canvas || data.length === 0) return;

		if (chart) {
			chart.destroy();
		}

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: data.map((d) => d.month),
				datasets: [
					{
						label: 'الإيرادات',
						data: data.map((d) => d.income),
						borderColor: 'rgb(34, 197, 94)',
						backgroundColor: 'rgba(34, 197, 94, 0.1)',
						fill: true,
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6,
					},
					{
						label: 'المصروفات',
						data: data.map((d) => d.expenses),
						borderColor: 'rgb(239, 68, 68)',
						backgroundColor: 'rgba(239, 68, 68, 0.1)',
						fill: true,
						tension: 0.3,
						pointRadius: 4,
						pointHoverRadius: 6,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: 'index',
				},
				plugins: {
					legend: {
						position: 'top',
						align: 'start',
						rtl: true,
						labels: {
							usePointStyle: true,
							padding: 16,
							font: { size: 12 },
						},
					},
					tooltip: {
						rtl: true,
						textDirection: 'rtl',
						callbacks: {
							label(context) {
								const label = context.dataset.label ?? '';
								const val = formatCurrency(context.parsed.y ?? 0);
								return `${label}: ${val}`;
							},
						},
					},
				},
				scales: {
					x: {
						grid: { display: false },
						ticks: {
							font: { size: 11 },
							maxRotation: 45,
						},
					},
					y: {
						beginAtZero: true,
						grid: { color: 'rgba(0, 0, 0, 0.06)' },
						ticks: {
							font: { size: 11 },
							callback(value) {
								return formatCurrency(value as number);
							},
						},
					},
				},
			},
		});
	}

	onMount(() => {
		if (!loading && data.length > 0) {
			createChart();
		}
	});

	$effect(() => {
		// Re-create chart when data changes
		if (data && !loading && canvas) {
			createChart();
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});
</script>

<ChartContainer title="الإيرادات مقابل المصروفات" {loading} empty={data.length === 0}>
	<div class="h-64">
		<canvas bind:this={canvas}></canvas>
	</div>
</ChartContainer>
