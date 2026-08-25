// stores/useJobPlanStore.js
import { MODALIDADE, MODALIDADE_LABELS, STATUS, STATUS_LABELS, STATUS_SEVERITY } from '@/constants';
import { PlansService } from '@/service/PlansService';
import { defineStore } from 'pinia';

export const useJobPlanStore = defineStore('jobPlanStore', {
    state: () => ({
        isPlansLoaded: false,
        isLoadingYear: false,
        loadedYear: null,
        yearPlans: null,

        // Filtros Globais
        selectedDate: new Date(),
        dateRange: null, // [Date, Date]
        isRangeMode: false,
        selectedStatuses: [], // ['ATIVO', 'CONCLUIDO']
        selectedModalidades: [], // ['integral', 'parcial']
        selectedUnidades: [], // ['DTI', 'PROPLAN']
        globalSearch: '',

        // Controle de visualização e filtros
        activeTab: 'monthly', // 'monthly' | 'annual' | 'table'
        isFilterExpanded: false
    }),

    getters: {
        selectedYear: (state) => (state.selectedDate ? state.selectedDate.getFullYear() : new Date().getFullYear()),
        selectedMonth: (state) => (state.selectedDate ? state.selectedDate.getMonth() : new Date().getMonth()),
        hasYearPlans: (state) => Array.isArray(state.yearPlans) && state.yearPlans.length > 0,

        // Lista única e ordenada de unidades disponíveis no ano
        availableUnidades: (state) => {
            if (!Array.isArray(state.yearPlans)) return [];
            const unitMap = new Map();
            state.yearPlans.forEach((p) => {
                const sigla = p.unidade_sigla;
                const nome = p.unidade_nome || sigla;
                if (sigla) {
                    const current = unitMap.get(sigla) || { sigla, nome, count: 0 };
                    current.count += 1;
                    unitMap.set(sigla, current);
                }
            });
            return Array.from(unitMap.values())
                .sort((a, b) => a.sigla.localeCompare(b.sigla))
                .map((u) => ({
                    label: `${u.sigla} (${u.count})`,
                    value: u.sigla,
                    sigla: u.sigla,
                    nome: u.nome,
                    count: u.count
                }));
        },

        // Filtra os planos do ano aplicando acumulativamente: Status, Modalidade, Unidade, Busca e DateRange (se em rangeMode)
        filteredYearPlans: (state) => {
            if (!Array.isArray(state.yearPlans)) return [];

            return state.yearPlans.filter((p) => {
                // Filtro de Data em modo Range (considerando data de início)
                if (state.isRangeMode && Array.isArray(state.dateRange) && state.dateRange[0]) {
                    const dt = p.plano_trabalho_data_inicio;
                    if (!dt) return false;
                    const planDate = dt instanceof Date ? dt : new Date(dt);
                    const startDate = state.dateRange[0];
                    const endDate = state.dateRange[1] || state.dateRange[0];
                    if (planDate < startDate || planDate > endDate) return false;
                }

                // Filtro de Status
                if (state.selectedStatuses.length > 0) {
                    if (!state.selectedStatuses.includes(p.plano_trabalho_status)) return false;
                }

                // Filtro de Modalidade
                if (state.selectedModalidades.length > 0) {
                    const m = (p.modalidade_nome || '').toLowerCase().trim();
                    const match = state.selectedModalidades.some((selected) => m.includes(selected.toLowerCase()));
                    if (!match) return false;
                }

                // Filtro de Unidade
                if (state.selectedUnidades.length > 0) {
                    if (!state.selectedUnidades.includes(p.unidade_sigla)) return false;
                }

                // Filtro de Busca Global
                if (state.globalSearch && state.globalSearch.trim() !== '') {
                    const query = state.globalSearch.toLowerCase().trim();
                    const usuario = (p.usuario_nome || '').toLowerCase();
                    const unidade = (p.unidade_nome || '').toLowerCase();
                    const sigla = (p.unidade_sigla || '').toLowerCase();
                    const numero = (p.plano_trabalho_numero || '').toString().toLowerCase();
                    const modalidade = (p.modalidade_nome || '').toLowerCase();
                    const status = (p.plano_trabalho_status || '').toLowerCase();

                    const matches =
                        usuario.includes(query) ||
                        unidade.includes(query) ||
                        sigla.includes(query) ||
                        numero.includes(query) ||
                        modalidade.includes(query) ||
                        status.includes(query);

                    if (!matches) return false;
                }

                return true;
            });
        },

        // Filtra os planos para o mês selecionado (ou retorna filteredYearPlans se estiver em RangeMode)
        filteredMonthPlans: (state) => {
            const yearPlans = state.filteredYearPlans;
            if (!Array.isArray(yearPlans)) return [];

            if (state.isRangeMode) {
                return yearPlans;
            }

            const targetYear = state.selectedYear;
            const targetMonth = state.selectedMonth;

            return yearPlans.filter((p) => {
                const dt = p.plano_trabalho_data_inicio;
                if (!dt) return false;
                const d = dt instanceof Date ? dt : new Date(dt);
                return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
            });
        },

        // Aliases para compatibilidade com componentes existentes
        plans: (state) => state.filteredMonthPlans,
        filteredPlans: (state) => state.filteredMonthPlans,

        // Total de filtros ativos acumulados
        activeFiltersCount: (state) => {
            let count = 0;
            if (state.isRangeMode && state.dateRange && state.dateRange[0]) count += 1;
            count += state.selectedStatuses.length;
            count += state.selectedModalidades.length;
            count += state.selectedUnidades.length;
            if (state.globalSearch && state.globalSearch.trim() !== '') count += 1;
            return count;
        },

        // Lista de Badges de filtros ativos para renderização e remoção individual
        activeFilterBadges: (state) => {
            const badges = [];

            // Filtro Temporal
            if (state.isRangeMode && Array.isArray(state.dateRange) && state.dateRange[0]) {
                const d1 = state.dateRange[0].toLocaleDateString('pt-BR');
                const d2 = state.dateRange[1] ? state.dateRange[1].toLocaleDateString('pt-BR') : d1;
                badges.push({
                    id: 'dateRange',
                    type: 'dateRange',
                    category: 'Período',
                    label: `${d1} até ${d2}`,
                    icon: 'pi pi-calendar',
                    severity: 'secondary'
                });
            } else if (state.selectedDate) {
                const month = (state.selectedDate.getMonth() + 1).toString().padStart(2, '0');
                const year = state.selectedDate.getFullYear();
                badges.push({
                    id: 'month',
                    type: 'month',
                    category: 'Mês',
                    label: `${month}/${year}`,
                    icon: 'pi pi-calendar',
                    severity: 'primary',
                    isFixedPeriod: true // Período base não é removível pelo chip, apenas alterado
                });
            }

            // Status
            state.selectedStatuses.forEach((st) => {
                badges.push({
                    id: `status_${st}`,
                    type: 'status',
                    value: st,
                    category: 'Status',
                    label: STATUS_LABELS[st] || st,
                    severity: STATUS_SEVERITY[st] || 'info'
                });
            });

            // Modalidades
            state.selectedModalidades.forEach((mod) => {
                badges.push({
                    id: `modalidade_${mod}`,
                    type: 'modalidade',
                    value: mod,
                    category: 'Modalidade',
                    label: MODALIDADE_LABELS[mod] || mod,
                    severity: 'warn'
                });
            });

            // Unidades
            state.selectedUnidades.forEach((un) => {
                badges.push({
                    id: `unidade_${un}`,
                    type: 'unidade',
                    value: un,
                    category: 'Unidade',
                    label: un,
                    severity: 'contrast'
                });
            });

            // Busca
            if (state.globalSearch && state.globalSearch.trim() !== '') {
                badges.push({
                    id: 'search',
                    type: 'search',
                    category: 'Busca',
                    label: `"${state.globalSearch.trim()}"`,
                    icon: 'pi pi-search',
                    severity: 'secondary'
                });
            }

            return badges;
        },

        // Estatísticas do Ano (12 meses) com base nos filtros de Status/Modalidade/Unidade
        annualStats: (state) => {
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

            const stats = months.map((name, index) => ({
                monthIndex: index,
                monthName: name,
                total: 0,
                status: {
                    [STATUS.INCLUIDO]: 0,
                    [STATUS.AGUARDANDO_ASSINATURA]: 0,
                    [STATUS.ATIVO]: 0,
                    [STATUS.CONCLUIDO]: 0
                },
                modalidades: {
                    [MODALIDADE.INTEGRAL]: 0,
                    [MODALIDADE.PARCIAL]: 0,
                    [MODALIDADE.PRESENCIAL]: 0
                }
            }));

            const plansToAggregate = state.filteredYearPlans;
            if (!Array.isArray(plansToAggregate)) return stats;

            plansToAggregate.forEach((plano) => {
                const dt = plano.plano_trabalho_data_inicio;
                if (!dt) return;
                const d = dt instanceof Date ? dt : new Date(dt);
                const monthIndex = d.getMonth();
                if (monthIndex >= 0 && monthIndex < 12) {
                    const monthStat = stats[monthIndex];
                    monthStat.total += 1;

                    // Status
                    const s = plano.plano_trabalho_status;
                    if (s && monthStat.status[s] !== undefined) {
                        monthStat.status[s] += 1;
                    } else if (s) {
                        monthStat.status[s] = (monthStat.status[s] || 0) + 1;
                    }

                    // Modalidade
                    const m = (plano.modalidade_nome || '').toLowerCase().trim();
                    if (m.includes('integral')) {
                        monthStat.modalidades[MODALIDADE.INTEGRAL] += 1;
                    } else if (m.includes('parcial')) {
                        monthStat.modalidades[MODALIDADE.PARCIAL] += 1;
                    } else if (m.includes('presencial')) {
                        monthStat.modalidades[MODALIDADE.PRESENCIAL] += 1;
                    }
                }
            });

            return stats;
        },

        // KPIs Mensais
        monthlyKPIs: (state) => {
            const plans = state.filteredMonthPlans || [];
            const total = plans.length;
            let active = 0;
            let concluded = 0;
            let waiting = 0;
            let included = 0;

            const modCount = { [MODALIDADE.INTEGRAL]: 0, [MODALIDADE.PARCIAL]: 0, [MODALIDADE.PRESENCIAL]: 0 };
            const unitCount = {};

            plans.forEach((p) => {
                if (p.plano_trabalho_status === STATUS.ATIVO) active++;
                else if (p.plano_trabalho_status === STATUS.CONCLUIDO) concluded++;
                else if (p.plano_trabalho_status === STATUS.AGUARDANDO_ASSINATURA) waiting++;
                else if (p.plano_trabalho_status === STATUS.INCLUIDO) included++;

                const m = (p.modalidade_nome || '').toLowerCase();
                if (m.includes('integral')) modCount[MODALIDADE.INTEGRAL]++;
                else if (m.includes('parcial')) modCount[MODALIDADE.PARCIAL]++;
                else if (m.includes('presencial')) modCount[MODALIDADE.PRESENCIAL]++;

                const u = p.unidade_sigla;
                if (u) unitCount[u] = (unitCount[u] || 0) + 1;
            });

            const topUnit = Object.entries(unitCount).sort((a, b) => b[1] - a[1])[0] || null;
            const topModality = Object.entries(modCount).sort((a, b) => b[1] - a[1])[0] || null;

            return {
                total,
                active,
                concluded,
                waiting,
                included,
                topUnit: topUnit ? { sigla: topUnit[0], count: topUnit[1] } : null,
                topModality: topModality && topModality[1] > 0 ? { key: topModality[0], label: MODALIDADE_LABELS[topModality[0]], count: topModality[1] } : null
            };
        },

        // KPIs Anuais
        annualKPIs: (state) => {
            const plans = state.filteredYearPlans || [];
            const total = plans.length;
            let active = 0;
            let concluded = 0;
            const unitSet = new Set();
            const modalityCounts = {
                [MODALIDADE.INTEGRAL]: 0,
                [MODALIDADE.PARCIAL]: 0,
                [MODALIDADE.PRESENCIAL]: 0
            };

            plans.forEach((p) => {
                if (p.plano_trabalho_status === STATUS.ATIVO) active++;
                else if (p.plano_trabalho_status === STATUS.CONCLUIDO) concluded++;

                if (p.unidade_sigla) unitSet.add(p.unidade_sigla);

                const m = (p.modalidade_nome || '').toLowerCase();
                if (m.includes('integral')) {
                    modalityCounts[MODALIDADE.INTEGRAL]++;
                } else if (m.includes('parcial')) {
                    modalityCounts[MODALIDADE.PARCIAL]++;
                } else if (m.includes('presencial')) {
                    modalityCounts[MODALIDADE.PRESENCIAL]++;
                }
            });

            const stats = state.annualStats;
            let peakMonth = null;
            stats.forEach((m) => {
                if (!peakMonth || m.total > peakMonth.total) {
                    peakMonth = m;
                }
            });

            const modalityPercentages = {
                [MODALIDADE.INTEGRAL]: total > 0 ? ((modalityCounts[MODALIDADE.INTEGRAL] / total) * 100).toFixed(1) : '0.0',
                [MODALIDADE.PARCIAL]: total > 0 ? ((modalityCounts[MODALIDADE.PARCIAL] / total) * 100).toFixed(1) : '0.0',
                [MODALIDADE.PRESENCIAL]: total > 0 ? ((modalityCounts[MODALIDADE.PRESENCIAL] / total) * 100).toFixed(1) : '0.0'
            };

            return {
                total,
                active,
                concluded,
                totalUnits: unitSet.size,
                modalityCounts,
                modalityPercentages,
                peakMonth: peakMonth && peakMonth.total > 0 ? peakMonth : null
            };
        }
    },

    actions: {
        async setSelectedDate(date) {
            if (!date) return;
            const newDate = date instanceof Date ? date : new Date(date);
            this.selectedDate = newDate;
            const targetYear = newDate.getFullYear();

            if (this.loadedYear === targetYear && this.yearPlans !== null) {
                this.isPlansLoaded = true;
                return;
            }

            await this.fetchPlansForYear(targetYear);
        },

        async previousMonth() {
            const d = this.selectedDate || new Date();
            const newDate = new Date(d.getFullYear(), d.getMonth() - 1, 1);
            await this.setSelectedDate(newDate);
        },

        async nextMonth() {
            const d = this.selectedDate || new Date();
            const newDate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            await this.setSelectedDate(newDate);
        },

        async previousYear() {
            const d = this.selectedDate || new Date();
            const newDate = new Date(d.getFullYear() - 1, d.getMonth(), 1);
            await this.setSelectedDate(newDate);
        },

        async nextYear() {
            const d = this.selectedDate || new Date();
            const newDate = new Date(d.getFullYear() + 1, d.getMonth(), 1);
            await this.setSelectedDate(newDate);
        },

        setDateRange(range) {
            this.dateRange = range;
        },

        setIsRangeMode(bool) {
            this.isRangeMode = bool;
        },

        setSelectedStatuses(statuses) {
            this.selectedStatuses = statuses || [];
        },

        setSelectedModalidades(modalidades) {
            this.selectedModalidades = modalidades || [];
        },

        setSelectedUnidades(unidades) {
            this.selectedUnidades = unidades || [];
        },

        setGlobalSearch(query) {
            this.globalSearch = query || '';
        },

        setActiveTab(tab) {
            this.activeTab = tab;
        },

        removeFilterBadge(badge) {
            if (!badge) return;
            if (badge.type === 'status') {
                this.selectedStatuses = this.selectedStatuses.filter((s) => s !== badge.value);
            } else if (badge.type === 'modalidade') {
                this.selectedModalidades = this.selectedModalidades.filter((m) => m !== badge.value);
            } else if (badge.type === 'unidade') {
                this.selectedUnidades = this.selectedUnidades.filter((u) => u !== badge.value);
            } else if (badge.type === 'search') {
                this.globalSearch = '';
            } else if (badge.type === 'dateRange') {
                this.dateRange = null;
                this.isRangeMode = false;
            }
        },

        toggleFilterExpanded() {
            this.isFilterExpanded = !this.isFilterExpanded;
        },

        setIsFilterExpanded(val) {
            this.isFilterExpanded = !!val;
        },

        clearAllFilters() {
            this.selectedStatuses = [];
            this.selectedModalidades = [];
            this.selectedUnidades = [];
            this.globalSearch = '';
            this.dateRange = null;
            this.isRangeMode = false;
        },

        async fetchPlansForYear(year) {
            this.isLoadingYear = true;
            this.isPlansLoaded = false;
            try {
                const dtIni = `${year}-01-01`;
                const dtFim = `${year + 1}-01-01`;
                const result = await PlansService.getPlans(dtIni, dtFim);
                this.yearPlans = result || [];
                this.loadedYear = year;
            } catch (error) {
                console.error('Erro ao buscar planos do ano:', error);
                this.yearPlans = [];
            } finally {
                this.isLoadingYear = false;
                this.isPlansLoaded = true;
            }
        },

        async fetchPlans() {
            if (this.selectedDate) {
                await this.setSelectedDate(this.selectedDate);
            } else {
                await this.setSelectedDate(new Date());
            }
        },

        clearPlans() {
            this.yearPlans = null;
            this.loadedYear = null;
            this.isPlansLoaded = false;
            this.clearAllFilters();
        },

        setFilteredPlans(filtered) {
            // Mantido para compatibilidade
        }
    }
});
