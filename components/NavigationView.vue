<template>
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
</template>

<script setup>
const isMobileMenuOpen = ref(false)

const menuItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
]
</script> 