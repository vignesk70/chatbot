<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Chat Logs</h1>
      <UButton
        @click="downloadCSV"
        color="primary"
        variant="soft"
        icon="i-heroicons-document-arrow-down"
      >
        Download CSV
      </UButton>
    </div>
    
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
              <th class="px-4 py-3 text-left text-sm font-semibold">Session ID</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">IP Address</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Query</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Response</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Platform</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Language</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Feedback</th>
              <th class="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="log in filteredLogs" :key="log.id">
              <td class="px-4 py-3 text-sm whitespace-nowrap">
                {{ new Date(log.created_at).toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-sm max-w-xs truncate">{{ log.session_id }}</td>
              <td class="px-4 py-3 text-sm">{{ log.ip_address }}</td>
              <td class="px-4 py-3 text-sm max-w-xs truncate">{{ log.query }}</td>
              <td class="px-4 py-3 text-sm max-w-xs truncate">{{ log.response }}</td>
              <td class="px-4 py-3 text-sm">{{ log.platform }}</td>
              <td class="px-4 py-3 text-sm">{{ log.language }}</td>
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
import { ref, computed, watch, onMounted } from 'vue'

interface ChatLog {
  id: number
  session_id: string
  query: string
  response: string
  is_helpful: number | null
  ip_address: string
  user_agent: string
  language: string
  timezone: string
  referer: string
  platform: string
  screen_resolution: string
  created_at: string
  updated_at: string
}

const logs = ref<ChatLog[]>([])
const search = ref('')
const selectedLog = ref<ChatLog | null>(null)
const showModal = ref(false)

// Function to convert logs to CSV
const convertToCSV = (logs: ChatLog[]) => {
  // Define CSV headers in same order as table
  const headers = [
    'ID',
    'Time',
    'Session ID',
    'IP Address',
    'Query',
    'Response',
    'Platform',
    'Language',
    'Browser (User Agent)',
    'Screen Resolution',
    'Timezone',
    'Referer',
    'Feedback',
    'Created At',
    'Updated At'
  ]

  // Convert logs to CSV rows in matching order
  const rows = logs.map(log => [
    new Date(log.created_at).toLocaleString(),
    log.session_id,
    log.ip_address,
    `"${log.query.replace(/"/g, '""')}"`,
    `"${log.response.replace(/"/g, '""')}"`,
    log.platform,
    `"${log.language.replace(/"/g, '""')}"`,
    `"${log.user_agent.replace(/"/g, '""')}"`,
    log.screen_resolution,
    log.timezone,
    log.referer,
    log.is_helpful === null ? 'No Feedback' : log.is_helpful === 1 ? 'Helpful' : 'Not Helpful',
    new Date(log.created_at).toISOString(),
    new Date(log.updated_at).toISOString()
  ])

  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF'
  
  // Combine headers and rows
  return BOM + [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')
}

// Function to download CSV
const downloadCSV = () => {
  const csv = convertToCSV(logs.value)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `chat_logs_${timestamp}.csv`)
  
  document.body.appendChild(link)
  link.click()
  
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

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
const filteredLogs = computed((): ChatLog[] => {
  if (!search.value) return logs.value
  
  const searchTerm = search.value.toLowerCase()
  return logs.value.filter(log => 
    log.query.toLowerCase().includes(searchTerm) ||
    log.response.toLowerCase().includes(searchTerm)
  )
})
</script> 