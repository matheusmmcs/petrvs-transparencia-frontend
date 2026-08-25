<script setup>
import { MODALIDADE, MODALIDADE_COLORS, MODALIDADE_LABELS, STATUS, STATUS_COLORS, STATUS_LABELS } from '@/constants';
import { useJobPlanStore } from '@/stores/useJobPlanStore';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { computed } from 'vue';

const store = useJobPlanStore();
const { annualKPIs, annualStats, selectedYear, loadedYear, filteredYearPlans, isLoadingYear, isPlansLoaded } = storeToRefs(store);

const isLoading = computed(() => isLoadingYear.value || !isPlansLoaded.value);
const currentYear = computed(() => loadedYear.value || selectedYear.value);
const hasPlans = computed(() => Array.isArray(filteredYearPlans.value) && filteredYearPlans.value.length > 0);

const isCurrentYear = computed(() => {
    const now = new Date().getFullYear();
    return currentYear.value === now;
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
                fill: false
            },
            {
                type: 'bar',
                label: STATUS_LABELS[STATUS.CONCLUIDO],
                data: stats.map((s) => s.status[STATUS.CONCLUIDO] || 0),
                backgroundColor: STATUS_COLORS[STATUS.CONCLUIDO],
                stack: 'status'
            },
            {
                type: 'bar',
                label: STATUS_LABELS[STATUS.ATIVO],
                data: stats.map((s) => s.status[STATUS.ATIVO] || 0),
                backgroundColor: STATUS_COLORS[STATUS.ATIVO],
                stack: 'status'
            },
            {
                type: 'bar',
                label: STATUS_LABELS[STATUS.AGUARDANDO_ASSINATURA],
                data: stats.map((s) => s.status[STATUS.AGUARDANDO_ASSINATURA] || 0),
                backgroundColor: STATUS_COLORS[STATUS.AGUARDANDO_ASSINATURA],
                stack: 'status'
            },
            {
                type: 'bar',
                label: STATUS_LABELS[STATUS.INCLUIDO],
                data: stats.map((s) => s.status[STATUS.INCLUIDO] || 0),
                backgroundColor: STATUS_COLORS[STATUS.INCLUIDO],
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
            grid: { display: false }
        },
        y: {
            stacked: true,
            beginAtZero: true,
            ticks: { precision: 0 }
        }
    }
};
</script>

