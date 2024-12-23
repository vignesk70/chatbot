<template>
  <div>
    <!-- Navigation Bar -->
    <nav class="bg-white shadow-lg">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold text-gray-800">ChatBot</NuxtLink>
          </div>
          <div class="hidden md:flex space-x-8">
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">Home</NuxtLink>
            <NuxtLink to="/about" class="text-gray-600 hover:text-gray-900">About</NuxtLink>
            <NuxtLink to="/chat" class="text-gray-600 hover:text-gray-900">Chat</NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section with Gradient Background -->
    <div class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-20">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-white mb-4">
            About Our ChatBot
          </h1>
          <p class="text-xl text-white/90 max-w-2xl mx-auto">
            Learn more about our advanced AI-powered chatbot solution designed to enhance your communication experience.
          </p>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="max-w-6xl mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p class="text-gray-600">
            We strive to create intelligent conversational experiences that help businesses and individuals communicate more effectively and efficiently.
          </p>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
          <p class="text-gray-600">
            Our chatbot combines cutting-edge AI technology with intuitive design to provide seamless, natural conversations and helpful responses.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Add any necessary script logic here
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
