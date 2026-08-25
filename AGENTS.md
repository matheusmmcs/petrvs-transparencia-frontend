# Guia de Desenvolvimento e Manutenção - PETRVS Transparência Frontend

Este documento serve como guia simplificado de arquitetura, fluxo de dados e boas práticas para apoiar desenvolvedores e agentes de IA na manutenção e evolução do projeto.

---

## 📌 1. Visão Geral

- **Tecnologias**: Vue 3 (Composition API / `<script setup>`), Vite, PrimeVue 4.2.4 (Tema Aura), TailwindCSS 3.4, Pinia 3 e Chart.js 3.
- **Objetivo**: Portal de Transparência do Programa de Gestão e Desempenho (PGD) do PETRVS, apresentando indicadores, gráficos analíticos e listagem detalhada de planos de trabalho.

---

## 🏛️ 2. Estrutura do Projeto (`src/`)

```text
src/
├── components/dashboard/pgd/
│   ├── PlansFilterBar.vue       # Barra de filtros globais acumulativos e badges/chips
│   ├── PlansMonthlyView.vue     # Aba Visão Mensal (KPIs, 3 gráficos e tabela do mês)
│   ├── PlansAnnualView.vue      # Aba Visão Anual (KPIs, gráficos mês a mês e tabela anual)
│   └── PlansTableView.vue       # Aba Listagem Geral (DataTable completa, exportação CSV, modal)
├── constants/
│   ├── modalidades.js           # Enums, labels, cores e helpers de modalidades
│   ├── status.js                # Enums, labels, cores, severities e opções de status
│   └── index.js                 # Exportação unificada de constantes
├── layout/                      # Estrutura de layout, topbar, sidebar e footer
├── router/                      # Rotas da aplicação (Vue Router)
├── service/
│   └── PlansService.js          # Chamadas à API HTTP (FastAPI) e parse seguro de datas
├── stores/
│   └── useJobPlanStore.js       # Store Pinia central com cache anual e filtros reativos
└── views/
    └── Dashboard.vue            # Página principal com abas (Tabs do PrimeVue 4)
```

---

## ⚙️ 3. Fluxo de Dados e Cache em Memória

### 3.1. Estratégia de Cache Anual
1. Ao selecionar qualquer mês/ano, a aplicação consulta a API para o **ano completo** (`YYYY-01-01` até `YYYY+1-01-01`).
2. Os dados brutos do ano ficam armazenados em `yearPlans` na store Pinia ([useJobPlanStore.js](src/stores/useJobPlanStore.js)).
3. **Mudança de Mês**: Ao alternar entre meses dentro do mesmo ano, a filtragem é realizada instantaneamente na memória (`0ms`), sem chamadas de rede.
4. **Mudança de Ano**: Se o ano selecionado for diferente do ano em cache (`loadedYear`), uma nova requisição anual é disparada automaticamente.

### 3.2. Filtros Acumulativos
- Todos os filtros aplicados (**Status**, **Modalidades**, **Unidades**, **Intervalo de Data de Início** e **Busca Textual**) são centralizados na store.
- A store disponibiliza getters computados:
  - `filteredYearPlans`: Planos do ano filtrados pelas regras ativas.
  - `filteredMonthPlans`: Planos específicos do mês ativo com os filtros aplicados.
  - `activeFilterBadges`: Lista de badges de filtros aplicados com suporte a remoção individual (`✕`).
  - `monthlyKPIs` e `annualKPIs`: Métricas e percentuais calculados automaticamente.

### 3.3. Tratamento de Fuso Horário em Datas
- Datas retornadas pela API no formato `YYYY-MM-DD` devem ser tratadas com a função `parseLocalDate` em [PlansService.js](src/service/PlansService.js) para evitar deslocamento de dia/mês em fusos horários locais (ex: UTC-3).

---

## 🚀 4. Comandos de Desenvolvimento

### Com Docker Compose (Recomendado)
```sh
# Iniciar ambiente de desenvolvimento com hot-reload
docker compose -f docker-compose-dev.yml up --build
```
Acesse em: `http://localhost:5173/transparencia`

### Com Node.js Local
```sh
npm install
npm run dev
npm run build      # Validação de build de produção
npm run lint       # Validação e correção de ESLint/Prettier
```

---

## 🎨 5. Padrões de Interface e PrimeVue 4

- **Componentes PrimeVue 4**: Usar `Tabs`, `TabList`, `Tab`, `TabPanels`, `TabPanel`, `MultiSelect`, `DatePicker`, `Tag`, `Chip`, `DataTable`, `Dialog` e `Button`.
- **Cores Padrão de Modalidades**:
  - `Teletrabalho (Integral)`: `#4f99c7`
  - `Teletrabalho (Parcial)`: `#1ec8a3`
  - `Presencial`: `#b5f2e0`
- **Cores e Severities de Status**:
  - `ATIVO`: `#36A2EB` / `info`
  - `CONCLUIDO`: `#4BC0C0` / `success`
  - `AGUARDANDO_ASSINATURA`: `#FFCE56` / `warn`
  - `INCLUIDO`: `#FF6384` / `danger`
