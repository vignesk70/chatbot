<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Chat Logs</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <UCard>
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-2">Total Chats</h3>
          <p class="text-3xl font-bold text-blue-600">{{ logs.length }}</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-2">Helpful Responses</h3>
          <p class="text-3xl font-bold text-green-600">
            {{ logs.filter(log => log.is_helpful === 1).length }}
          </p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-2">Not Helpful</h3>
          <p class="text-3xl font-bold text-red-600">
            {{ logs.filter(log => log.is_helpful === 0).length }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Logs Table -->
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Chat History</h2>
          <UInput
            v-model="search"
            icon="i-heroicons-magnifying-glass"
            placeholder="Search chats..."
            class="max-w-sm"
          />
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold">Time</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Query</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Response</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Feedback</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                {{ new Date(log.created_at).toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-sm max-w-xs truncate">{{ log.query }}</td>
              <td class="px-4 py-3 text-sm max-w-xs truncate">{{ log.response }}</td>
              <td class="px-4 py-3 text-sm">
                <UBadge
                  v-if="log.is_helpful !== null"
                  :color="log.is_helpful === 1 ? 'green' : 'red'"
                >
                  {{ log.is_helpful === 1 ? 'Helpful' : 'Not Helpful' }}
                </UBadge>
                <span v-else class="text-gray-400">No Feedback</span>
              </td>
              <td class="px-4 py-3 text-sm">
                <UButton
                  icon="i-heroicons-information-circle"
                  color="gray"
                  variant="ghost"
                  @click="selectedLog = log"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Details Modal -->
    <UModal v-model="showModal">
      <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Chat Details</h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="showModal = false"
            />
          </div>
        </template>

        <div v-if="selectedLog" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="font-semibold mb-1">Session ID</h4>
              <p class="text-sm">{{ selectedLog.session_id }}</p>
            </div>
            <div>
              <h4 class="font-semibold mb-1">Platform</h4>
              <p class="text-sm">{{ selectedLog.platform }}</p>
            </div>
            <div>
              <h4 class="font-semibold mb-1">Browser</h4>
              <p class="text-sm">{{ selectedLog.user_agent }}</p>
            </div>
            <div>
              <h4 class="font-semibold mb-1">Screen Resolution</h4>
              <p class="text-sm">{{ selectedLog.screen_resolution }}</p>
            </div>
            <div>
              <h4 class="font-semibold mb-1">Language</h4>
              <p class="text-sm">{{ selectedLog.language }}</p>
            </div>
            <div>
              <h4 class="font-semibold mb-1">Timezone</h4>
              <p class="text-sm">{{ selectedLog.timezone }}</p>
            </div>
          </div>

          <div>
            <h4 class="font-semibold mb-1">Full Query</h4>
            <p class="text-sm whitespace-pre-wrap">{{ selectedLog.query }}</p>
          </div>

          <div>
            <h4 class="font-semibold mb-1">Full Response</h4>
            <p class="text-sm whitespace-pre-wrap">{{ selectedLog.response }}</p>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const logs = ref([])
const search = ref('')
const selectedLog = ref(null)
const showModal = ref(false)

// Fetch logs on mount
onMounted(async () => {
  try {
    const response = await $fetch('/api/admin/logs')
    if (response.success) {
      logs.value = response.data
    }
  } catch (error) {
    console.error('Error fetching logs:', error)
  }
})

// Watch selectedLog to show modal
watch(selectedLog, (newValue) => {
  showModal.value = !!newValue
})

// Watch modal close to clear selection
watch(showModal, (newValue) => {
  if (!newValue) {
    selectedLog.value = null
  }
})

// Computed property for filtered logs
const filteredLogs = computed(() => {
  if (!search.value) return logs.value
  
  const searchTerm = search.value.toLowerCase()
  return logs.value.filter(log => 
    log.query.toLowerCase().includes(searchTerm) ||
    log.response.toLowerCase().includes(searchTerm)
  )
})
</script> 