<template>
    <div class="col-span-12 flex flex-col gap-5">
        <!-- Barra de Navegação Rápida entre Anos -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-surface-50 dark:bg-surface-800/40 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700">
            <div class="flex items-center gap-1.5">
                <Button
                    icon="pi pi-chevron-left"
                    size="small"
                    severity="secondary"
                    text
                    rounded
                    class="!w-8 !h-8"
                    @click="store.previousYear()"
                    title="Ano Anterior"
                />
                <span class="font-bold text-base text-surface-900 dark:text-surface-0 min-w-[140px] text-center select-none">
                    Exercício {{ currentYear }}
                </span>
                <Button
                    icon="pi pi-chevron-right"
                    size="small"
                    severity="secondary"
                    text
                    rounded
                    class="!w-8 !h-8"
                    @click="store.nextYear()"
                    title="Próximo Ano"
                />
            </div>

            <div class="flex items-center gap-2">
                <Button
                    v-if="!isCurrentYear"
                    label="Ano Atual"
                    icon="pi pi-calendar"
                    size="small"
                    severity="secondary"
                    outlined
                    class="!text-xs !py-1 !px-2.5"
                    @click="store.setSelectedDate(new Date())"
                />
                <Tag :value="`${annualKPIs.total} planos no ano`" severity="primary" rounded class="!text-xs" />
            </div>
        </div>

        <!-- 4 KPI Cards Anuais -->
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex justify-between items-center p-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-1">Total no Ano</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                            {{ annualKPIs.total }}
                        </div>
                        <span class="text-xs text-muted-color">Exercício {{ currentYear }}</span>
                    </div>
                    <div class="flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 rounded-lg w-12 h-12">
                        <i class="pi pi-calendar text-primary text-xl" />
                    </div>
                </div>
            </div>

            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex justify-between items-center p-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-1">Mês de Pico</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                            {{ annualKPIs.peakMonth?.monthName || 'N/A' }}
                        </div>
                        <span class="text-xs text-muted-color">{{ annualKPIs.peakMonth?.total || 0 }} planos</span>
                    </div>
                    <div class="flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 rounded-lg w-12 h-12">
                        <i class="pi pi-chart-line text-indigo-600 text-xl" />
                    </div>
                </div>
            </div>

            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex flex-col justify-between p-4 h-full">
                    <div class="flex justify-between items-start mb-1">
                        <span class="block text-muted-color font-medium text-sm">Modalidades no Ano</span>
                        <div class="flex items-center justify-center bg-teal-100 dark:bg-teal-900/40 rounded-lg w-8 h-8">
                            <i class="pi pi-desktop text-teal-600 text-sm" />
                        </div>
                    </div>
                    <div class="flex flex-col gap-1 mt-0.5">
                        <div class="flex items-center justify-between text-xs">
                            <span class="flex items-center gap-1.5 text-surface-700 dark:text-surface-300">
                                <span class="w-2 h-2 rounded-full inline-block" :style="{ backgroundColor: MODALIDADE_COLORS[MODALIDADE.INTEGRAL] }"></span>
                                Teletrab. (Integral):
                            </span>
                            <strong class="font-bold text-surface-900 dark:text-surface-0">{{ annualKPIs.modalityPercentages?.integral || '0.0' }}%</strong>
                        </div>
                        <div class="flex items-center justify-between text-xs">
                            <span class="flex items-center gap-1.5 text-surface-700 dark:text-surface-300">
                                <span class="w-2 h-2 rounded-full inline-block" :style="{ backgroundColor: MODALIDADE_COLORS[MODALIDADE.PARCIAL] }"></span>
                                Teletrab. (Parcial):
                            </span>
                            <strong class="font-bold text-surface-900 dark:text-surface-0">{{ annualKPIs.modalityPercentages?.parcial || '0.0' }}%</strong>
                        </div>
                        <div class="flex items-center justify-between text-xs">
                            <span class="flex items-center gap-1.5 text-surface-700 dark:text-surface-300">
                                <span class="w-2 h-2 rounded-full inline-block" :style="{ backgroundColor: MODALIDADE_COLORS[MODALIDADE.PRESENCIAL] }"></span>
                                Presencial:
                            </span>
                            <strong class="font-bold text-surface-900 dark:text-surface-0">{{ annualKPIs.modalityPercentages?.presencial || '0.0' }}%</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex justify-between items-center p-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-1">Unidades Participantes</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                            {{ annualKPIs.totalUnits }}
                        </div>
                        <span class="text-xs text-muted-color">Com planos registrados</span>
                    </div>
                    <div class="flex items-center justify-center bg-amber-100 dark:bg-amber-900/40 rounded-lg w-12 h-12">
                        <i class="pi pi-building text-amber-600 text-xl" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 2 Gráficos Anuais -->
        <div class="grid grid-cols-12 gap-6">
            <!-- Gráfico Anual por Situação -->
            <div class="col-span-12 xl:col-span-6 flex">
                <div class="card mb-0 flex flex-col w-full min-h-[380px] shadow-sm border border-surface-200 dark:border-surface-700 relative">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-bold text-base text-surface-900 dark:text-surface-0">
                            Evolução Mensal por Situação ({{ currentYear }})
                        </span>
                        <Tag :value="`${annualKPIs.total} planos`" severity="info" rounded />
                    </div>

                    <Chart
                        type="bar"
                        :data="chartDataStatus"
                        :options="chartOptions"
                        :class="!hasPlans ? 'opacity-0 h-0' : 'min-h-[280px]'"
                    />

                    <div v-if="!hasPlans && !isLoading" class="h-full flex items-center justify-center">
                        <span class="text-muted-color text-sm">Nenhum plano encontrado para o ano {{ currentYear }}.</span>
                    </div>

                    <div v-if="isLoading" class="overlay flex justify-center items-center absolute inset-0 bg-white/60 dark:bg-black/60 z-10 rounded-lg">
                        <ProgressSpinner style="width: 44px; height: 44px" />
                    </div>
                </div>
            </div>

            <!-- Gráfico Anual por Modalidade -->
            <div class="col-span-12 xl:col-span-6 flex">
                <div class="card mb-0 flex flex-col w-full min-h-[380px] shadow-sm border border-surface-200 dark:border-surface-700 relative">
                    <div class="flex justify-between items-center mb-3">
                        <span class="font-bold text-base text-surface-900 dark:text-surface-0">
                            Evolução Mensal por Modalidade ({{ currentYear }})
                        </span>
                        <Tag :value="`${annualKPIs.total} planos`" severity="info" rounded />
                    </div>

                    <Chart
                        type="bar"
                        :data="chartDataModalidade"
                        :options="chartOptions"
                        :class="!hasPlans ? 'opacity-0 h-0' : 'min-h-[280px]'"
                    />

                    <div v-if="!hasPlans && !isLoading" class="h-full flex items-center justify-center">
                        <span class="text-muted-color text-sm">Nenhum plano encontrado para o ano {{ currentYear }}.</span>
                    </div>

                    <div v-if="isLoading" class="overlay flex justify-center items-center absolute inset-0 bg-white/60 dark:bg-black/60 z-10 rounded-lg">
                        <ProgressSpinner style="width: 44px; height: 44px" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabela de Resumo Mês a Mês do Ano -->
        <div class="col-span-12">
            <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex items-center gap-2 mb-4">
                    <i class="pi pi-list text-primary" />
                    <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Detalhamento Mês a Mês ({{ currentYear }})</span>
                </div>

                <DataTable
                    :value="annualStats"
                    dataKey="monthIndex"
                    :rowHover="true"
                    showGridlines
                    responsiveLayout="scroll"
                >
                    <Column field="monthName" header="Mês" style="width: 100px; font-weight: bold" />
                    <Column field="total" header="Total de Planos" style="width: 130px; text-align: center" sortable>
                        <template #body="{ data }">
                            <span class="font-semibold">{{ data.total }}</span>
                        </template>
                    </Column>
                    <Column header="Ativos" style="width: 100px; text-align: center">
                        <template #body="{ data }">
                            <span class="text-blue-600 font-medium">{{ data.status.ATIVO }}</span>
                        </template>
                    </Column>
                    <Column header="Concluídos" style="width: 110px; text-align: center">
                        <template #body="{ data }">
                            <span class="text-emerald-600 font-medium">{{ data.status.CONCLUIDO }}</span>
                        </template>
                    </Column>
                    <Column header="Aguard. Assinatura" style="width: 140px; text-align: center">
                        <template #body="{ data }">
                            <span class="text-amber-600 font-medium">{{ data.status.AGUARDANDO_ASSINATURA }}</span>
                        </template>
                    </Column>
                    <Column header="Incluídos" style="width: 100px; text-align: center">
                        <template #body="{ data }">
                            <span class="text-rose-600 font-medium">{{ data.status.INCLUIDO }}</span>
                        </template>
                    </Column>
                    <Column header="Teletrabalho (Integral)" style="width: 170px; text-align: center">
                        <template #body="{ data }">
                            {{ data.modalidades.integral }}
                        </template>
                    </Column>
                    <Column header="Teletrabalho (Parcial)" style="width: 160px; text-align: center">
                        <template #body="{ data }">
                            {{ data.modalidades.parcial }}
                        </template>
                    </Column>
                    <Column header="Presencial" style="width: 120px; text-align: center">
                        <template #body="{ data }">
                            {{ data.modalidades.presencial }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
