/**
 * Survey router — waitlist survey submission and admin retrieval.
 */
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { createSurveyResponse, getAllSurveyResponses } from "../db";
import { notifyOwner } from "../_core/notification";

export const surveyRouter = router({
  /** Accepts a waitlist survey response and notifies the owner. */
  submit: publicProcedure
    .input(z.object({
      roleValidation: z.enum(["spot-on", "mostly", "no"]).optional(),
      painPoint: z.enum(["starting", "planning", "remembering", "shame"]).optional(),
      featureFit: z.enum(["body-double", "shield", "cheerleader", "secretary"]).optional(),
      email: z.string().email().optional().or(z.literal("")),
    }))
    .mutation(async ({ input }) => {
      await createSurveyResponse({
        roleValidation: input.roleValidation,
        painPoint: input.painPoint,
        featureFit: input.featureFit,
        email: input.email || undefined,
      });

      const emailLine = input.email ? `📧 ${input.email}` : "No email provided";
      const detailLines = [
        emailLine,
        input.roleValidation ? `Role fit: ${input.roleValidation}` : null,
        input.painPoint     ? `Pain point: ${input.painPoint}`     : null,
        input.featureFit    ? `Feature fit: ${input.featureFit}`   : null,
      ].filter(Boolean).join("\n");

      notifyOwner({
        title: "🎉 New Taskbloom waitlist signup",
        content: detailLines,
      }).catch(err => console.warn("[survey.submit] notifyOwner failed:", err));

      return { success: true };
    }),

  /** Returns all survey responses — admin only to protect respondent email addresses. */
  getAll: adminProcedure.query(async () => getAllSurveyResponses()),
});
