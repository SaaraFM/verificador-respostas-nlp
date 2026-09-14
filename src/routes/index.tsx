import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { gradeAnswer } from "@/lib/grader.functions";
import type { AnalysisResult, FeedbackLevel } from "@/lib/nlp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Verificador de Respostas com PLN" },
      {
        name: "description",
        content:
          "Compare respostas com processamento de linguagem natural: TF-IDF, similaridade do cosseno, nota de 0 a 100 e feedback automático.",
      },
      { property: "og:title", content: "Verificador de Respostas com PLN" },
      {
        property: "og:description",
        content:
          "Analise a similaridade entre a resposta esperada e a resposta do usuário usando TF-IDF e similaridade do cosseno.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const FEEDBACK_STYLES: Record<
  FeedbackLevel,
  { badge: string; bar: string; description: string }
> = {
  entendeu: {
    badge: "bg-success text-success-foreground",
    bar: "[&>div]:bg-success",
    description: "A resposta demonstra compreensão do conteúdo esperado.",
  },
  parcial: {
    badge: "bg-warning text-warning-foreground",
    bar: "[&>div]:bg-warning",
    description: "A resposta cobre parte do conteúdo, mas está incompleta.",
  },
  nao_entendeu: {
    badge: "bg-destructive text-destructive-foreground",
    bar: "[&>div]:bg-destructive",
    description: "A resposta se distancia bastante do conteúdo esperado.",
  },
};

function Index() {
  const [question, setQuestion] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setError(null);
    if (!question.trim() || !expectedAnswer.trim() || !userAnswer.trim()) {
      setError("Preencha a pergunta e as duas respostas antes de analisar.");
      return;
    }
    setIsLoading(true);
    try {
      const analysis = await gradeAnswer({
        data: { question, expectedAnswer, userAnswer },
      });
      setResult(analysis);
    } catch {
      setError("Não foi possível analisar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <BrainCircuit className="size-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Verificador de Respostas com PLN
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Comparação semântica com TF-IDF e similaridade do cosseno, com nota
            de 0 a 100 e feedback automático.
          </p>
        </header>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Dados da análise</CardTitle>
            <CardDescription>
              Informe a pergunta, a resposta esperada e a resposta do usuário.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="question">Pergunta</Label>
              <Textarea
                id="question"
                placeholder="Ex.: O que é fotossíntese?"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expected">Resposta esperada</Label>
              <Textarea
                id="expected"
                placeholder="Ex.: Fotossíntese é o processo pelo qual as plantas convertem luz solar em energia."
                value={expectedAnswer}
                onChange={(event) => setExpectedAnswer(event.target.value)}
                rows={3}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-answer">Resposta do usuário</Label>
              <Textarea
                id="user-answer"
                placeholder="Ex.: É quando as plantas usam a luz do sol para produzir energia."
                value={userAnswer}
                onChange={(event) => setUserAnswer(event.target.value)}
                rows={3}
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Analisando…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden />
                  Analisar respostas
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result ? (
          <Card className="shadow-sm" aria-live="polite">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg">Resultado</CardTitle>
                <Badge className={FEEDBACK_STYLES[result.feedback].badge}>
                  {result.feedbackLabel}
                </Badge>
              </div>
              <CardDescription>
                {FEEDBACK_STYLES[result.feedback].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-end justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Similaridade
                </span>
                <span className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
                  {result.score}
                  <span className="text-lg font-medium text-muted-foreground">
                    /100
                  </span>
                </span>
              </div>
              <Progress
                value={result.score}
                className={FEEDBACK_STYLES[result.feedback].bar}
                aria-label={`Similaridade de ${result.score} por cento`}
              />
              <p className="text-xs text-muted-foreground">
                Textos pré-processados (minúsculas, sem pontuação e sem
                palavras comuns), vetorizados com TF-IDF e comparados pela
                similaridade do cosseno.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
