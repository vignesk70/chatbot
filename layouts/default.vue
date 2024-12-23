<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <NavigationView />
    <!-- Spacer for fixed navbar -->
    <div class="h-16"></div>
    
    <!-- Main Content -->
    <main>
      <slot />
    </main>
  </div>
</template>