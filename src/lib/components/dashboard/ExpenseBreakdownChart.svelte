<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart,
		DoughnutController,
		ArcElement,
		Tooltip,
		Legend,
	} from 'chart.js';
	import ChartContainer from '$lib/components/charts/ChartContainer.svelte';
	import { formatCurrency } from '$lib/utils/format.js';

	Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

	type CategoryData = {
		category: string;
		total: number;
		percentage: number;
	};

	type Props = {
		data: CategoryData[];
		loading?: boolean;
	};

	let { data, loading = false }: Props = $props();

	const COLORS = [
		'rgb(59, 130, 246)',   // blue
		'rgb(239, 68, 68)',    // red
		'rgb(34, 197, 94)',    // green
		'rgb(249, 115, 22)',   // orange
		'rgb(168, 85, 247)',   // purple
		'rgb(236, 72, 153)',   // pink
		'rgb(20, 184, 166)',   // teal
		'rgb(245, 158, 11)',   // amber
		'rgb(99, 102, 241)',   // indigo
		'rgb(107, 114, 128)',  // gray
	];

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	function createChart() {
		if (!canvas || data.length === 0) return;

		if (chart) {
			chart.destroy();
		}

		chart = new Chart(canvas, {
			type: 'doughnut',
			data: {
				labels: data.map((d) => d.category),
				datasets: [
					{
						data: data.map((d) => d.total),
						backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
						borderWidth: 2,
						borderColor: 'rgba(255, 255, 255, 0.8)',
						hoverOffset: 8,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '60%',
				plugins: {
					legend: {
						position: 'bottom',
						rtl: true,
						labels: {
							usePointStyle: true,
							padding: 12,
							font: { size: 11 },
							generateLabels(chart) {
								const original = Chart.overrides.doughnut.plugins.legend.labels.generateLabels(chart);
								return original.map((label, i) => {
									if (data[i]) {
										label.text = `${data[i].category} (${data[i].percentage}%)`;
									}
									return label;
								});
							},
						},
					},
					tooltip: {
						rtl: true,
						textDirection: 'rtl',
						callbacks: {
							label(context) {
								const idx = context.dataIndex;
								const item = data[idx];
								return `${item.category}: ${formatCurrency(item.total)} (${item.percentage}%)`;
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

<ChartContainer title="توزيع المصروفات حسب التصنيف" {loading} empty={data.length === 0}>
	<div class="h-64">
		<canvas bind:this={canvas}></canvas>
	</div>
</ChartContainer>
