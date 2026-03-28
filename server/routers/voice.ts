/**
 * Voice router — audio transcription via Whisper.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { transcribeAudio } from "../_core/voiceTranscription";
import { storagePut } from "../storage";

export const voiceRouter = router({
  /**
   * Accepts a base64-encoded audio clip, uploads it to S3, and returns the
   * Whisper transcription.  The mimeType is restricted to a strict allowlist
   * to prevent arbitrary Content-Type injection.
   */
  transcribe: protectedProcedure
    .input(z.object({
      audioBase64: z.string(),
      mimeType: z
        .enum(["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"])
        .default("audio/webm"),
    }))
    .mutation(async ({ ctx, input }) => {
      const audioBuffer = Buffer.from(input.audioBase64, "base64");
      const ext = input.mimeType.includes("webm") ? "webm"
        : input.mimeType.includes("mp4") || input.mimeType.includes("m4a") ? "m4a"
        : input.mimeType.includes("ogg") ? "ogg"
        : input.mimeType.includes("wav") ? "wav"
        : "webm";
      const fileKey = `voice/${ctx.user.id}/${Date.now()}.${ext}`;
      const { url: audioUrl } = await storagePut(fileKey, audioBuffer, input.mimeType);

      const result = await transcribeAudio({
        audioUrl,
        language: "en",
        prompt: "Transcribe the user's task or note",
      });

      if ("error" in result) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: result.error });
      }

      return { text: result.text.trim() };
    }),
});
