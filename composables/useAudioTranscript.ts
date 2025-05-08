import { transcribeAudio } from './transcribeAudio';

export const useAudioTranscript = () => {
    const transcript = ref('');
    const audio = ref<Blob | null>(null);
    const isRecording = ref(false);
    const mediaRecorder = ref<MediaRecorder | null>(null);
    const audioChunks = ref<Blob[]>([]);
    const error = ref<string | null>(null);
    const audioUrl = ref<string | null>(null);
    const audioContext = ref<AudioContext | null>(null);
    const mediaStream = ref<MediaStream | null>(null);

    //start recording
    const startRecording = async () => {
        try {
            audioContext.value = new AudioContext();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream.value = stream;
            
            // Create a MediaRecorder with the original stream
            mediaRecorder.value = new MediaRecorder(stream);
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

    const convertToPCM = async (audioBlob: Blob): Promise<Blob> => {
        if (!audioContext.value) {
            throw new Error('AudioContext not initialized');
        }

        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer);
        
        // Create a new AudioBuffer with the desired sample rate (16kHz)
        const offlineCtx = new OfflineAudioContext(
            1, // mono
            Math.ceil(audioBuffer.duration * 16000), // 16kHz sample rate
            16000 // 16kHz sample rate
        );
        
        // Create a buffer source
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        
        // Start the source
        source.start(0);
        
        // Render the audio
        const renderedBuffer = await offlineCtx.startRendering();
        
        // Convert to PCM
        const pcmData = renderedBuffer.getChannelData(0);
        const pcmArray = new Int16Array(pcmData.length);
        
        // Convert float32 to int16
        for (let i = 0; i < pcmData.length; i++) {
            const s = Math.max(-1, Math.min(1, pcmData[i]));
            pcmArray[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Create a new blob with the PCM data
        return new Blob([pcmArray.buffer], { type: 'audio/pcm' });
    }

    const stopRecording = () => {
        if (!mediaRecorder.value) return;

        return new Promise<Blob>((resolve) => {
            mediaRecorder.value!.onstop = async () => {
                try {
                    // Create the initial blob from chunks
                    const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
                    
                    // Convert to PCM
                    const pcmBlob = await convertToPCM(audioBlob);
                    audio.value = pcmBlob;
                    resolve(pcmBlob);
                    
                    audioUrl.value = URL.createObjectURL(audioBlob);
                    
                    //send for transcription
                    const transcription = await transcribeAudio(pcmBlob);
                    transcript.value = transcription;
                   
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                    error.value = `Failed to process audio: ${errorMessage}`;
                    console.error('Error processing audio:', err);
                    // Create a default blob in case of error
                    const defaultBlob = new Blob(audioChunks.value, { type: 'audio/webm' });
                    resolve(defaultBlob);
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
