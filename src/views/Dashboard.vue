<script setup>
import PlansAnnualView from '@/components/dashboard/pgd/PlansAnnualView.vue';
import PlansFilterBar from '@/components/dashboard/pgd/PlansFilterBar.vue';
import PlansMonthlyView from '@/components/dashboard/pgd/PlansMonthlyView.vue';
import PlansTableView from '@/components/dashboard/pgd/PlansTableView.vue';
import { useJobPlanStore } from '@/stores/useJobPlanStore';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Tab from 'primevue/tab';
import TabList from 'primevue/tablist';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import Tag from 'primevue/tag';
import { computed } from 'vue';

const store = useJobPlanStore();
const {
    activeTab,
    isFilterExpanded,
    activeFiltersCount,
    filteredYearPlans,
    filteredMonthPlans,
    yearPlans,
    loadedYear,
    selectedYear,
    isLoadingYear,
    isPlansLoaded
} = storeToRefs(store);

const isLoading = computed(() => isLoadingYear.value || !isPlansLoaded.value);
const currentYear = computed(() => loadedYear.value || selectedYear.value);

const currentFilteredCount = computed(() => {
    if (activeTab.value === 'annual') {
        return filteredYearPlans.value?.length || 0;
    }
    return filteredMonthPlans.value?.length || 0;
});

const totalAvailableCount = computed(() => yearPlans.value?.length || 0);

const toggleFilters = () => {
    store.toggleFilterExpanded();
};

const clearAllFilters = () => {
    store.clearAllFilters();
};
</script>

<template>
    <div class="flex flex-col gap-5">
        <!-- Card Unificado de Controle: Abas + Contadores + Botão de Filtros + Painel de Filtros Logo Abaixo -->
        <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700 flex flex-col gap-4 p-4 sm:p-5">
            <Tabs v-model:value="activeTab" class="w-full">
                <!-- Linha do Cabeçalho com Abas à esquerda e Informações/Ações à direita -->
                <div class="flex flex-wrap items-center justify-between gap-3 border-b border-surface-200 dark:border-surface-700 pb-2">
                    <!-- Abas de Navegação -->
                    <TabList class="!border-b-0">
                        <Tab value="monthly" class="flex items-center gap-2 font-semibold text-sm">
                            <i class="pi pi-calendar text-primary" />
                            <span>Visão Mensal</span>
                        </Tab>
                        <Tab value="annual" class="flex items-center gap-2 font-semibold text-sm">
                            <i class="pi pi-chart-line text-primary" />
                            <span>Visão Anual</span>
                        </Tab>
                        <Tab value="table" class="flex items-center gap-2 font-semibold text-sm">
                            <i class="pi pi-list text-primary" />
                            <span>Listagem Geral</span>
                        </Tab>
                    </TabList>

                    <!-- Informações e Botão Recolher/Expandir Filtros -->
                    <div class="flex items-center gap-2.5">
                        <span v-if="!isLoading" class="text-xs text-muted-color hidden md:inline">
                            Mostrando <strong class="text-primary">{{ currentFilteredCount }}</strong> de {{ totalAvailableCount }} planos em {{ currentYear }}
                        </span>

                        <Tag
                            v-if="activeFiltersCount > 0"
                            :value="`${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''}`"
                            severity="info"
                            rounded
                            class="!text-xs"
                        />

                        <Button
                            v-if="activeFiltersCount > 0"
                            icon="pi pi-filter-slash"
                            label="Limpar"
                            size="small"
                            severity="secondary"
                            text
                            class="!text-xs !py-1 !px-2"
                            @click="clearAllFilters"
                        />

                        <Button
                            :icon="isFilterExpanded ? 'pi pi-chevron-up' : 'pi pi-filter'"
                            :label="isFilterExpanded ? 'Recolher Filtros' : 'Filtros'"
                            size="small"
                            severity="primary"
                            :outlined="isFilterExpanded"
                            class="!text-xs !py-1.5 !px-3 shadow-sm font-medium"
                            @click="toggleFilters"
                        />
                    </div>
                </div>

                <!-- Filtros Apresentados Logo Abaixo das Abas -->
                <div class="pt-3">
                    <PlansFilterBar />
                </div>

                <!-- Conteúdo das Abas -->
                <TabPanels class="!bg-transparent !p-0 !pt-4">
                    <!-- Aba 1: Visão Mensal -->
                    <TabPanel value="monthly" class="!p-0">
                        <PlansMonthlyView />
                    </TabPanel>

                    <!-- Aba 2: Visão Anual -->
                    <TabPanel value="annual" class="!p-0">
                        <PlansAnnualView />
                    </TabPanel>

                    <!-- Aba 3: Listagem Geral -->
                    <TabPanel value="table" class="!p-0">
                        <PlansTableView />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>
