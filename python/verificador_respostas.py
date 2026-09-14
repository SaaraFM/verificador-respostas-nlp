# -*- coding: utf-8 -*-
"""
Sistema de verificação de respostas com PLN — "A máquina entendeu?"

Parte 1 — Implementação básica:
  ✔ Entrada de dados (pergunta, resposta esperada, resposta do usuário)
  ✔ Pré-processamento simples (minúsculas, sem acentos, sem pontuação, sem stopwords)
  ✔ TF-IDF (TF = frequência do termo; IDF = importância do termo no conjunto)
  ✔ Similaridade do cosseno
  ✔ Exibição da nota (0 a 100) e feedback: "Entendeu", "Parcial", "Não entendeu"

Executado apenas com a biblioteca padrão do Python (não precisa instalar nada).
Uso:
  python verificador_respostas.py
"""

import math
import re
import unicodedata

# Palavras comuns em português (stopwords) removidas no pré-processamento.
STOPWORDS = {
    "a", "as", "o", "os", "um", "uma", "uns", "umas",
    "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
    "por", "para", "com", "sem", "sob", "sobre", "entre", "ate", "apos",
    "e", "ou", "mas", "que", "se", "como", "quando", "onde", "porque", "pois",
    "eu", "tu", "ele", "ela", "nos", "vos", "eles", "elas",
    "me", "te", "lhe", "lhes",
    "meu", "minha", "seu", "sua", "nosso", "nossa",
    "este", "esta", "esse", "essa", "isso", "isto", "aquele", "aquela",
    "ser", "estar", "ter", "haver", "foi", "e", "sao", "era", "eram",
    "esta", "estao", "tem", "ha",
    "ao", "aos", "a", "as", "pelo", "pela", "pelos", "pelas",
    "muito", "muita", "mais", "menos", "ja", "ainda", "tambem",
    "nao", "sim", "so", "entao", "assim", "aqui", "ali", "la",
}

# Sufixos comuns do português para uma radicalização (stemming) simples.
SUFFIXES = [
    "mente", "acoes", "acao", "coes", "ando", "endo", "indo",
    "ados", "adas", "idos", "idas", "ado", "ada", "ido", "ida",
    "ais", "eis", "es", "s", "ar", "er", "ir",
]


def remover_acentos(texto: str) -> str:
    """Remove acentos usando normalização Unicode (ex: 'ação' -> 'acao')."""
    normalizado = unicodedata.normalize("NFD", texto)
    return "".join(c for c in normalizado if unicodedata.category(c) != "Mn")


def radicalizar(token: str) -> str:
    """Remove um sufixo comum, aproximando flexões ('plantas' -> 'planta')."""
    for sufixo in SUFFIXES:
        if token.endswith(sufixo) and len(token) - len(sufixo) >= 3:
            return token[: -len(sufixo)]
    return token


def preprocessar(texto: str) -> list[str]:
    """
    Pré-processamento simples:
    minúsculas -> sem acentos -> sem pontuação -> sem stopwords -> radicalização.
    """
    texto = remover_acentos(texto.lower())
    texto = re.sub(r"[^a-z\s]", " ", texto)
    tokens = texto.split()
    return [radicalizar(t) for t in tokens if len(t) > 1 and t not in STOPWORDS]


def frequencia_termos(tokens: list[str]) -> dict[str, int]:
    """TF (Term Frequency): frequência de cada palavra no texto."""
    tf: dict[str, int] = {}
    for token in tokens:
        tf[token] = tf.get(token, 0) + 1
    return tf


def similaridade_cosseno_tfidf(texto_a: str, texto_b: str) -> float:
    """
    Vetoriza os dois textos com TF-IDF e calcula a similaridade do cosseno (0 a 1).

    TF  = frequência do termo no documento.
    IDF = log((1 + N) / (1 + df)) + 1  (suavizado, estilo scikit-learn),
          onde N é o total de documentos e df em quantos documentos o termo aparece.
    """
    tokens_a = preprocessar(texto_a)
    tokens_b = preprocessar(texto_b)

    if not tokens_a or not tokens_b:
        return 0.0

    tf_a = frequencia_termos(tokens_a)
    tf_b = frequencia_termos(tokens_b)

    vocabulario = set(tf_a) | set(tf_b)
    total_docs = 2

    produto_escalar = 0.0
    norma_a = 0.0
    norma_b = 0.0

    for termo in vocabulario:
        df = (1 if termo in tf_a else 0) + (1 if termo in tf_b else 0)
        # Raiz quadrada para não penalizar demais paráfrases em corpus de 2 documentos.
        idf = math.sqrt(math.log((1 + total_docs) / (1 + df)) + 1)

        peso_a = tf_a.get(termo, 0) * idf
        peso_b = tf_b.get(termo, 0) * idf

        produto_escalar += peso_a * peso_b
        norma_a += peso_a * peso_a
        norma_b += peso_b * peso_b

    if norma_a == 0 or norma_b == 0:
        return 0.0
    return produto_escalar / (math.sqrt(norma_a) * math.sqrt(norma_b))


def classificar_feedback(nota: int) -> str:
    """Feedback conforme a nota: >= 80 'Entendeu', 50-79 'Parcial', < 50 'Não entendeu'."""
    if nota >= 80:
        return "Entendeu"
    if nota >= 50:
        return "Parcial"
    return "Não entendeu"


def analisar_respostas(resposta_esperada: str, resposta_usuario: str) -> dict:
    """Compara as respostas e retorna similaridade, nota (0-100) e feedback."""
    similaridade = similaridade_cosseno_tfidf(resposta_esperada, resposta_usuario)
    nota = round(similaridade * 100)
    return {
        "similaridade": similaridade,
        "nota": nota,
        "feedback": classificar_feedback(nota),
    }


def main() -> None:
    print("=" * 55)
    print("  Sistema de verificação de respostas com PLN")
    print('  "A máquina entendeu?"')
    print("=" * 55)

    pergunta = input("\nDigite a pergunta: ").strip()
    resposta_esperada = input("Digite a resposta esperada: ").strip()
    resposta_usuario = input("Digite a resposta do usuário: ").strip()

    if not pergunta or not resposta_esperada or not resposta_usuario:
        print("\nErro: todos os campos são obrigatórios.")
        return

    resultado = analisar_respostas(resposta_esperada, resposta_usuario)

    print("\n" + "-" * 55)
    print(f"Pergunta:           {pergunta}")
    print(f"Similaridade:       {resultado['similaridade']:.2%}")
    print(f"Nota:               {resultado['nota']} / 100")
    print(f"Feedback:           {resultado['feedback']}")
    print("-" * 55)


if __name__ == "__main__":
    main()
