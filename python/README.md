# Verificador de Respostas com PLN — "A máquina entendeu?"

Atividade em grupo: sistema que recebe uma **pergunta**, uma **resposta esperada** e uma **resposta do usuário**, e avalia se a máquina "entendeu" a resposta.

## O que o sistema faz

1. Entrada de dados (pergunta, resposta esperada, resposta do usuário)
2. Pré-processamento simples: minúsculas, remoção de acentos, pontuação e stopwords, radicalização simples
3. Vetorização **TF-IDF**
   - TF (Term Frequency): frequência da palavra no texto
   - IDF (Inverse Document Frequency): importância da palavra no conjunto de textos
4. **Similaridade do cosseno** entre os vetores
5. Exibição da **nota (0 a 100)** e do feedback:
   - `>= 80` → **Entendeu**
   - `50 a 79` → **Parcial**
   - `< 50` → **Não entendeu**

## Arquivos

| Arquivo | Descrição |
| --- | --- |
| `verificador_respostas.py` | Implementação básica, **só com a biblioteca padrão do Python** (não precisa instalar nada) |
| `verificador_sklearn.py` | Versão bônus usando `scikit-learn` (`TfidfVectorizer`) |
| `requirements.txt` | Dependências da versão com scikit-learn |

## Como executar

Versão básica (sem instalar nada):

```bash
python verificador_respostas.py
```

Versão com scikit-learn:

```bash
pip install -r requirements.txt
python verificador_sklearn.py
```

## Exemplo

```
Digite a pergunta: O que é fotossíntese?
Digite a resposta esperada: Fotossíntese é o processo pelo qual as plantas convertem luz solar em energia.
Digite a resposta do usuário: É o processo em que as plantas transformam a luz do sol em energia.

Similaridade:       61.35%
Nota:               61 / 100
Feedback:           Parcial
```
