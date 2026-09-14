# Verificador de Respostas com PLN — "A máquina entendeu?"

Sistema que avalia se a máquina "entendeu" uma resposta: compara a **resposta do usuário** com a **resposta esperada** usando técnicas de Processamento de Linguagem Natural (PLN) e retorna uma **similaridade**, uma **nota de 0 a 100** e um **feedback**.

> Atividade em grupo — Parte 1 (implementação básica)

## O que o sistema faz

1. Recebe três entradas: **pergunta**, **resposta esperada** e **resposta do usuário**
2. Pré-processa os textos: minúsculas, remoção de acentos, pontuação e stopwords, radicalização simples (stemming)
3. Vetoriza os textos com **TF-IDF**
   - **TF** (Term Frequency): frequência da palavra no texto
   - **IDF** (Inverse Document Frequency): importância da palavra no conjunto de textos
4. Calcula a **similaridade do cosseno** entre os dois vetores
5. Exibe o resultado:

| Similaridade | Feedback |
| --- | --- |
| ≥ 80 | **Entendeu** |
| 50 – 79 | **Parcial** |
| < 50 | **Não entendeu** |

## Estrutura do repositório

```
.
├── python/                       # Versão em Python (atividade)
│   ├── verificador_respostas.py  # Implementação básica — só biblioteca padrão
│   ├── verificador_sklearn.py    # Versão bônus com scikit-learn
│   ├── requirements.txt          # Dependências da versão bônus
│   └── README.md                 # Detalhes da versão em Python
├── src/                          # Aplicação web (React + TypeScript)
│   ├── lib/nlp.ts                # Mesmo pipeline de PLN em TypeScript
│   ├── lib/grader.functions.ts   # Função de servidor que aplica o pipeline
│   └── routes/index.tsx          # Interface com campos, botão e resultado
└── README.md
```

## Como executar a versão em Python

Não precisa instalar nada para a versão básica:

```bash
cd python
python verificador_respostas.py
```

Versão bônus (scikit-learn):

```bash
cd python
pip install -r requirements.txt
python verificador_sklearn.py
```

### Exemplo

```
Digite a pergunta: O que é fotossíntese?
Digite a resposta esperada: Fotossíntese é o processo pelo qual as plantas convertem luz solar em energia.
Digite a resposta do usuário: É o processo em que as plantas transformam a luz do sol em energia.

Similaridade:       61.35%
Nota:               61 / 100
Feedback:           Parcial
```

## Como executar a aplicação web

Requisitos: Node.js 20+.

```bash
npm install
npm run dev
```

A interface abre no navegador com os três campos de entrada, o botão **Analisar respostas** e o card de resultado com nota, barra de similaridade e feedback.

## Tecnologias

- **Python** (biblioteca padrão / scikit-learn) — lógica de PLN da atividade
- **TypeScript + React (TanStack Start) + Tailwind CSS** — aplicação web com o mesmo pipeline
- **TF-IDF + similaridade do cosseno** — núcleo da comparação de textos
