/**
 * useVoiceInput — cross-browser voice capture hook using MediaRecorder + Whisper.
 *
 * Strategy:
 *   1. Use MediaRecorder to capture audio in the browser (works in Chrome, Firefox, Safari).
 *   2. When recording stops, encode the audio blob as base64.
 *   3. Send to the server-side `voice.transcribe` tRPC procedure which uploads to S3
 *      and calls Whisper for transcription.
 *   4. Return the transcript text via the `onTranscript` callback.
 *
 * Falls back gracefully: if MediaRecorder is not available (very old browsers),
 * `isSupported` will be false and the mic button should be hidden.
 */

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export type VoiceInputState = "idle" | "recording" | "processing" | "error";

export interface UseVoiceInputOptions {
  /** Called with the final transcript text when transcription succeeds. */
  onTranscript: (text: string) => void;
  /** Optional: called when an error occurs (in addition to the default toast). */
  onError?: (message: string) => void;
}

export interface UseVoiceInputReturn {
  /** Whether MediaRecorder is available in this browser. */
  isSupported: boolean;
  /** Current state of the voice input lifecycle. */
  state: VoiceInputState;
  /** True while recording is active. */
  isRecording: boolean;
  /** True while audio is being sent to Whisper. */
  isProcessing: boolean;
  /** Start recording audio. */
  startRecording: () => Promise<void>;
  /** Stop recording and trigger transcription. */
  stopRecording: () => void;
  /** Toggle between start and stop. */
  toggle: () => Promise<void>;
}

/** Pick the best supported MIME type for this browser. */
function getBestMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return ""; // Let the browser choose
}

/** Convert a Blob to a base64 string. */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip the data URL prefix (e.g. "data:audio/webm;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useVoiceInput({ onTranscript, onError }: UseVoiceInputOptions): UseVoiceInputReturn {
  const isSupported = typeof window !== "undefined" && !!window.MediaRecorder;

  const [state, setState] = useState<VoiceInputState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const transcribeMutation = trpc.voice.transcribe.useMutation({
    onSuccess: (data) => {
      if (data.text) {
        onTranscript(data.text);
      } else {
        const msg = "No speech detected — please try again.";
        toast.error(msg);
        onError?.(msg);
      }
      setState("idle");
    },
    onError: (err) => {
      const msg = err.message || "Transcription failed — please try again.";
      toast.error(msg);
      onError?.(msg);
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    },
  });

  const startRecording = useCallback(async () => {
    if (!isSupported) return;
    if (state !== "idle" && state !== "error") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = getBestMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Stop all tracks to release the microphone
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });

        if (blob.size < 100) {
          // Too small — likely silence or immediate stop
          setState("idle");
          return;
        }

        setState("processing");
        try {
          const base64 = await blobToBase64(blob);
          transcribeMutation.mutate({
            audioBase64: base64,
            mimeType: mimeType || "audio/webm",
          });
        } catch {
          const msg = "Failed to process audio — please try again.";
          toast.error(msg);
          onError?.(msg);
          setState("error");
          setTimeout(() => setState("idle"), 2000);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // Collect chunks every 250ms
      setState("recording");
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access denied — please allow access in your browser settings."
          : "Could not access microphone — please check your device settings.";
      toast.error(msg);
      onError?.(msg);
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }, [isSupported, state, transcribeMutation, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      // State transitions to "processing" inside onstop handler
    }
  }, [state]);

  const toggle = useCallback(async () => {
    if (state === "recording") {
      stopRecording();
    } else if (state === "idle" || state === "error") {
      await startRecording();
    }
  }, [state, startRecording, stopRecording]);

  return {
    isSupported,
    state,
    isRecording: state === "recording",
    isProcessing: state === "processing",
    startRecording,
    stopRecording,
    toggle,
  };
}
