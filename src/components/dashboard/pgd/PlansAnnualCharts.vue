<script setup>
import { MODALIDADE, MODALIDADE_COLORS, MODALIDADE_LABELS } from '@/constants';
import { useJobPlanStore } from '@/stores/useJobPlanStore';
import { storeToRefs } from 'pinia';
import ProgressSpinner from 'primevue/progressspinner';
import { computed } from 'vue';

const store = useJobPlanStore();
const { isPlansLoaded, isLoadingYear, selectedYear, loadedYear, annualStats, yearPlans } = storeToRefs(store);

const isLoading = computed(() => isLoadingYear.value || !isPlansLoaded.value);
const currentYear = computed(() => loadedYear.value || selectedYear.value);

const hasPlans = computed(() => Array.isArray(yearPlans.value) && yearPlans.value.length > 0);
const totalYearPlans = computed(() => (yearPlans.value || []).length);

const statusColors = {
    INCLUIDO: '#FF6384',
    AGUARDANDO_ASSINATURA: '#FFCE56',
    ATIVO: '#36A2EB',
    CONCLUIDO: '#4BC0C0'
};

const peakMonth = computed(() => {
    const stats = annualStats.value || [];
    let max = null;
    stats.forEach((m) => {
        if (!max || m.total > max.total) {
            max = m;
        }
    });
    return max && max.total > 0 ? max : null;
});

const modalityTotals = computed(() => {
    const stats = annualStats.value || [];
    const totals = {
        [MODALIDADE.INTEGRAL]: 0,
        [MODALIDADE.PARCIAL]: 0,
        [MODALIDADE.PRESENCIAL]: 0
    };
    stats.forEach((m) => {
        totals[MODALIDADE.INTEGRAL] += m.modalidades[MODALIDADE.INTEGRAL] || 0;
        totals[MODALIDADE.PARCIAL] += m.modalidades[MODALIDADE.PARCIAL] || 0;
        totals[MODALIDADE.PRESENCIAL] += m.modalidades[MODALIDADE.PRESENCIAL] || 0;
    });
    return totals;
});

const dominantModality = computed(() => {
    const totals = modalityTotals.value;
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    if (entries.length > 0 && entries[0][1] > 0) {
        return {
            key: entries[0][0],
            label: MODALIDADE_LABELS[entries[0][0]],
            count: entries[0][1],
            percentage: totalYearPlans.value > 0 ? ((entries[0][1] / totalYearPlans.value) * 100).toFixed(1) : '0.0'
        };
    }
    return null;
});

const chartDataStatus = computed(() => {
    const stats = annualStats.value || [];
    const labels = stats.map((s) => s.monthName);

    return {
        labels,
        datasets: [
            {
                type: 'line',
                label: 'Total',
                data: stats.map((s) => s.total),
                borderColor: '#6366F1',
                backgroundColor: '#6366F1',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: false
            },
            {
                type: 'bar',
                label: 'Concluído',
                data: stats.map((s) => s.status.CONCLUIDO || 0),
                backgroundColor: statusColors.CONCLUIDO,
                stack: 'status'
            },
            {
                type: 'bar',
                label: 'Ativo',
                data: stats.map((s) => s.status.ATIVO || 0),
                backgroundColor: statusColors.ATIVO,
                stack: 'status'
            },
            {
                type: 'bar',
                label: 'Aguardando Assinatura',
                data: stats.map((s) => s.status.AGUARDANDO_ASSINATURA || 0),
                backgroundColor: statusColors.AGUARDANDO_ASSINATURA,
                stack: 'status'
            },
            {
                type: 'bar',
                label: 'Incluído',
                data: stats.map((s) => s.status.INCLUIDO || 0),
                backgroundColor: statusColors.INCLUIDO,
                stack: 'status'
            }
        ]
    };
});

const chartDataModalidade = computed(() => {
    const stats = annualStats.value || [];
    const labels = stats.map((s) => s.monthName);

    return {
        labels,
        datasets: [
            {
                type: 'line',
                label: 'Total',
                data: stats.map((s) => s.total),
                borderColor: '#6366F1',
                backgroundColor: '#6366F1',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: false
            },
            {
                type: 'bar',
                label: MODALIDADE_LABELS[MODALIDADE.INTEGRAL],
                data: stats.map((s) => s.modalidades[MODALIDADE.INTEGRAL] || 0),
                backgroundColor: MODALIDADE_COLORS[MODALIDADE.INTEGRAL],
                stack: 'modalidade'
            },
            {
                type: 'bar',
                label: MODALIDADE_LABELS[MODALIDADE.PARCIAL],
                data: stats.map((s) => s.modalidades[MODALIDADE.PARCIAL] || 0),
                backgroundColor: MODALIDADE_COLORS[MODALIDADE.PARCIAL],
                stack: 'modalidade'
            },
            {
                type: 'bar',
                label: MODALIDADE_LABELS[MODALIDADE.PRESENCIAL],
                data: stats.map((s) => s.modalidades[MODALIDADE.PRESENCIAL] || 0),
                backgroundColor: MODALIDADE_COLORS[MODALIDADE.PRESENCIAL],
                stack: 'modalidade'
            }
        ]
    };
});

