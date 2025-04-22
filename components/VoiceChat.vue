<template>
    <div class="flex flex-col items-center justify-center">
        <UIcon size="2xl" name="i-heroicons-microphone-solid" @click="handleVoiceChat" 
        class="w-8 h-8"
        :class="isRecording ? 'text-red-500 animate-pulse scale-75' : 'text-gray-500'" />
        <p v-if="isRecording" :class="isRecording ? 'text-xs text-red-500' : 'text-sm text-gray-500'">Rec...</p>
        <div v-if="audioUrl && !isRecording" class="mt-4">
      <p>🎧 Recorded Audio:</p>
      <audio :src="audioUrl" controls class="mt-2" />
    </div>
    </div>
</template>

<script setup lang="ts">
const { transcript, audio, isRecording, startRecording, stopRecording, error, audioUrl} = useAudioTranscript();
const isProcessing = ref(false);

const handleVoiceChat = async () => {
  if (isRecording.value) {
    isProcessing.value = true;
    await stopRecording();
    
    isProcessing.value = false;
  } else {
    await startRecording();
  }
};

watch(audioUrl, (newUrl) => {
    if (newUrl) {
        const link = document.createElement('a')
        link.href = newUrl
        link.download = 'recording.webm'
        link.click()
    }
})
</script>

