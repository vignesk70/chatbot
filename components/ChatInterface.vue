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
          
          <!-- Loading indicator -->
          <div v-if="message.isLoading" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span>We are getting your question answered</span>
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          <!-- Feedback section -->
          <div v-if="message.role === 'assistant' && !message.isLoading" class="feedback-section">
            <div v-if="!message.feedbackGiven" class="flex items-center justify-end gap-2 mt-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">Was this helpful?</span>
              <UButton
                size="xs"
                color="gray"
                variant="ghost"
                :ui="{
                  base: 'transition-colors duration-200',
                  color: 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
                }"
                @click="submitFeedback(index, true)"
              >
                <UIcon name="i-heroicons-hand-thumb-up" class="w-5 h-5" />
              </UButton>
              <UButton
                size="xs"
                color="gray"
                variant="ghost"
                :ui="{
                  base: 'transition-colors duration-200',
                  color: 'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                }"
                @click="submitFeedback(index, false)"
              >
                <UIcon name="i-heroicons-hand-thumb-down" class="w-5 h-5" />
              </UButton>
            </div>
            <div v-else class="flex items-center justify-end gap-2 mt-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ message.isHelpful ? 'Marked as helpful' : 'Marked as not helpful' }}
              </span>
              <UIcon 
                :name="message.isHelpful ? 'i-heroicons-hand-thumb-up' : 'i-heroicons-hand-thumb-down'"
                class="w-5 h-5"
                :class="message.isHelpful ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll to Bottom Button -->
      <button
        v-show="showScrollButton"
        @click="scrollToBottom"
        class="fixed bottom-24 right-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 flex items-center gap-2"
      >
        <UIcon name="i-heroicons-arrow-down" class="w-5 h-5" />
        <span class="text-sm">New Messages</span>
      </button>
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
        {{ isLoading ? 'Processing...' : 'Send' }}
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

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface Citation {
  title: string;
  url?: string | null;
  snippet?: string | null;
  location?: {
    start?: number;
    end?: number;
  } | null;
}

interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string | {
    response: string;
    citations?: Citation[];
  };
  sessionId?: string;
  feedbackGiven?: boolean;
  isHelpful?: boolean | null;
  isLoading?: boolean;
}

const userInput = ref('')
const messages = ref<Message[]>([])
const isLoading = ref(false)
const messagesContainer = ref(null)
const showConfirmModal = ref(false)
const showScrollButton = ref(false)
const isNearBottom = ref(true)

// Load messages from localStorage on component mount
onMounted(() => {
  const savedMessages = localStorage.getItem('chatMessages')
  if (savedMessages) {
    try {
      messages.value = JSON.parse(savedMessages).map(msg => ({
        ...msg,
        feedbackGiven: msg.feedbackGiven || false,
        isHelpful: msg.hasOwnProperty('isHelpful') ? msg.isHelpful : null
      }))
    } catch (error) {
      console.error('Error loading saved messages:', error)
      localStorage.removeItem('chatMessages')
    }
  }

  if (messagesContainer.value?.$el) {
    messagesContainer.value.$el.addEventListener('scroll', handleScroll)
    scrollToBottom() // Initial scroll to bottom
  }
})

// Save messages to localStorage whenever they change
watch(messages, (newMessages) => {
  localStorage.setItem('chatMessages', JSON.stringify(newMessages))
}, { deep: true })

