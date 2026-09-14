# -*- coding: utf-8 -*-
"""
Versão com scikit-learn (bônus) — mesmo sistema, usando TfidfVectorizer.

Instalação:
  pip install -r requirements.txt

Uso:
  python verificador_sklearn.py
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def analisar_respostas(resposta_esperada: str, resposta_usuario: str) -> dict:
    """Vetoriza as respostas com TF-IDF e calcula a similaridade do cosseno."""
    vetorizador = TfidfVectorizer(lowercase=True, strip_accents="unicode")
    matriz = vetorizador.fit_transform([resposta_esperada, resposta_usuario])
    similaridade = float(cosine_similarity(matriz[0], matriz[1])[0][0])
    nota = round(similaridade * 100)

    if nota >= 80:
        feedback = "Entendeu"
    elif nota >= 50:
        feedback = "Parcial"
    else:
        feedback = "Não entendeu"

    return {"similaridade": similaridade, "nota": nota, "feedback": feedback}


def main() -> None:
    print("=" * 55)
    print("  Verificador de respostas com PLN (scikit-learn)")
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
