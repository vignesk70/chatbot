<template>
  <div class="chat-container">
    <UCard class="messages-container" :ui="{ 
      base: 'h-full overflow-auto',
      background: 'bg-gray-50 dark:bg-gray-900',
      divide: 'divide-gray-200 dark:divide-gray-800',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800'
    }" ref="messagesContainer">
      <!-- Clear History Button Container -->
      <div v-if="messages.length > 0" class="clear-history-container">
        <UButton
          size="sm"
          color="gray"
          variant="soft"
          icon="i-heroicons-trash"
          @click="confirmClearHistory"
          :ui="{
            base: 'transition-colors duration-200',
            background: 'hover:bg-red-100 dark:hover:bg-red-900',
            color: 'text-gray-700 dark:text-gray-300'
          }"
        >
          Clear History
        </UButton>
      </div>

      <!-- Messages -->
      <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
        <UAvatar
          v-if="message.role === 'assistant'"
          src="/bot-avatar.png"
          alt="Bot"
          size="sm"
        />
        <UAvatar
          v-if="message.role === 'user'"
          :src="'/user-avatar.png'"
          alt="User"
          size="sm"
        />
        <div class="message-content" :class="{
          'bg-blue-50 dark:bg-blue-950': message.role === 'user',
          'bg-gray-100 dark:bg-gray-800': message.role === 'assistant',
          'bg-red-50 dark:bg-red-950': message.role === 'system'
        }">
          <div v-html="formatMessage(message.content)"></div>
        </div>
      </div>
    </UCard>
    
    <div class="input-container dark:bg-gray-800 dark:border-gray-700">
      <UTextarea
        v-model="userInput"
        :rows="2"
        :auto-rows="true"
        placeholder="Type your message..."
        :disabled="isLoading"
        @keyup.enter.prevent="sendMessage"
        class="message-input"
        :ui="{
          base: 'relative w-full',
          input: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }"
      />
      <UButton
        @click="sendMessage"
        :loading="isLoading"
        :disabled="isLoading || !userInput.trim()"
        color="primary"
        variant="solid"
        icon="i-heroicons-paper-airplane"
      >
        {{ isLoading ? 'Sending...' : 'Send' }}
      </UButton>
    </div>
  </div>

  <!-- Confirmation Modal -->
  <UModal v-model="showConfirmModal">
    <UCard :ui="{
      background: 'bg-white dark:bg-gray-900',
      divide: 'divide-gray-200 dark:divide-gray-800',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800'
    }">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-exclamation-triangle" class="text-yellow-500" />
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Clear Chat History
          </h3>
        </div>
      </template>

      <p class="text-gray-700 dark:text-gray-300">
        Are you sure you want to clear all chat messages? This action cannot be undone.
      </p>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            size="sm"
            color="gray"
            variant="soft"
            @click="showConfirmModal = false"
          >
            Cancel
          </UButton>
          <UButton
            size="sm"
            color="red"
            variant="solid"
            @click="clearHistory"
          >
            Clear History
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { watch, onMounted } from 'vue';

const userInput = ref('')
const messages = ref([])
const isLoading = ref(false)
const messagesContainer = ref(null)
const showConfirmModal = ref(false)

// Load messages from localStorage on component mount
onMounted(() => {
  const savedMessages = localStorage.getItem('chatMessages')
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages)
  }
})

// Save messages to localStorage whenever they change
watch(messages, (newMessages) => {
  localStorage.setItem('chatMessages', JSON.stringify(newMessages))
}, { deep: true })

const formatMessage = (content) => {
  try {
    console.log('Formatting message content:', content);

    // If content is a string, return it directly after sanitization
    if (typeof content === 'string') {
      return DOMPurify.sanitize(marked.parse(content));
    }

    // If content is an object, try to extract the message
    if (typeof content === 'object') {
      console.log('Message object structure:', JSON.stringify(content, null, 2));

      // Try different possible response formats
      const messageText = 
        content.text || // Direct text
        content.response || // Agent response
        content.message || // Message format
        (typeof content === 'object' ? JSON.stringify(content, null, 2) : String(content));

      return DOMPurify.sanitize(marked.parse(messageText));
    }

    return DOMPurify.sanitize(marked.parse(String(content)));
  } catch (error) {
    console.error('Error formatting message:', error);
    return 'Error displaying message';
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const userMessage = userInput.value.trim()
  messages.value.push({ role: 'user', content: userMessage })
  userInput.value = ''
  isLoading.value = true

  try {
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: { message: userMessage }
    })

    // Log the raw response
    console.log('Raw API Response:', response);

    // Extract the response content
    let formattedResponse = response.response;
    
    // If debug information is available, log it
    if (response.debug) {
      console.log('Debug Info:', response.debug);
    }

    messages.value.push({ 
      role: 'assistant', 
      content: formattedResponse
    })
  } catch (error) {
    console.error('Error sending message:', error)
    messages.value.push({ 
      role: 'system', 
      content: `Error: ${error.message || 'Unknown error occurred'}`
    })
  } finally {
    isLoading.value = false
    nextTick(() => {
      messagesContainer.value?.$el.scrollTo({
        top: messagesContainer.value.$el.scrollHeight,
        behavior: 'smooth'
      })
    })
  }
}

// Function to show confirmation modal
const confirmClearHistory = () => {
  showConfirmModal.value = true
}

// Function to clear history
const clearHistory = () => {
  messages.value = []
  localStorage.removeItem('chatMessages')
  showConfirmModal.value = false
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  gap: 1rem;
}

.messages-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  align-items: start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 80%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  @apply text-gray-900 dark:text-gray-100;
}

.input-container {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  @apply bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50;
}

.message-input {
  flex-grow: 1;
}

/* Dark mode styles for markdown content */
.message-content :deep(p) {
  margin: 0.5em 0;
  @apply text-gray-900 dark:text-gray-100;
}

.message-content :deep(code) {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.message-content :deep(pre) {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.message-content :deep(ul), 
.message-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 2em;
  @apply text-gray-900 dark:text-gray-100;
}

.message-content :deep(a) {
  @apply text-blue-600 dark:text-blue-400;
  text-decoration: none;
}

.message-content :deep(a:hover) {
  text-decoration: underline;
}

.message-content :deep(blockquote) {
  @apply border-l-4 border-gray-300 dark:border-gray-600;
  margin: 0.5em 0;
  padding-left: 1em;
  @apply text-gray-700 dark:text-gray-300;
}

.clear-history-container {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem;
  @apply bg-gray-50/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm;
}

/* Message background colors */
.message.assistant .message-content {
  @apply bg-gray-100 dark:bg-gray-800;
}

.message.user .message-content {
  @apply bg-blue-50 dark:bg-blue-900;
}

.message.system .message-content {
  @apply bg-red-50 dark:bg-red-900 text-center w-full;
}
</style> 