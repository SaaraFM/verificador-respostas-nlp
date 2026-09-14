/**
 * Lógica de PLN: pré-processamento, TF-IDF e similaridade do cosseno.
 * Equivalente ao pipeline clássico em Python (NLTK + scikit-learn),
 * implementado em TypeScript para rodar no servidor.
 */

/** Palavras comuns em português (stopwords) removidas no pré-processamento. */
const STOPWORDS = new Set([
  "a", "as", "o", "os", "um", "uma", "uns", "umas",
  "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
  "por", "para", "com", "sem", "sob", "sobre", "entre", "até", "após",
  "e", "ou", "mas", "que", "se", "como", "quando", "onde", "porque", "pois",
  "eu", "tu", "ele", "ela", "nós", "vós", "eles", "elas",
  "me", "te", "lhe", "nos", "vos", "lhes",
  "meu", "minha", "seu", "sua", "nosso", "nossa",
  "este", "esta", "esse", "essa", "isso", "isto", "aquele", "aquela",
  "ser", "estar", "ter", "haver", "foi", "é", "são", "era", "eram",
  "está", "estão", "tem", "têm", "há",
  "ao", "aos", "à", "às", "pelo", "pela", "pelos", "pelas",
  "muito", "muita", "mais", "menos", "já", "ainda", "também",
  "não", "sim", "só", "então", "assim", "aqui", "ali", "lá",
]);

/**
 * Radicalização simples: remove acentos e sufixos comuns do português
 * (plurais, flexões verbais e nominais), aproximando flexões como
 * "plantas" → "planta" e "solar" → "sol".
 */
const SUFFIXES = [
  "mente", "ações", "acoes", "ção", "ção", "ções", "coes", "ando", "endo",
  "indo", "ados", "adas", "idos", "idas", "ado", "ada", "ido", "ida",
  "ais", "eis", "mente", "es", "s", "ar", "er", "ir",
];

function stem(token: string): string {
  let stemmed = token;
  for (const suffix of SUFFIXES) {
    if (stemmed.endsWith(suffix) && stemmed.length - suffix.length >= 3) {
      stemmed = stemmed.slice(0, -suffix.length);
      break;
    }
  }
  return stemmed;
}

/** Pré-processamento: minúsculas, sem acentos, sem pontuação, sem stopwords e com radicalização. */
export function preprocess(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
    .map(stem);
}

/** Frequência dos termos (TF) de um documento. */
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  return tf;
}

/**
 * Transforma os dois textos em vetores TF-IDF e calcula a
 * similaridade do cosseno entre eles (0 a 1).
 */
export function cosineSimilarityTfidf(textA: string, textB: string): number {
  const tokensA = preprocess(textA);
  const tokensB = preprocess(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const tfA = termFrequency(tokensA);
  const tfB = termFrequency(tokensB);

  // Vocabulário combinado e frequência de documento (DF) para o IDF.
  const vocabulary = new Set([...tfA.keys(), ...tfB.keys()]);
  const totalDocs = 2;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const term of vocabulary) {
    const inA = tfA.has(term) ? 1 : 0;
    const inB = tfB.has(term) ? 1 : 0;
    // IDF suavizado (estilo scikit-learn) com amortecimento por raiz quadrada,
    // para não penalizar demais paráfrases em corpus de apenas 2 documentos.
    const idf = Math.sqrt(Math.log((1 + totalDocs) / (1 + inA + inB)) + 1);

    const weightA = (tfA.get(term) ?? 0) * idf;
    const weightB = (tfB.get(term) ?? 0) * idf;

    dotProduct += weightA * weightB;
    normA += weightA * weightA;
    normB += weightB * weightB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export type FeedbackLevel = "entendeu" | "parcial" | "nao_entendeu";

export interface AnalysisResult {
  similarity: number; // 0 a 1
  score: number; // 0 a 100
  feedback: FeedbackLevel;
  feedbackLabel: string;
}

export function analyzeAnswers(expected: string, given: string): AnalysisResult {
  const similarity = cosineSimilarityTfidf(expected, given);
  const score = Math.round(similarity * 100);

  let feedback: FeedbackLevel;
  let feedbackLabel: string;
  if (score >= 80) {
    feedback = "entendeu";
    feedbackLabel = "Entendeu";
  } else if (score >= 50) {
    feedback = "parcial";
    feedbackLabel = "Parcial";
  } else {
    feedback = "nao_entendeu";
    feedbackLabel = "Não entendeu";
  }

  return { similarity, score, feedback, feedbackLabel };
}