const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    interaction: {
        mode: 'index',
        intersect: false
    },
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            align: 'start',
            labels: {
                usePointStyle: true,
                boxWidth: 8
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false
        }
    },
    scales: {
        x: {
            stacked: true,
            grid: {
                display: false
            }
        },
        y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
                precision: 0
            }
        }
    }
};
</script>

<template>
    <!-- Gráfico 1: Evolução Anual por Situação -->
    <div class="col-span-12 xl:col-span-6 flex">
        <div class="card mb-0 flex flex-col w-full min-h-[360px] relative">
            <div class="flex justify-between items-center mb-4">
                <span class="block text-surface-900 dark:text-surface-0 font-medium text-lg">
                    Planos por Mês e Situação ({{ currentYear }})
                </span>
                <span v-if="!isLoading && hasPlans" class="text-sm text-muted-color">
                    Total Anual: <strong class="text-primary">{{ totalYearPlans }}</strong> planos
                </span>
            </div>

            <Chart
                type="bar"
                :data="chartDataStatus"
                :options="chartOptions"
                :class="!hasPlans ? 'opacity-0 h-0 min-h-[0px]' : 'min-h-[260px]'"
            />

            <div v-if="!isLoading" class="mt-3">
                <div v-if="hasPlans && peakMonth">
                    <span class="text-muted-color mr-1">Mês com mais planos:</span>
                    <span class="text-primary font-medium mr-1">{{ peakMonth.monthName }}</span>
                    <span class="text-muted-color mr-1">com</span>
                    <span class="text-primary font-medium mr-1">{{ peakMonth.total }}</span>
                    <span class="text-muted-color">planos.</span>
                </div>
                <div v-else-if="!hasPlans" class="h-full flex flex-col justify-center py-4">
                    <span class="text-muted-color text-center">Nenhum plano encontrado para o ano {{ currentYear }}.</span>
                </div>
            </div>

            <div v-if="isLoading" class="overlay flex justify-center items-center absolute inset-0 bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 z-10 rounded-lg">
                <ProgressSpinner style="width: 50px; height: 50px" />
            </div>
        </div>
    </div>

    <!-- Gráfico 2: Evolução Anual por Modalidade de Execução -->
    <div class="col-span-12 xl:col-span-6 flex">
        <div class="card mb-0 flex flex-col w-full min-h-[360px] relative">
            <div class="flex justify-between items-center mb-4">
                <span class="block text-surface-900 dark:text-surface-0 font-medium text-lg">
                    Planos por Mês e Modalidade ({{ currentYear }})
                </span>
                <span v-if="!isLoading && hasPlans" class="text-sm text-muted-color">
                    Total Anual: <strong class="text-primary">{{ totalYearPlans }}</strong> planos
                </span>
            </div>

            <Chart
                type="bar"
                :data="chartDataModalidade"
                :options="chartOptions"
                :class="!hasPlans ? 'opacity-0 h-0 min-h-[0px]' : 'min-h-[260px]'"
            />

            <div v-if="!isLoading" class="mt-3">
                <div v-if="hasPlans && dominantModality">
                    <span class="text-muted-color mr-1">Modalidade predominante no ano:</span>
                    <span class="text-primary font-medium mr-1">{{ dominantModality.label }}</span>
                    <span class="text-muted-color mr-1">com</span>
                    <span class="text-primary font-medium mr-1">{{ dominantModality.count }}</span>
                    <span class="text-muted-color">({{ dominantModality.percentage }}%).</span>
                </div>
                <div v-else-if="!hasPlans" class="h-full flex flex-col justify-center py-4">
                    <span class="text-muted-color text-center">Nenhum plano encontrado para o ano {{ currentYear }}.</span>
                </div>
            </div>

            <div v-if="isLoading" class="overlay flex justify-center items-center absolute inset-0 bg-white bg-opacity-50 dark:bg-black dark:bg-opacity-50 z-10 rounded-lg">
                <ProgressSpinner style="width: 50px; height: 50px" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.overlay {
    backdrop-filter: blur(2px);
}
</style>
