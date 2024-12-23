<template>
  <div class="chat-container">
    <UCard class="messages-container" :ui="{ 
      base: 'h-full overflow-auto',
      background: 'bg-gray-50 dark:bg-gray-900',
      divide: 'divide-gray-200 dark:divide-gray-800',
      ring: 'ring-1 ring-gray-200 dark:ring-gray-800'
    }" ref="messagesContainer">
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
    
    <div class="input-container dark:bg-gray-900 dark:border-gray-700">
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
          form: 'block w-full rounded-md dark:bg-gray-800',
          input: 'dark:text-white placeholder-gray-400 dark:placeholder-gray-500'
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
</template>

<script setup>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { watch, onMounted } from 'vue';

const userInput = ref('')
const messages = ref([])
const isLoading = ref(false)
const messagesContainer = ref(null)

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
    // If content is a string, return it directly after sanitization
    if (typeof content === 'string') {
      return DOMPurify.sanitize(marked.parse(content));
    }

    // If content is an object, try to extract the message
    if (typeof content === 'object') {
      const messageText = 
        (typeof content === 'string' ? content : null) || // Direct string
        content.text || // Direct text
        content.response || // Agent response
        content.message || // Message format
        content.completion || // Completion response
        (Array.isArray(content) ? content.join('') : null) || // Array of chunks
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

    messages.value.push({ 
      role: 'assistant', 
      content: response.response
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
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  @apply dark:shadow-gray-900/50;
}

.message-input {
  flex-grow: 1;
}

/* Dark mode styles for markdown content */
.message-content :deep(p) {
  margin: 0.5em 0;
  @apply dark:text-gray-200;
}

.message-content :deep(code) {
  @apply bg-gray-100 dark:bg-gray-800;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.message-content :deep(pre) {
  @apply bg-gray-100 dark:bg-gray-800;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.message-content :deep(ul), 
.message-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 2em;
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
  @apply text-gray-600 dark:text-gray-400;
}

/* System message specific styles */
.message.system .message-content {
  @apply bg-red-50 dark:bg-red-950;
  text-align: center;
  width: 100%;
}
</style> 