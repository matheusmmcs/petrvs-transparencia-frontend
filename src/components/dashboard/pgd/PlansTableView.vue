<script setup>
import { formatModalidade, formatStatus, getStatusSeverity } from '@/constants';
import { useJobPlanStore } from '@/stores/useJobPlanStore';
import { FilterMatchMode } from '@primevue/core/api';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import { computed, ref } from 'vue';

const store = useJobPlanStore();
const { filteredYearPlans, isLoadingYear, isPlansLoaded, isRangeMode, filteredMonthPlans, selectedDate } = storeToRefs(store);

const dt = ref(null);
const showModal = ref(false);
const userModal = ref(null);
const viewSource = ref('year'); // 'month' | 'year'

const activePlans = computed(() => {
    if (viewSource.value === 'month' && !isRangeMode.value) {
        return filteredMonthPlans.value || [];
    }
    return filteredYearPlans.value || [];
});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

const formatDate = (value) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR');
};

const selectRow = (data) => {
    userModal.value = data;
    showModal.value = true;
};

const exportCSV = () => {
    if (dt.value) {
        dt.value.exportCSV();
    }
};

const clearTableFilter = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};

const monthYearFormatted = computed(() => {
    const d = selectedDate.value || new Date();
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
});
</script>

<template>
    <div class="col-span-12">
        <div class="card mb-0 shadow-sm border border-surface-200 dark:border-surface-700">
            <!-- Cabeçalho da Listagem -->
            <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div class="flex items-center gap-3">
                    <i class="pi pi-list text-primary text-xl" />
                    <div>
                        <span class="font-bold text-lg text-surface-900 dark:text-surface-0">
                            Listagem de Planos de Trabalho
                        </span>
                        <div class="flex items-center gap-2 mt-0.5">
                            <Tag :value="`${activePlans.length} registros encontrados`" severity="primary" rounded />
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <!-- Alternar escopo da listagem -->
                    <div class="flex items-center bg-surface-100 dark:bg-surface-800 rounded-lg p-1 border border-surface-200 dark:border-surface-700">
                        <Button
                            :label="`Mês (${monthYearFormatted})`"
                            size="small"
                            :severity="viewSource === 'month' ? 'primary' : 'secondary'"
                            :text="viewSource !== 'month'"
                            class="!text-xs"
                            @click="viewSource = 'month'"
                        />
                        <Button
                            label="Ano Todo"
                            size="small"
                            :severity="viewSource === 'year' ? 'primary' : 'secondary'"
                            :text="viewSource !== 'year'"
                            class="!text-xs"
                            @click="viewSource = 'year'"
                        />
                    </div>

                    <Button
                        label="Exportar CSV"
                        icon="pi pi-upload"
                        size="small"
                        severity="secondary"
                        outlined
                        @click="exportCSV"
                    />
                </div>
            </div>

            <!-- Tabela Principal -->
            <DataTable
                ref="dt"
                :value="activePlans"
                dataKey="plano_trablho_id"
                :loading="isLoadingYear || !isPlansLoaded"
                :filters="filters"
                :globalFilterFields="['usuario_nome', 'unidade_nome', 'unidade_sigla', 'plano_trabalho_numero', 'modalidade_nome', 'plano_trabalho_status']"
                :paginator="true"
                :rows="15"
                :rowsPerPageOptions="[10, 15, 25, 50, 100]"
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} até {last} de {totalRecords}"
                :rowHover="true"
                showGridlines
                responsiveLayout="scroll"
                @row-click="(e) => selectRow(e.data)"
                class="cursor-pointer"
            >
                <template #header>
                    <div class="flex justify-end">
                        <IconField iconPosition="left">
                            <InputIcon class="pi pi-search" />
                            <InputText
                                v-model="filters['global'].value"
                                placeholder="Filtrar nesta tabela..."
                                size="small"
                                class="w-64"
                            />
                        </IconField>
                    </div>
                </template>

                <template #empty>
                    <div class="text-center py-6 text-muted-color">
                        Nenhum plano encontrado com os filtros aplicados.
                    </div>
                </template>

                <Column field="plano_trabalho_numero" header="Nº Plano" sortable style="min-width: 100px" />
                
                <Column field="usuario_nome" header="Servidor" sortable style="min-width: 220px">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span class="font-medium text-surface-900 dark:text-surface-0">{{ data.usuario_nome }}</span>
                            <span class="text-xs text-muted-color">{{ data.usuario_cpf_mascarado }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="unidade_sigla" header="Unidade" sortable style="min-width: 120px">
                    <template #body="{ data }">
                        <span class="font-semibold text-primary" :title="data.unidade_nome">{{ data.unidade_sigla }}</span>
                    </template>
                </Column>

                <Column field="modalidade_nome" header="Modalidade" sortable style="min-width: 180px">
                    <template #body="{ data }">
                        <span>{{ formatModalidade(data.modalidade_nome) }}</span>
                    </template>
                </Column>

                <Column field="plano_trabalho_status" header="Situação" sortable style="min-width: 160px">
                    <template #body="{ data }">
                        <Tag :value="formatStatus(data.plano_trabalho_status)" :severity="getStatusSeverity(data.plano_trabalho_status)" />
                    </template>
                </Column>

                <Column field="plano_trabalho_data_inicio" header="Início" sortable style="min-width: 110px">
                    <template #body="{ data }">
                        {{ formatDate(data.plano_trabalho_data_inicio) }}
                    </template>
                </Column>

                <Column field="plano_trabalho_data_fim" header="Término" sortable style="min-width: 110px">
                    <template #body="{ data }">
                        {{ formatDate(data.plano_trabalho_data_fim) }}
                    </template>
                </Column>

                <Column header="Ações" style="min-width: 80px; text-align: center">
                    <template #body="{ data }">
                        <Button
                            icon="pi pi-eye"
                            size="small"
                            text
                            rounded
                            severity="secondary"
                            @click.stop="selectRow(data)"
                            title="Ver Detalhes"
                        />
                    </template>
                </Column>
            </DataTable>

            <!-- Modal de Detalhes do Plano -->
            <Dialog
                v-model:visible="showModal"
                modal
                :header="`Plano de Trabalho nº ${userModal?.plano_trabalho_numero || ''}`"
                :style="{ width: '50rem' }"
                :breakpoints="{ '1199px': '75vw', '575px': '95vw' }"
            >
                <div v-if="userModal" class="flex flex-col gap-4">
                    <!-- Seção Servidor -->
                    <div class="border-b border-surface-200 dark:border-surface-700 pb-3">
                        <span class="text-xs uppercase font-bold text-muted-color block mb-2">Dados do Servidor</span>
                        <div class="grid grid-cols-12 gap-3 text-sm">
                            <div class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">Nome:</span>
                                <strong class="ml-2 text-surface-900 dark:text-surface-0">{{ userModal.usuario_nome }}</strong>
                            </div>
                            <div class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">CPF:</span>
                                <span class="ml-2">{{ userModal.usuario_cpf_mascarado }}</span>
                            </div>
                            <div v-if="userModal.usuario_email_filtrado" class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">E-mail:</span>
                                <span class="ml-2">{{ userModal.usuario_email_filtrado }}</span>
                            </div>
                            <div class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">Unidade:</span>
                                <strong class="ml-2 text-primary">{{ userModal.unidade_sigla }} - {{ userModal.unidade_nome }}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Seção Plano -->
                    <div class="border-b border-surface-200 dark:border-surface-700 pb-3">
                        <span class="text-xs uppercase font-bold text-muted-color block mb-2">Dados do Plano de Trabalho</span>
                        <div class="grid grid-cols-12 gap-3 text-sm">
                            <div class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">Situação:</span>
                                <Tag :value="formatStatus(userModal.plano_trabalho_status)" :severity="getStatusSeverity(userModal.plano_trabalho_status)" class="ml-2" />
                            </div>
                            <div class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">Modalidade:</span>
                                <strong class="ml-2">{{ formatModalidade(userModal.modalidade_nome) }}</strong>
                            </div>
                            <div class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">Início:</span>
                                <span class="ml-2 font-medium">{{ formatDate(userModal.plano_trabalho_data_inicio) }}</span>
                            </div>
                            <div class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">Término:</span>
                                <span class="ml-2 font-medium">{{ formatDate(userModal.plano_trabalho_data_fim) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Seção Programa -->
                    <div v-if="userModal.programa_nome">
                        <span class="text-xs uppercase font-bold text-muted-color block mb-2">Programa de Gestão</span>
                        <div class="grid grid-cols-12 gap-3 text-sm">
                            <div class="col-span-12">
                                <span class="text-muted-color">Programa:</span>
                                <strong class="ml-2">{{ userModal.programa_nome }}</strong>
                            </div>
                            <div v-if="userModal.programa_data_inicio" class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">Início do Programa:</span>
                                <span class="ml-2">{{ formatDate(userModal.programa_data_inicio) }}</span>
                            </div>
                            <div v-if="userModal.programa_data_fim" class="col-span-12 sm:col-span-6">
                                <span class="text-muted-color">Fim do Programa:</span>
                                <span class="ml-2">{{ formatDate(userModal.programa_data_fim) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <template #footer>
                    <Button label="Fechar" icon="pi pi-times" text @click="showModal = false" />
                </template>
            </Dialog>
        </div>
    </div>
</template>
