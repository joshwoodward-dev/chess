<template>
  <div id="myModal" class="modal">
    <div class="modal-content">
      <header class="modal-header">
        <slot name="header" />
        <button v-if="closable" class="close" @click="emit('close')">&times;</button>
      </header>
      <slot />
    </div>
  </div>
</template>

<style lang="css">
/* Modified from W3 schools: https://www.w3schools.com/howto/howto_css_modals.asp */
.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 20%;
  border-radius: 10px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
}

.close {
  background: none;
  border: none;
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
}
</style>

<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()

withDefaults(defineProps<{ closable?: boolean }>(), { closable: true })
</script>
