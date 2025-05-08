function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
}

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    try {
        const audioBuffer = await audioBlob.arrayBuffer();
        const base64Audio = arrayBufferToBase64(audioBuffer);

        const response = await $fetch('/api/transcribe', {
            method: 'POST',
            body: {
                audioData: base64Audio
            }
        });

        return response.transcript;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
}; 