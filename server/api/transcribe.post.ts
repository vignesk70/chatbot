import { TranscribeStreamingClient, StartStreamTranscriptionCommand } from '@aws-sdk/client-transcribe-streaming';

interface AWSError extends Error {
    code?: string;
    statusCode?: number;
}

export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig();
        const body = await readBody(event);
        const audioData = body.audioData;

        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBuffer = bytes.buffer;

        const client = new TranscribeStreamingClient({
            region: config.awsRegion,
            credentials: {
                accessKeyId: config.awsAccessKeyId,
                secretAccessKey: config.awsSecretAccessKey
            }
        });

        const audioStream = {
            async *[Symbol.asyncIterator]() {
                try {
                    const chunkSize = 1024;
                    for (let i = 0; i < audioBuffer.byteLength; i += chunkSize) {
                        const chunk = new Uint8Array(audioBuffer.slice(i, i + chunkSize));
                        yield { AudioEvent: { AudioChunk: chunk } };
                    }
                } catch (error) {
                    throw error;
                }
            }
        };

        const command = new StartStreamTranscriptionCommand({
            LanguageCode: 'en-US',
            MediaEncoding: 'pcm',
            MediaSampleRateHertz: 16000,
            AudioStream: audioStream,
            EnablePartialResultsStabilization: true,
            PartialResultsStability: 'high',
            ShowSpeakerLabel: false
        });

        const response = await client.send(command);
        let transcript = '';

        for await (const event of response.TranscriptResultStream || []) {
            if (event.TranscriptEvent?.Transcript?.Results?.[0]?.Alternatives?.[0]?.Transcript) {
                transcript = event.TranscriptEvent.Transcript.Results[0].Alternatives[0].Transcript;
            }
        }

        return { transcript };

    } catch (error) {
        const awsError = error as AWSError;
        throw createError({
            statusCode: 500,
            message: `Failed to transcribe audio: ${awsError.message}`
        });
    }
}); 