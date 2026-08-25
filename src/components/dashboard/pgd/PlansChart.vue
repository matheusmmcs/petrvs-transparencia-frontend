<script setup>
import { MODALIDADE, MODALIDADE_COLORS, MODALIDADE_LABELS, formatModalidade } from '@/constants';
import { useJobPlanStore } from '@/stores/useJobPlanStore';
import { storeToRefs } from 'pinia';
import ProgressSpinner from 'primevue/progressspinner';
import { computed, ref, watch } from 'vue';

const store = useJobPlanStore();
const { isPlansLoaded, filteredPlans } = storeToRefs(store);

const isLoading = ref(false);

const TOTAL_UNIDADES = 15;

watch(
    isPlansLoaded,
    () => {
        isLoading.value = !isPlansLoaded.value;
    },
    { deep: true }
);

const statusColors = {
    INCLUIDO: '#FF6384',
    ATIVO: '#36A2EB',
    AGUARDANDO_ASSINATURA: '#FFCE56',
    CONCLUIDO: '#4BC0C0'
};

// Função para gerar escala de azul (do mais escuro para o mais claro)
const generateColorShades = (count) => {
    const shades = [];
    const randomRed = 50; //Math.floor(Math.random() * (200 - 10 + 1)) + 10;
    const randomGreen = 210; //Math.floor(Math.random() * (200 - 100 + 1)) + 100;
    for (let i = 0; i < count; i++) {
        const intensity = Math.floor(255 - (i * 200) / count);
        shades.push(`rgb(${randomRed}, ${randomGreen}, ${255 - intensity})`);
    }
    return shades;
};

const hasPlans = computed(() => filteredPlans?.value?.length > 0);

