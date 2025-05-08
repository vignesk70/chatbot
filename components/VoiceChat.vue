<template>
  <div class="flex flex-col w-full items-center justify-center">
    <div class="flex flex-row w-full">
      <div class="flex flex-col w-12 ">
        <UIcon size="2xl" name="i-heroicons-microphone-solid" @click="handleVoiceChat" class="w-8 h-8 mr-4"
          :class="isRecording ? 'text-red-500 animate-pulse scale-75' : 'text-gray-500'" />
        <p v-if="isRecording" :class="isRecording ? 'text-xs text-red-500' : 'text-sm text-gray-500'">Rec...</p>
      </div>

      <div class="flex flex-row w-full gap-3">
        <UTextarea v-model="transcript" :rows="2" :auto-rows="true" placeholder="Voice transcript..."
          :disabled="!transcript" @keyup.enter.prevent="sendTranscipt" class="w-full" :ui="{
            base: ' w-full',
            input: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }" />
        <UButton @click="sendTranscipt" :loading="isLoading" :disabled="isLoading || !transcript.trim()" color="primary"
          variant="solid" icon="i-heroicons-paper-airplane">
          {{ isLoading ? 'Processing...' : 'Send' }}
        </UButton>
      </div>
    </div>
    <div v-if="audioUrl && !isRecording" class="mt-4 flex flex-row">
      <p class="text-sm">🎧 Recorded Audio:</p>
      <audio :src="audioUrl" controls class=" ml-4 h-5" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { UTextarea } from '#components';

const { transcript, audio, isRecording, startRecording, stopRecording, error, audioUrl } = useAudioTranscript();
const isLoading = ref(false);

const handleVoiceChat = async () => {
  if (isRecording.value) {
    await stopRecording();
  } else {
    await startRecording();
  }
};

const sendTranscipt = async () => {
  if (isLoading.value || !transcript.value.trim()) return;
  
  isLoading.value = true;
  try {
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        message: transcript.value,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: getScreenResolution()
      }
    });

    // Emit the response to the parent component
    emit('response', {
      role: 'assistant',
      content: {
        response: response.response,
        citations: response.citations
      },
      sessionId: response.sessionId
    });

    // Clear the transcript and audio URL
    transcript.value = "";
    audioUrl.value = "";
  } catch (error) {
    console.error('Error sending transcript:', error);
    emit('error', error);
    transcript.value = "";
    audioUrl.value = "";
  } finally {
    isLoading.value = false;
  }
};

// Add function to get screen resolution
const getScreenResolution = () => {
  if (typeof window !== 'undefined') {
    return `${window.screen.width}x${window.screen.height}`;
  }
  return 'unknown';
};

// Define emits
const emit = defineEmits<{
  (e: 'response', response: any): void;
  (e: 'error', error: any): void;
}>();
</script>
