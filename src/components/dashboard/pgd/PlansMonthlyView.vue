<script setup>
import { MODALIDADE, MODALIDADE_COLORS, MODALIDADE_LABELS, STATUS, STATUS_COLORS, STATUS_LABELS, formatModalidade, formatStatus, getStatusSeverity } from '@/constants';
import { useJobPlanStore } from '@/stores/useJobPlanStore';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { computed } from 'vue';

const store = useJobPlanStore();
const { filteredMonthPlans, monthlyKPIs, selectedDate, isLoadingYear, isPlansLoaded } = storeToRefs(store);

const isLoading = computed(() => isLoadingYear.value || !isPlansLoaded.value);
const hasPlans = computed(() => Array.isArray(filteredMonthPlans.value) && filteredMonthPlans.value.length > 0);

const monthYearFormatted = computed(() => {
    const d = selectedDate.value || new Date();
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
});

const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentMonthName = computed(() => {
    const d = selectedDate.value || new Date();
    return monthNames[d.getMonth()];
});

const currentYear = computed(() => {
    const d = selectedDate.value || new Date();
    return d.getFullYear();
});

const isCurrentMonth = computed(() => {
    const d = selectedDate.value || new Date();
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
});

const TOTAL_UNIDADES = 10;

const generateColorShades = (count) => {
    const shades = [];
    const randomRed = 50;
    const randomGreen = 180;
    for (let i = 0; i < count; i++) {
        const intensity = Math.floor(255 - (i * 180) / Math.max(count, 1));
        shades.push(`rgb(${randomRed}, ${randomGreen}, ${255 - intensity})`);
    }
    return shades;
};

const chartData = computed(() => {
    const status = {};
    const unidades = {};
    const modalidades = {};

    (filteredMonthPlans.value || []).forEach((plano) => {
        const s = plano.plano_trabalho_status;
        if (s) status[s] = (status[s] || 0) + 1;

        const u = plano.unidade_sigla;
        if (u) unidades[u] = (unidades[u] || 0) + 1;

        const m = (plano.modalidade_nome || '').toLowerCase().trim();
        if (m.includes('integral')) modalidades[MODALIDADE.INTEGRAL] = (modalidades[MODALIDADE.INTEGRAL] || 0) + 1;
        else if (m.includes('parcial')) modalidades[MODALIDADE.PARCIAL] = (modalidades[MODALIDADE.PARCIAL] || 0) + 1;
        else if (m.includes('presencial')) modalidades[MODALIDADE.PRESENCIAL] = (modalidades[MODALIDADE.PRESENCIAL] || 0) + 1;
    });

    const totalStatus = Object.values(status).reduce((sum, value) => sum + value, 0);
    const totalModalidades = Object.values(modalidades).reduce((sum, value) => sum + value, 0);

    const sortedUnidades = Object.entries(unidades)
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOTAL_UNIDADES);

    const pctIntegral = totalModalidades > 0 ? (((modalidades[MODALIDADE.INTEGRAL] || 0) / totalModalidades) * 100).toFixed(1) : '0.0';
    const pctParcial = totalModalidades > 0 ? (((modalidades[MODALIDADE.PARCIAL] || 0) / totalModalidades) * 100).toFixed(1) : '0.0';
    const pctPresencial = totalModalidades > 0 ? (((modalidades[MODALIDADE.PRESENCIAL] || 0) / totalModalidades) * 100).toFixed(1) : '0.0';

    return {
        unidades: {
            labels: sortedUnidades.map(([unidade]) => unidade),
            datasets: [
                {
                    label: 'Planos por Unidade',
                    backgroundColor: generateColorShades(sortedUnidades.length),
                    data: sortedUnidades.map((entry) => entry[1]),
                    borderRadius: 4
                }
            ]
        },
        modalidades: {
            labels: ['Modalidades'],
            datasets: [
                {
                    type: 'bar',
                    label: `${MODALIDADE_LABELS[MODALIDADE.INTEGRAL]} (${pctIntegral}%)`,
                    backgroundColor: MODALIDADE_COLORS[MODALIDADE.INTEGRAL],
                    data: [modalidades[MODALIDADE.INTEGRAL] || 0]
                },
                {
                    type: 'bar',
                    label: `${MODALIDADE_LABELS[MODALIDADE.PARCIAL]} (${pctParcial}%)`,
                    backgroundColor: MODALIDADE_COLORS[MODALIDADE.PARCIAL],
                    data: [modalidades[MODALIDADE.PARCIAL] || 0]
                },
                {
                    type: 'bar',
                    label: `${MODALIDADE_LABELS[MODALIDADE.PRESENCIAL]} (${pctPresencial}%)`,
                    backgroundColor: MODALIDADE_COLORS[MODALIDADE.PRESENCIAL],
                    data: [modalidades[MODALIDADE.PRESENCIAL] || 0],
                    borderRadius: { topLeft: 6, topRight: 6 }
                }
            ]
        },
        status: {
            labels: Object.keys(status).map((s) => {
                const val = status[s];
                const pct = totalStatus > 0 ? ((val / totalStatus) * 100).toFixed(1) : '0.0';
                return `${STATUS_LABELS[s] || s} (${pct}%)`;
            }),
            datasets: [
                {
                    label: 'Status',
                    backgroundColor: Object.keys(status).map((s) => STATUS_COLORS[s] || '#CCCCCC'),
                    data: Object.values(status)
                }
            ]
        }
    };
});