const chartData = computed(() => {
    const status = {},
        unidades = {},
        modalidades = {};

    (filteredPlans.value || []).forEach((plano) => {
        const s = plano.plano_trabalho_status;
        status[s] = (status[s] || 0) + 1;

        const u = plano.unidade_sigla;
        unidades[u] = (unidades[u] || 0) + 1;

        const m = plano.modalidade_nome;
        modalidades[m] = (modalidades[m] || 0) + 1;
    });

    const totalStatus = Object.values(status).reduce((sum, value) => sum + value, 0);
    const totalModalidades = Object.values(modalidades).reduce((sum, value) => sum + value, 0);

    // Ordena as unidades pelas que possuem mais planos e pega as 10 primeiras
    const sortedUnidades = Object.entries(unidades)
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOTAL_UNIDADES);
    const sortedStatus = Object.entries(status).sort((a, b) => b[1] - a[1]);
    const sortedModalidades = Object.entries(modalidades).sort((a, b) => b[1] - a[1]);

    const getModalidadeCount = (name) => {
        if (!name) return 0;
        const target = name.toLowerCase();
        for (const [key, val] of Object.entries(modalidades)) {
            if (key && key.toLowerCase() === target) {
                return val;
            }
        }
        return 0;
    };

    const stackedModalidades = {
        [MODALIDADE.INTEGRAL]: {
            data: getModalidadeCount(MODALIDADE.INTEGRAL),
            color: MODALIDADE_COLORS[MODALIDADE.INTEGRAL],
            label: MODALIDADE_LABELS[MODALIDADE.INTEGRAL]
        },
        [MODALIDADE.PARCIAL]: {
            data: getModalidadeCount(MODALIDADE.PARCIAL),
            color: MODALIDADE_COLORS[MODALIDADE.PARCIAL],
            label: MODALIDADE_LABELS[MODALIDADE.PARCIAL]
        },
        [MODALIDADE.PRESENCIAL]: {
            data: getModalidadeCount(MODALIDADE.PRESENCIAL),
            color: MODALIDADE_COLORS[MODALIDADE.PRESENCIAL],
            label: MODALIDADE_LABELS[MODALIDADE.PRESENCIAL]
        }
    };

    const pctIntegral = totalModalidades > 0 ? ((stackedModalidades[MODALIDADE.INTEGRAL].data / totalModalidades) * 100).toFixed(1) : '0.0';
    const pctParcial = totalModalidades > 0 ? ((stackedModalidades[MODALIDADE.PARCIAL].data / totalModalidades) * 100).toFixed(1) : '0.0';
    const pctPresencial = totalModalidades > 0 ? ((stackedModalidades[MODALIDADE.PRESENCIAL].data / totalModalidades) * 100).toFixed(1) : '0.0';

    return {
        modalidades: {
            labels: ['Modalidades'],
            datasets: [
                {
                    type: 'bar',
                    label: `${stackedModalidades[MODALIDADE.INTEGRAL].label} (${pctIntegral}%)`,
                    backgroundColor: stackedModalidades[MODALIDADE.INTEGRAL].color,
                    data: [stackedModalidades[MODALIDADE.INTEGRAL].data]
                },
                {
                    type: 'bar',
                    label: `${stackedModalidades[MODALIDADE.PARCIAL].label} (${pctParcial}%)`,
                    backgroundColor: stackedModalidades[MODALIDADE.PARCIAL].color,
                    data: [stackedModalidades[MODALIDADE.PARCIAL].data]
                },
                {
                    type: 'bar',
                    label: `${stackedModalidades[MODALIDADE.PRESENCIAL].label} (${pctPresencial}%)`,
                    backgroundColor: stackedModalidades[MODALIDADE.PRESENCIAL].color,
                    data: [stackedModalidades[MODALIDADE.PRESENCIAL].data],
                    borderSkipped: true,
                    borderRadius: {
                        topLeft: 8,
                        topRight: 8
                    }
                }
            ]
        },
        unidades: {
            labels: sortedUnidades.map(([unidade]) => unidade),
            datasets: [
                {
                    label: 'Planos por Unidade',
                    backgroundColor: generateColorShades(sortedUnidades.length),
                    data: sortedUnidades.map((entry) => entry[1])
                }
            ]
        },
        status: {
            labels: Object.keys(status).map((label) => {
                const value = status[label];
                const percentage = ((value / totalStatus) * 100).toFixed(1);
                return `${label} (${percentage}%)`;
            }),
            datasets: [
                {
                    label: 'Status',
                    backgroundColor: Object.keys(status).map((status) => statusColors[status] || '#CCCCCC'),
                    data: Object.values(status)
                }
            ]
        },
        maxPlansUnidade: sortedUnidades[0],
        maxStatus: sortedStatus[0],
        maxModalidades: sortedModalidades[0] ? [formatModalidade(sortedModalidades[0][0]), sortedModalidades[0][1]] : null
    };
});

const chartOptions = {
    doughnut: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'start'
            }
        }
    },
    bar: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        }
    },
    stackedbar: {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                align: 'start'
            }
        },
        scales: {
            x: {
                stacked: true
            },
            y: {
                stacked: true
            }
        }
    }
};
</script>

