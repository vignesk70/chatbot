<template>
  <div class="chat-container">
    <UCard class="messages-container" ref="messagesContainer">
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
        <div class="message-content">
          <div v-html="formatMessage(message.content)"></div>
        </div>
      </div>
    </UCard>
    
    <div class="input-container">
      <UTextarea
        v-model="userInput"
        :rows="2"
        :auto-rows="true"
        placeholder="Type your message..."
        :disabled="isLoading"
        @keyup.enter.prevent="sendMessage"
        class="message-input"
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
        content.completion?.response || // Completion response
        content.completion?.message || // Message format
        (content.completion?.options?.messageStream?.options?.decoder?.messageBuffer || []).join(' ') || // Stream buffer
        content.message || // Message format
        (content.chunks ? content.chunks.map(c => c.text).join('') : null) || // Chunked response
        (content.messages ? content.messages[0]?.content : null) || // Messages array
        JSON.stringify(content, null, 2); // Fallback to stringified object

      return DOMPurify.sanitize(marked.parse(messageText));
    }

    // Fallback for other types
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
}

.message.assistant .message-content {
  background-color: #f4f4f5;
}

.message.user .message-content {
  background-color: #e0f2fe;
}

.message.system .message-content {
  background-color: #fee2e2;
  text-align: center;
  width: 100%;
}

.input-container {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.message-input {
  flex-grow: 1;
}

.message-content :deep(p) {
  margin: 0.5em 0;
}

.message-content :deep(code) {
  background-color: #f0f0f0;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.message-content :deep(pre) {
  background-color: #f8f8f8;
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
  color: #2196f3;
  text-decoration: none;
}

.message-content :deep(a:hover) {
  text-decoration: underline;
}

.message-content :deep(blockquote) {
  border-left: 4px solid #e0e0e0;
  margin: 0.5em 0;
  padding-left: 1em;
  color: #666;
}
</style> 