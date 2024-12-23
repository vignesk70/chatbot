<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-blue-50 dark:bg-gray-800">
      <div class="container mx-auto px-4 py-12">
        <div class="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 class="text-3xl font-bold mb-4 text-blue-900 dark:text-blue-100">
              AI Assistant for MOST Services
            </h2>
            <p class="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Get instant answers to your questions about Ministry services, grants, 
              and initiatives. Our AI assistant is here to help you 24/7.
            </p>
            <div class="flex gap-4">
              <UButton
                color="primary"
                size="lg"
                to="#chat-section"
              >
                Start Chat
              </UButton>
              <UButton
                color="gray"
                variant="outline"
                size="lg"
                to="/about"
                class="dark:text-gray-300 dark:border-gray-300"
              >
                Learn More
              </UButton>
            </div>
          </div>
          <div class="hidden md:block">
            <img 
              src="/ai-assistant-illustration.svg" 
              alt="AI Assistant Illustration"
              class="w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Floating Chat Button -->
    <button
      @click="isChatOpen = !isChatOpen"
      class="fixed bottom-6 right-6 z-50 bg-blue-600 dark:bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200"
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
      class="fixed bottom-24 right-6 z-40 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div class="h-full">
        <ChatInterface />
      </div>
    </div>
  </div>
</template>

<script setup>
const isChatOpen = ref(false)
</script>

<style scoped>
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