<script setup>
import { ref } from 'vue'

const isChatOpen = ref(false)
</script>

<template>
    <slot></slot>
    <div v-if="isChatOpen" class="h-full">
        <ChatInterface />
    </div>
</template>