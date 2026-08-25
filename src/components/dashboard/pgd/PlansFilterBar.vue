<script setup>
import { MODALIDADE_OPTIONS, STATUS_OPTIONS } from '@/constants';
import { useJobPlanStore } from '@/stores/useJobPlanStore';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Chip from 'primevue/chip';
import DatePicker from 'primevue/datepicker';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';
import { computed, onMounted, ref } from 'vue';

const store = useJobPlanStore();
const {
    selectedDate,
    dateRange,
    isRangeMode,
    selectedStatuses,
    selectedModalidades,
    selectedUnidades,
    globalSearch,
    availableUnidades,
    activeFilterBadges,
    isFilterExpanded,
    isLoadingYear,
    isPlansLoaded
} = storeToRefs(store);

const minDate = ref(new Date(2024, 10));

const isLoading = computed(() => isLoadingYear.value || !isPlansLoaded.value);

const handleDateChange = (val) => {
    if (val) {
        store.setSelectedDate(val);
    }
};

const toggleRangeMode = () => {
    store.setIsRangeMode(!isRangeMode.value);
};

const removeBadge = (badge) => {
    store.removeFilterBadge(badge);
};

onMounted(() => {
    if (!store.yearPlans) {
        store.setSelectedDate(selectedDate.value);
    }
});
</script>

<template>
    <div class="flex flex-col gap-3 relative">
        <!-- Corpo dos Filtros (Retrátil com transição suave) -->
        <div
            class="transition-all duration-300 ease-in-out overflow-hidden flex flex-col gap-3"
            :class="isFilterExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'"
        >
            <div class="bg-surface-50 dark:bg-surface-800/60 p-4 rounded-xl border border-surface-200 dark:border-surface-700 flex flex-col gap-3">
                <!-- Grade de Filtros -->
                <div class="grid grid-cols-12 gap-3">
                    <!-- Seletor de Período / Data -->
                    <div class="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-1">
                        <div class="flex justify-between items-center text-xs font-semibold text-muted-color mb-0.5">
                            <span>{{ isRangeMode ? 'Intervalo de Início' : 'Mês de Referência' }}</span>
                            <Button
                                :icon="isRangeMode ? 'pi pi-calendar' : 'pi pi-calendar-plus'"
                                :label="isRangeMode ? 'Mês' : 'Período'"
                                size="small"
                                text
                                class="!p-0 !text-xs text-primary font-medium"
                                @click="toggleRangeMode"
                            />
                        </div>
                        <DatePicker
                            v-if="!isRangeMode"
                            v-model="selectedDate"
                            view="month"
                            dateFormat="mm/yy"
                            :minDate="minDate"
                            class="w-full"
                            showIcon
                            @update:modelValue="handleDateChange"
                        />
                        <DatePicker
                            v-else
                            v-model="dateRange"
                            selectionMode="range"
                            dateFormat="dd/mm/yy"
                            placeholder="Selecione o intervalo"
                            class="w-full"
                            showIcon
                            showButtonBar
                        />
                    </div>

                    <!-- MultiSelect de Status -->
                    <div class="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-1">
                        <span class="text-xs font-semibold text-muted-color mb-0.5">Situação do Plano</span>
                        <MultiSelect
                            v-model="selectedStatuses"
                            :options="STATUS_OPTIONS"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todas as Situações"
                            :maxSelectedLabels="2"
                            class="w-full"
                        >
                            <template #option="slotProps">
                                <div class="flex items-center gap-2">
                                    <Tag :value="slotProps.option.label" :severity="slotProps.option.severity" />
                                </div>
                            </template>
                        </MultiSelect>
                    </div>

                    <!-- MultiSelect de Modalidade -->
                    <div class="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-1">
                        <span class="text-xs font-semibold text-muted-color mb-0.5">Modalidade de Execução</span>
                        <MultiSelect
                            v-model="selectedModalidades"
                            :options="MODALIDADE_OPTIONS"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todas as Modalidades"
                            :maxSelectedLabels="1"
                            class="w-full"
                        />
                    </div>

                    <!-- MultiSelect de Unidade -->
                    <div class="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col gap-1">
                        <span class="text-xs font-semibold text-muted-color mb-0.5">Unidade Executora</span>
                        <MultiSelect
                            v-model="selectedUnidades"
                            :options="availableUnidades"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todas as Unidades"
                            filter
                            :maxSelectedLabels="1"
                            class="w-full"
                        />
                    </div>
                </div>

                <!-- Busca Rápida -->
                <div class="flex flex-wrap items-center gap-3">
                    <div class="flex-1 min-w-[240px]">
                        <IconField iconPosition="left" class="w-full">
                            <InputIcon class="pi pi-search" />
                            <InputText
                                v-model="globalSearch"
                                placeholder="Pesquisa rápida (Nome do servidor, unidade, nº do plano...)"
                                class="w-full"
                            />
                        </IconField>
                    </div>
                </div>
            </div>
        </div>

        <!-- Barra de Badges / Chips de Filtros Ativos (Sempre visível abaixo das abas) -->
        <div v-if="activeFilterBadges.length > 0" class="flex flex-wrap items-center gap-2 py-1">
            <span class="text-xs text-muted-color font-medium mr-1 flex items-center gap-1">
                <i class="pi pi-filter-fill text-primary text-xs" />
                Filtros:
            </span>

            <template v-for="badge in activeFilterBadges" :key="badge.id">
                <Chip
                    v-if="!badge.isFixedPeriod"
                    :label="`${badge.category}: ${badge.label}`"
                    :icon="badge.icon"
                    removable
                    class="text-xs py-1 px-2.5 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm"
                    @remove="removeBadge(badge)"
                />
                <Tag
                    v-else
                    :value="`${badge.category}: ${badge.label}`"
                    :icon="badge.icon"
                    :severity="badge.severity"
                    class="text-xs py-1 px-2.5 shadow-sm"
                />
            </template>
        </div>

        <!-- Overlay de Carregamento -->
        <div v-if="isLoading" class="overlay flex justify-center items-center absolute inset-0 bg-white/60 dark:bg-black/60 z-20 rounded-lg backdrop-blur-[2px]">
            <ProgressSpinner style="width: 40px; height: 40px" />
        </div>
    </div>
</template>
