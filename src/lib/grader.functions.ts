import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeAnswers, type AnalysisResult } from "./nlp";

const gradeInputSchema = z.object({
  question: z.string().trim().min(1, "Informe a pergunta."),
  expectedAnswer: z.string().trim().min(1, "Informe a resposta esperada."),
  userAnswer: z.string().trim().min(1, "Informe a resposta do usuário."),
});

export const gradeAnswer = createServerFn({ method: "POST" })
  .inputValidator((data) => gradeInputSchema.parse(data))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    return analyzeAnswers(data.expectedAnswer, data.userAnswer);
  });