const chartOptions = {
    bar: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { precision: 0 } }
        }
    },
    stackedbar: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'bottom', align: 'start' }
        },
        scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } }
        }
    },
    doughnut: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: true, position: 'bottom', align: 'start' }
        }
    }
};

const formatDate = (value) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
};

const goToTableView = () => {
    store.setActiveTab('table');
};
</script>

<template>
    <div class="col-span-12 flex flex-col gap-5">
        <!-- Barra de Navegação Rápida entre Meses -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-surface-50 dark:bg-surface-800/40 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700">
            <div class="flex items-center gap-1.5">
                <Button
                    icon="pi pi-chevron-left"
                    size="small"
                    severity="secondary"
                    text
                    rounded
                    class="!w-8 !h-8"
                    @click="store.previousMonth()"
                    title="Mês Anterior"
                />
                <span class="font-bold text-base text-surface-900 dark:text-surface-0 min-w-[150px] text-center select-none">
                    {{ currentMonthName }} de {{ currentYear }}
                </span>
                <Button
                    icon="pi pi-chevron-right"
                    size="small"
                    severity="secondary"
                    text
                    rounded
                    class="!w-8 !h-8"
                    @click="store.nextMonth()"
                    title="Próximo Mês"
                />
            </div>

            <div class="flex items-center gap-2">
                <Button
                    v-if="!isCurrentMonth"
                    label="Mês Atual"
                    icon="pi pi-calendar"
                    size="small"
                    severity="secondary"
                    outlined
                    class="!text-xs !py-1 !px-2.5"
                    @click="store.setSelectedDate(new Date())"
                />
                <Tag :value="`${filteredMonthPlans?.length || 0} planos no mês`" severity="primary" rounded class="!text-xs" />
            </div>
        </div>

        <!-- 4 KPI Cards Mensais -->
        <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex justify-between items-center p-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-1">Total no Mês</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-2xl">
                            {{ monthlyKPIs.total }}
                        </div>
                        <span class="text-xs text-muted-color">Ref: {{ monthYearFormatted }}</span>
                    </div>
                    <div class="flex items-center justify-center bg-primary-100 dark:bg-primary-900/40 rounded-lg w-12 h-12">
                        <i class="pi pi-file text-primary text-xl" />
                    </div>
                </div>
            </div>

            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex justify-between items-center p-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-1">Planos Ativos</span>
                        <div class="text-blue-600 font-bold text-2xl">
                            {{ monthlyKPIs.active }}
                        </div>
                        <span class="text-xs text-muted-color">{{ monthlyKPIs.concluded }} concluídos</span>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-900/40 rounded-lg w-12 h-12">
                        <i class="pi pi-check-circle text-blue-600 text-xl" />
                    </div>
                </div>
            </div>

            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex justify-between items-center p-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-1">Modalidade Líder</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-lg truncate max-w-[170px]" :title="monthlyKPIs.topModality?.label || 'N/A'">
                            {{ monthlyKPIs.topModality?.label || 'Nenhum' }}
                        </div>
                        <span class="text-xs text-muted-color">{{ monthlyKPIs.topModality?.count || 0 }} planos</span>
                    </div>
                    <div class="flex items-center justify-center bg-teal-100 dark:bg-teal-900/40 rounded-lg w-12 h-12">
                        <i class="pi pi-desktop text-teal-600 text-xl" />
                    </div>
                </div>
            </div>

            <div class="col-span-12 sm:col-span-6 xl:col-span-3">
                <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex justify-between items-center p-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-1">Unidade Líder</span>
                        <div class="text-surface-900 dark:text-surface-0 font-bold text-xl">
                            {{ monthlyKPIs.topUnit?.sigla || 'Nenhuma' }}
                        </div>
                        <span class="text-xs text-muted-color">{{ monthlyKPIs.topUnit?.count || 0 }} planos no mês</span>
                    </div>
                    <div class="flex items-center justify-center bg-amber-100 dark:bg-amber-900/40 rounded-lg w-12 h-12">
                        <i class="pi pi-building text-amber-600 text-xl" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 3 Gráficos Mensais -->
        <div class="grid grid-cols-12 gap-6">
            <!-- Gráfico 1: Unidades Executoras -->
            <div class="col-span-12 lg:col-span-4 flex">
                <div class="card mb-0 flex flex-col w-full min-h-[340px] shadow-sm border border-surface-200 dark:border-surface-700 relative">
                    <span class="block text-surface-900 dark:text-surface-0 font-bold text-base mb-3">
                        Top Unidades Executoras
                    </span>
                    <Chart
                        type="bar"
                        :data="chartData.unidades"
                        :options="chartOptions.bar"
                        :class="!hasPlans ? 'opacity-0 h-0' : 'min-h-[240px]'"
                    />
                    <div v-if="!hasPlans && !isLoading" class="h-full flex items-center justify-center">
                        <span class="text-muted-color text-sm">Nenhum plano encontrado no mês.</span>
                    </div>
                    <div v-if="isLoading" class="overlay flex justify-center items-center absolute inset-0 bg-white/60 dark:bg-black/60 z-10 rounded-lg">
                        <ProgressSpinner style="width: 40px; height: 40px" />
                    </div>
                </div>
            </div>

            <!-- Gráfico 2: Modalidades -->
            <div class="col-span-12 lg:col-span-4 flex">
                <div class="card mb-0 flex flex-col w-full min-h-[340px] shadow-sm border border-surface-200 dark:border-surface-700 relative">
                    <span class="block text-surface-900 dark:text-surface-0 font-bold text-base mb-3">
                        Modalidades de Execução
                    </span>
                    <Chart
                        type="bar"
                        :data="chartData.modalidades"
                        :options="chartOptions.stackedbar"
                        :class="!hasPlans ? 'opacity-0 h-0' : 'min-h-[240px]'"
                    />
                    <div v-if="!hasPlans && !isLoading" class="h-full flex items-center justify-center">
                        <span class="text-muted-color text-sm">Nenhum plano encontrado no mês.</span>
                    </div>
                    <div v-if="isLoading" class="overlay flex justify-center items-center absolute inset-0 bg-white/60 dark:bg-black/60 z-10 rounded-lg">
                        <ProgressSpinner style="width: 40px; height: 40px" />
                    </div>
                </div>
            </div>

            <!-- Gráfico 3: Situações -->
            <div class="col-span-12 lg:col-span-4 flex">
                <div class="card mb-0 flex flex-col w-full min-h-[340px] shadow-sm border border-surface-200 dark:border-surface-700 relative">
                    <span class="block text-surface-900 dark:text-surface-0 font-bold text-base mb-3">
                        Situações dos Planos
                    </span>
                    <Chart
                        type="doughnut"
                        :data="chartData.status"
                        :options="chartOptions.doughnut"
                        :class="!hasPlans ? 'opacity-0 h-0' : 'min-h-[240px]'"
                    />
                    <div v-if="!hasPlans && !isLoading" class="h-full flex items-center justify-center">
                        <span class="text-muted-color text-sm">Nenhum plano encontrado no mês.</span>
                    </div>
                    <div v-if="isLoading" class="overlay flex justify-center items-center absolute inset-0 bg-white/60 dark:bg-black/60 z-10 rounded-lg">
                        <ProgressSpinner style="width: 40px; height: 40px" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabela Resumida do Mês -->
        <div class="col-span-12">
            <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-table text-primary" />
                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">Planos de Trabalho de {{ monthYearFormatted }}</span>
                        <Tag :value="`${filteredMonthPlans?.length || 0} registros`" severity="secondary" rounded />
                    </div>
                    <Button
                        label="Ver na Listagem Completa"
                        icon="pi pi-arrow-right"
                        iconPos="right"
                        size="small"
                        outlined
                        @click="goToTableView"
                    />
                </div>

                <DataTable
                    :value="filteredMonthPlans"
                    :paginator="true"
                    :rows="5"
                    :rowsPerPageOptions="[5, 10, 20]"
                    dataKey="plano_trablho_id"
                    :rowHover="true"
                    showGridlines
                    responsiveLayout="scroll"
                >
                    <Column field="plano_trabalho_numero" header="Nº Plano" style="width: 120px" sortable />
                    <Column field="usuario_nome" header="Servidor" sortable />
                    <Column field="unidade_sigla" header="Unidade" sortable style="width: 120px" />
                    <Column field="modalidade_nome" header="Modalidade" sortable style="width: 180px">
                        <template #body="{ data }">
                            <span>{{ formatModalidade(data.modalidade_nome) }}</span>
                        </template>
                    </Column>
                    <Column field="plano_trabalho_status" header="Situação" sortable style="width: 160px">
                        <template #body="{ data }">
                            <Tag :value="formatStatus(data.plano_trabalho_status)" :severity="getStatusSeverity(data.plano_trabalho_status)" />
                        </template>
                    </Column>
                    <Column field="plano_trabalho_data_inicio" header="Início" style="width: 110px" sortable>
                        <template #body="{ data }">
                            {{ formatDate(data.plano_trabalho_data_inicio) }}
                        </template>
                    </Column>
                    <Column field="plano_trabalho_data_fim" header="Término" style="width: 110px" sortable>
                        <template #body="{ data }">
                            {{ formatDate(data.plano_trabalho_data_fim) }}
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>