<template>
    <div class="col-span-12 lg:col-span-6 xl:col-span-6 flex">
        <div class="card mb-0 flex flex-col w-full min-h-[300px] relative">
            <div class="flex justify-start mb-4 gap-2 align-middle">
                <span class="block text-surface-900 dark:text-surface-0 font-medium text-lg">Planos por Unidade Executora</span>
            </div>

            <!-- Exibe o gráfico apenas quando a variável "plans" não for nula ou vazia -->
            <Chart type="bar" :data="chartData.unidades" :options="chartOptions.bar" :class="!hasPlans ? 'opacity-0 h-0 min-h-[0px]' : 'min-h-[250px]'" />
            <div v-if="!isLoading" class="h-full">
                <div v-if="hasPlans && chartData.maxPlansUnidade && chartData.maxPlansUnidade[0] && chartData.maxPlansUnidade[1]">
                    <span class="text-muted-color mr-2">Unidade</span>
                    <span class="text-primary font-medium mr-2">{{ chartData.maxPlansUnidade[0] }}</span>
                    <span class="text-muted-color mr-2">lidera com</span>
                    <span class="text-primary font-medium mr-2">{{ chartData.maxPlansUnidade[1] }}</span>
                    <span class="text-muted-color">planos.</span>
                </div>
                <div v-else class="h-full flex flex-col justify-center">
                    <span class="text-muted-color text-center">Nenhuma unidade encontrada.</span>
                </div>
            </div>
            <div v-if="isLoading" class="flex justify-center items-center absolute inset-0 bg-white bg-opacity-50 z-10">
                <ProgressSpinner style="width: 50px; height: 50px" />
            </div>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-6 flex">
        <div class="card mb-0 flex flex-col w-full min-h-[300px] relative">
            <div class="flex justify-start mb-4 gap-2 align-middle">
                <span class="block text-surface-900 dark:text-surface-0 font-medium text-lg">Modalidades de Execução</span>
            </div>

            <!-- Exibe o gráfico apenas quando a variável "plans" não for nula ou vazia -->
            <Chart type="bar" :data="chartData.modalidades" :options="chartOptions.stackedbar" :class="!hasPlans ? 'opacity-0 h-0 min-h-[0px]' : 'min-h-[250px]'" />
            <div v-if="!isLoading" class="h-full">
                <div v-if="hasPlans && chartData.maxModalidades && chartData.maxModalidades[0] && chartData.maxModalidades[1]">
                    <span class="text-primary font-medium mr-2">{{ chartData.maxModalidades[1] }}</span>
                    <span class="text-muted-color mr-2">servidores em</span>
                    <span class="text-primary font-medium mr-2">{{ chartData.maxModalidades[0] }}</span>
                    <span class="text-muted-color">.</span>
                </div>
                <div v-else class="h-full flex flex-col justify-center">
                    <span class="text-muted-color text-center">Nenhum plano encontrado.</span>
                </div>
            </div>
            <div v-if="isLoading" class="flex justify-center items-center absolute inset-0 bg-white bg-opacity-50 z-10">
                <ProgressSpinner style="width: 50px; height: 50px" />
            </div>
        </div>
    </div>
    <div class="col-span-12 lg:col-span-6 xl:col-span-6 flex">
        <div class="card mb-0 flex flex-col w-full min-h-[300px] relative">
            <div class="flex justify-start mb-4 gap-2 align-middle">
                <span class="block text-surface-900 dark:text-surface-0 font-medium text-lg">Situações dos Planos</span>
            </div>

            <!-- Exibe o gráfico apenas quando a variável "plans" não for nula ou vazia -->
            <Chart type="doughnut" :data="chartData.status" :options="chartOptions.doughnut" :class="!hasPlans ? 'opacity-0 h-0 min-h-[0px]' : 'min-h-[250px]'" />
            <div v-if="!isLoading" class="h-full">
                <div v-if="hasPlans && chartData.maxStatus && chartData.maxStatus[0] && chartData.maxStatus[1]">
                    <span class="text-muted-color mr-2">Há</span>
                    <span class="text-primary font-medium mr-2">{{ chartData.maxStatus[1] }}</span>
                    <span class="text-muted-color mr-2">planos na situação</span>
                    <span class="text-primary font-medium mr-2">{{ chartData.maxStatus[0] }}</span>
                    <span class="text-muted-color">.</span>
                </div>
                <div v-else class="h-full flex flex-col justify-center">
                    <span class="text-muted-color text-center">Nenhum plano encontrado.</span>
                </div>
            </div>
            <div v-if="isLoading" class="flex justify-center items-center absolute inset-0 bg-white bg-opacity-50 z-10">
                <ProgressSpinner style="width: 50px; height: 50px" />
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Estilos para a sobreposição (overlay) */
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}
</style>
