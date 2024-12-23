<template>
  <div>
    <!-- Navigation Bar -->
    <nav class="w-full bg-gray-800 dark:bg-gray-900 border-b border-gray-700 fixed top-0 z-50">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Title -->
          <div class="flex items-center gap-2">
            <ULink to="/" class="flex items-center gap-2">
              <img src="/most-logo.png" alt="MOST Logo" class="h-12" />
              <div class="hidden md:block">
                <h1 class="font-bold text-lg text-white">Ministry of Science, Technology & Innovation</h1>
                <p class="text-sm text-gray-300">Kementerian Sains, Teknologi dan Inovasi</p>
              </div>
            </ULink>
          </div>

          <!-- Navigation Menu -->
          <div class="hidden md:flex items-center gap-4">
            <UButton
              v-for="(item, index) in menuItems"
              :key="index"
              :to="item.to"
              variant="solid"
              color="white"
              class="bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {{ item.label }}
            </UButton>
          </div>

          <!-- Mobile Menu Button -->
          <UButton
            class="md:hidden"
            variant="solid"
            color="white"
            icon="i-heroicons-bars-3"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          />
        </div>

        <!-- Mobile Menu -->
        <div
          v-show="isMobileMenuOpen"
          class="md:hidden py-4 bg-gray-800 dark:bg-gray-900"
        >
          <UButton
            v-for="(item, index) in menuItems"
            :key="index"
            :to="item.to"
            variant="solid"
            color="white"
            block
            class="mb-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {{ item.label }}
          </UButton>
        </div>
      </div>
    </nav>

    <!-- Spacer for fixed navbar -->
    <div class="h-16"></div>

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
      <!-- Chat Icon when closed -->
      <UIcon
        v-if="!isChatOpen"
        name="i-heroicons-chat-bubble-left-right"
        class="w-6 h-6"
      />
      <!-- Close Icon when open -->
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
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)
const isChatOpen = ref(false)

const menuItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
]
</script>

<style scoped>
.page-container {
  min-height: 100vh;
}

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