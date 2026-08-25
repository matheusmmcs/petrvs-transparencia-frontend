const rawApiUrl = import.meta.env.VITE_API_URL || `http://localhost:8880`;
if (rawApiUrl === undefined) {
    throw new Error('Configure the API URL.');
}
const API_URL = rawApiUrl.replace(/\/+$/, '');

const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr === 'string') {
        const parts = dateStr.substring(0, 10).split('-');
        if (parts.length === 3) {
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }
    }
    return new Date(dateStr);
};

export const PlansService = {
    fetchPlans(dtIni, dfFim) {
        return fetch(`${API_URL}/planos?data_inicio=${dtIni}&data_fim=${dfFim}`);
    },

    async getPlans(dtIni, dfFim) {
        try {
            const response = await this.fetchPlans(dtIni, dfFim);
            const res = await response.json();
            res.forEach((customer) => {
                customer.plano_trabalho_data_inicio = parseLocalDate(customer.plano_trabalho_data_inicio);
                customer.plano_trabalho_data_fim = parseLocalDate(customer.plano_trabalho_data_fim);
                if (customer.programa_data_inicio) {
                    customer.programa_data_inicio = parseLocalDate(customer.programa_data_inicio);
                }
                if (customer.programa_data_fim) {
                    customer.programa_data_fim = parseLocalDate(customer.programa_data_fim);
                }
            });
            return res;
        } catch (error) {
            console.error('[PlansService] - Erro ao buscar planos:', error);
            return null;
        }
    }
};
