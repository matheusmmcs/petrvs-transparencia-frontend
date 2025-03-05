<script setup>
const footer = import.meta.env.VITE_FOOTER_TEXT || 'Transparência PGD';
</script>

<template>
    <div class="layout-footer">{{ footer }} - partner CPGD/UFPI</div>
</template>
