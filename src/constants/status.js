export const STATUS = Object.freeze({
    INCLUIDO: 'INCLUIDO',
    AGUARDANDO_ASSINATURA: 'AGUARDANDO_ASSINATURA',
    ATIVO: 'ATIVO',
    CONCLUIDO: 'CONCLUIDO'
});

export const STATUS_LABELS = Object.freeze({
    [STATUS.INCLUIDO]: 'Incluído',
    [STATUS.AGUARDANDO_ASSINATURA]: 'Aguardando Assinatura',
    [STATUS.ATIVO]: 'Ativo',
    [STATUS.CONCLUIDO]: 'Concluído'
});

export const STATUS_COLORS = Object.freeze({
    [STATUS.INCLUIDO]: '#FF6384',
    [STATUS.AGUARDANDO_ASSINATURA]: '#FFCE56',
    [STATUS.ATIVO]: '#36A2EB',
    [STATUS.CONCLUIDO]: '#4BC0C0'
});

export const STATUS_SEVERITY = Object.freeze({
    [STATUS.INCLUIDO]: 'danger',
    [STATUS.AGUARDANDO_ASSINATURA]: 'warn',
    [STATUS.ATIVO]: 'info',
    [STATUS.CONCLUIDO]: 'success'
});

export const STATUS_OPTIONS = Object.freeze([
    { label: STATUS_LABELS[STATUS.ATIVO], value: STATUS.ATIVO, severity: STATUS_SEVERITY[STATUS.ATIVO], color: STATUS_COLORS[STATUS.ATIVO] },
    { label: STATUS_LABELS[STATUS.CONCLUIDO], value: STATUS.CONCLUIDO, severity: STATUS_SEVERITY[STATUS.CONCLUIDO], color: STATUS_COLORS[STATUS.CONCLUIDO] },
    { label: STATUS_LABELS[STATUS.AGUARDANDO_ASSINATURA], value: STATUS.AGUARDANDO_ASSINATURA, severity: STATUS_SEVERITY[STATUS.AGUARDANDO_ASSINATURA], color: STATUS_COLORS[STATUS.AGUARDANDO_ASSINATURA] },
    { label: STATUS_LABELS[STATUS.INCLUIDO], value: STATUS.INCLUIDO, severity: STATUS_SEVERITY[STATUS.INCLUIDO], color: STATUS_COLORS[STATUS.INCLUIDO] }
]);

export const formatStatus = (status) => {
    if (!status) return '';
    return STATUS_LABELS[status] || status;
};

export const getStatusSeverity = (status) => {
    return STATUS_SEVERITY[status] || 'secondary';
};
