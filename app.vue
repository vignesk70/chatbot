<template>
  <div>
    <NuxtLayout>
      <NuxtPage />


    <!-- Floating Chat Button -->
    <button
      @click="isChatOpen = !isChatOpen"
      class="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-200"
    >
      <UIcon
        v-if="!isChatOpen"
        name="i-heroicons-chat-bubble-left-right"
        class="w-6 h-6"
      />
      <UIcon
        v-else
        name="i-heroicons-x-mark"
        class="w-6 h-6"
      />
    </button>

    <!-- Chat Interface Section -->
    <div
      v-show="isChatOpen"
      class="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
    >
      <div class="h-full">
        <ChatInterface />
      </div>
    </div>
  </NuxtLayout>
  </div>

</template>

<script setup>
import { ref } from 'vue'

const isChatOpen = ref(false)
</script>

<style>
/* Add a slide-in animation for the chat window */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>