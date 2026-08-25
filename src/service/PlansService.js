const rawApiUrl = import.meta.env.VITE_API_URL || `http://localhost:8880`;
if (rawApiUrl === undefined) {
    throw new Error('Configure the API URL.');
}
const API_URL = rawApiUrl.replace(/\/+$/, '');

export const PlansService = {
    fetchPlans(dtIni, dfFim) {
        return fetch(`${API_URL}/planos?data_inicio=${dtIni}&data_fim=${dfFim}`);
    },

    async getPlans(dtIni, dfFim) {
        try {
            const response = await this.fetchPlans(dtIni, dfFim);
            const res = await response.json();
            await res.forEach((customer) => {
                customer.plano_trabalho_data_inicio = new Date(customer.plano_trabalho_data_inicio);
                customer.plano_trabalho_data_fim = new Date(customer.plano_trabalho_data_fim);
            });
            return res;
        } catch (error) {
            console.error('[PlansService] - Erro ao buscar planos:', error);
            return null;
        }
    }
};
