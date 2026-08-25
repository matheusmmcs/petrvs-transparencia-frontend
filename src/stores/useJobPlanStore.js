// stores/useJobPlanStore.js
import { MODALIDADE } from '@/constants';
import { PlansService } from '@/service/PlansService';
import { defineStore } from 'pinia';

export const useJobPlanStore = defineStore('jobPlanStore', {
    state: () => ({
        isPlansLoaded: false,
        isLoadingYear: false,
        loadedYear: null,
        selectedDate: new Date(),
        yearPlans: null,
        plans: null,
        filteredPlans: null // Planos filtrados pela tabela
    }),
    getters: {
        selectedYear: (state) => (state.selectedDate ? state.selectedDate.getFullYear() : new Date().getFullYear()),
        selectedMonth: (state) => (state.selectedDate ? state.selectedDate.getMonth() : new Date().getMonth()),
        hasYearPlans: (state) => Array.isArray(state.yearPlans) && state.yearPlans.length > 0,
        annualStats: (state) => {
            const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

            const stats = months.map((name, index) => ({
                monthIndex: index,
                monthName: name,
                total: 0,
                status: {
                    INCLUIDO: 0,
                    AGUARDANDO_ASSINATURA: 0,
                    ATIVO: 0,
                    CONCLUIDO: 0
                },
                modalidades: {
                    [MODALIDADE.INTEGRAL]: 0,
                    [MODALIDADE.PARCIAL]: 0,
                    [MODALIDADE.PRESENCIAL]: 0
                }
            }));

            if (!Array.isArray(state.yearPlans)) {
                return stats;
            }

            state.yearPlans.forEach((plano) => {
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
        }
    },
    actions: {
        filterPlansForMonth(date) {
            if (!Array.isArray(this.yearPlans)) return [];
            const year = date.getFullYear();
            const month = date.getMonth();
            return this.yearPlans.filter((p) => {
                const dt = p.plano_trabalho_data_inicio;
                if (!dt) return false;
                const d = dt instanceof Date ? dt : new Date(dt);
                return d.getFullYear() === year && d.getMonth() === month;
            });
        },

        async setSelectedDate(date) {
            if (!date) return;
            const newDate = date instanceof Date ? date : new Date(date);
            this.selectedDate = newDate;
            const targetYear = newDate.getFullYear();

            if (this.loadedYear === targetYear && this.yearPlans !== null) {
                this.plans = this.filterPlansForMonth(newDate);
                this.filteredPlans = this.plans;
                this.isPlansLoaded = true;
                return;
            }

            await this.fetchPlansForYear(targetYear);
            this.plans = this.filterPlansForMonth(newDate);
            this.filteredPlans = this.plans;
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
            this.plans = null;
            this.filteredPlans = null;
            this.isPlansLoaded = false;
        },

        setFilteredPlans(filtered) {
            this.filteredPlans = filtered;
        }
    }
});
