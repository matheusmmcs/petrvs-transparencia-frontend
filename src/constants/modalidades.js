export const MODALIDADE = Object.freeze({
    PRESENCIAL: 'presencial',
    PARCIAL: 'parcial',
    INTEGRAL: 'integral'
});

export const MODALIDADE_LABELS = Object.freeze({
    [MODALIDADE.PRESENCIAL]: 'Presencial',
    [MODALIDADE.PARCIAL]: 'Teletrabalho (Parcial)',
    [MODALIDADE.INTEGRAL]: 'Teletrabalho (Integral)'
});

export const MODALIDADE_OPTIONS = Object.freeze([
    { label: MODALIDADE_LABELS[MODALIDADE.PRESENCIAL], value: MODALIDADE.PRESENCIAL },
    { label: MODALIDADE_LABELS[MODALIDADE.PARCIAL], value: MODALIDADE.PARCIAL },
    { label: MODALIDADE_LABELS[MODALIDADE.INTEGRAL], value: MODALIDADE.INTEGRAL }
]);

export const MODALIDADE_COLORS = Object.freeze({
    [MODALIDADE.INTEGRAL]: '#4f99c7',
    [MODALIDADE.PARCIAL]: '#1ec8a3',
    [MODALIDADE.PRESENCIAL]: '#b5f2e0'
});

export const formatModalidade = (modalidade) => {
    if (!modalidade) return '';
    const key = modalidade.toString().toLowerCase().trim();
    return MODALIDADE_LABELS[key] || modalidade;
};