const formatMessage = (content: string | { response: string; citations?: Citation[] }) => {
  try {
    if (typeof content === 'string') {
      return DOMPurify.sanitize(marked.parse(content))
    }

    if (typeof content === 'object') {
      let messageText = content.response
      const citations = content.citations || []

      // Debug citations in client
      console.log('Formatting citations:', citations)

      let citationsHtml = ''
      if (citations && citations.length > 0) {
        citationsHtml = `
          <div class="citations-section mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <details class="citation-details">
              <summary class="flex items-center cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <svg class="w-4 h-4 mr-2 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                Sources (${citations.length})
              </summary>
              <div class="pl-4 space-y-3 mt-2">
                ${citations.map((citation, index) => `
                  <div class="citation-item">
                    <div class="flex items-start gap-2">
                      <span class="text-blue-600 dark:text-blue-400 font-medium">[${index + 1}]</span>
                      <div class="flex-1">
                        ${citation.url ? `
                          <a 
                            href="${citation.url}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            ${citation.title}
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ` : citation.title}
                        ${citation.snippet ? `
                          <div class="text-gray-600 dark:text-gray-400 text-sm mt-1 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            ${citation.snippet}
                          </div>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </details>
          </div>
        `
      }

      return DOMPurify.sanitize(marked.parse(messageText) + citationsHtml)
    }

    return DOMPurify.sanitize(marked.parse(String(content)))
  } catch (error) {
    console.error('Error formatting message:', error)
    return 'Error displaying message'
  }
}

// Add function to get screen resolution
const getScreenResolution = () => {
  if (typeof window !== 'undefined') {
    return `${window.screen.width}x${window.screen.height}`;
  }
  return 'unknown';
}

// Update the sendMessage function
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const userMessage = userInput.value.trim()
  messages.value.push({ role: 'user', content: userMessage })
  
  // Add loading message with empty content
  const loadingMessageIndex = messages.value.length
  messages.value.push({ 
    role: 'assistant', 
    content: '', // Remove the loading text from here since we show it in the template
    isLoading: true 
  })
  
  userInput.value = ''
  isLoading.value = true

  try {
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: { 
        message: userMessage,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: getScreenResolution()
      }
    })

    // Replace loading message with actual response
    messages.value[loadingMessageIndex] = { 
      role: 'assistant', 
      content: {
        response: response.response,
        citations: response.citations
      },
      sessionId: response.sessionId,
      feedbackGiven: false,
      isHelpful: null,
      isLoading: false
    }

    localStorage.setItem('chatMessages', JSON.stringify(messages.value))
  } catch (error) {
    console.error('Error sending message:', error)
    // Replace loading message with error
    messages.value[loadingMessageIndex] = { 
      role: 'system', 
      content: `Error: ${error.message || 'Unknown error occurred'}`
    }
  } finally {
    isLoading.value = false
    nextTick(() => {
      if (messagesContainer.value?.$el) {
        messagesContainer.value.$el.scrollTo({
          top: messagesContainer.value.$el.scrollHeight,
          behavior: 'smooth'
        })
      }
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

// Update the submitFeedback function
const submitFeedback = async (messageIndex, isHelpful) => {
  try {
    const message = messages.value[messageIndex]
    const userMessage = messages.value[messageIndex - 1]

    // Send feedback with user details
    await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        sessionId: message.sessionId,
        query: userMessage?.content || '',
        response: typeof message.content === 'string' ? message.content : message.content.response,
        isHelpful,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: getScreenResolution()
      }
    })

    // Update message with feedback state
    messages.value[messageIndex] = {
      ...message,
      feedbackGiven: true,
      isHelpful
    }

    // Save to localStorage
    localStorage.setItem('chatMessages', JSON.stringify(messages.value))

  } catch (error) {
    console.error('Error submitting feedback:', error)
    messages.value.push({ 
      role: 'system', 
      content: 'Failed to submit feedback. Please try again.'
    })
  }
}

// Add scroll handler
const handleScroll = () => {
  if (!messagesContainer.value?.$el) return
  
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value.$el
  const scrollBottom = scrollHeight - scrollTop - clientHeight
  
  // Show button if not near bottom and there are messages
  isNearBottom.value = scrollBottom < 100
  showScrollButton.value = !isNearBottom.value && messages.value.length > 0
}

// Scroll to bottom function
const scrollToBottom = () => {
  if (!messagesContainer.value?.$el) return
  
  messagesContainer.value.$el.scrollTo({
    top: messagesContainer.value.$el.scrollHeight,
    behavior: 'smooth'
  })
}

// Update watch for messages to handle auto-scroll
watch(messages, () => {
  nextTick(() => {
    if (isNearBottom.value || messages.value[messages.value.length - 1]?.isLoading) {
      scrollToBottom()
    } else {
      showScrollButton.value = true
    }
  })
}, { deep: true })

// Clean up scroll listener
onUnmounted(() => {
  if (messagesContainer.value?.$el) {
    messagesContainer.value.$el.removeEventListener('scroll', handleScroll)
  }
})
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

.feedback-section {
  opacity: 0.8;
  transition: opacity 0.2s;
}

.feedback-section:hover {
  opacity: 1;
}

/* Add animation for feedback buttons */
.feedback-section button {
  transform: scale(1);
  transition: transform 0.2s;
}

.feedback-section button:hover {
  transform: scale(1.1);
}

/* Add loading dots animation */
.loading-dots {
  display: inline-flex;
  gap: 2px;
}

.loading-dots span {
  width: 4px;
  height: 4px;
  background-color: currentColor;
  border-radius: 50%;
  animation: dots 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dots {
  0%, 80%, 100% { 
    transform: scale(0);
    opacity: 0;
  }
  40% { 
    transform: scale(1);
    opacity: 1;
  }
}

/* Add styles for scroll button animation */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.scroll-button-enter-active,
.scroll-button-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.scroll-button-enter-from,
.scroll-button-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.citation-item {
  @apply p-2 rounded-md bg-gray-50 dark:bg-gray-800;
}
</style> 