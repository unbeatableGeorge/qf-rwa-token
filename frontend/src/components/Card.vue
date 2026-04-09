<template>
  <div class="card">
    <slot></slot>
  </div>
</template>

<script setup>
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h2, .card h3, .card h4 {
  margin-top: 0;
  color: #333;
}
</style>
