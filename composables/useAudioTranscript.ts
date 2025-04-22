export const useAudioTranscript = () => {
    const transcript = ref('');
    const audio = ref<Blob | null>(null);
    const isRecording = ref(false);
    const mediaRecorder = ref<MediaRecorder | null>(null);
    const audioChunks = ref<Blob[]>([]);
    const error = ref<string | null>(null);
    const audioUrl = ref<string | null>(null)
    //start recording
    const startRecording = async () => {
        console.log('composable - startRecording');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.value = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            audioChunks.value = [];
            mediaRecorder.value.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.value.push(event.data);
                }
            };
            mediaRecorder.value.start(100); // Collect data every 100ms for streaming
            isRecording.value = true;
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }

    const stopRecording = () => {
        console.log('composable - stopRecording');
        if (!mediaRecorder.value) return;

        return new Promise<Blob>((resolve) => {
            mediaRecorder.value!.onstop = async () => {
                try {
                    const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm;codecs=opus' });
                    audio.value = audioBlob;
                    resolve(audioBlob);
                    console.log('audioBlob', audioBlob.size, audioBlob.type);
                    audioUrl.value = URL.createObjectURL(audioBlob);
                   
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    error.value = `Failed to process audio: ${errorMessage}`;
                    console.error('Error processing audio:', err);
                    resolve();
                }
            }
            mediaRecorder.value!.stop();
            mediaRecorder.value!.stream.getTracks().forEach(track => track.stop());
            isRecording.value = false;
            
        })
    }

    return {
        transcript,
        audio,
        isRecording,
        startRecording,
        stopRecording,
        error,
        audioUrl,
    }

}
