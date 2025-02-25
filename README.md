# Considerações Técnicas

O código foi desenvolvido em **Node.js**.

## Como Executar

Para rodar o projeto, siga os passos abaixo:

### Instale as dependências:

```bash
npm install
```

### Execute o projeto:

```bash
npm start
```

Os dados passam por padronização de tipo(valor => [valor](lista de listas unitárias)) antes de serem escritos nas células.


# Funcionamento

O projeto utiliza a **Google Sheets API** para manipular a planilha e faz a autenticação através de credenciais de conta de serviço.

- **Leituras:** Ocorrem através do método `GET`.
- **Escritas:** Ocorrem através do método `PUT`.

Ambos os métodos necessitam de parâmetros pré-definidos pelas funções que os chamam.

---

## Lógica Principal

A lógica do projeto é baseada em dois vetores principais:

### `situation`
- Verifica os alunos **reprovados por falta**.
- Se o número de faltas for **maior que 15**, a situação é definida como `"Reprovado por Falta"`.
- Caso contrário, a situação recebe `null`.

### `generalAverages`
- Calcula a média de **todos os alunos** (incluindo os já reprovados por falta) para garantir consistência dos dados.
- Após o cálculo das médias, a situação de cada aluno é definida com base nas seguintes premissas:

| Média           | Situação do Aluno       |
|---------------|---------------------|
| Média < 50   | Reprovado por Nota   |
| 50 ≤ Média < 70 | Exame Final        |
| Média ≥ 70   | Aprovado             |

---

## Cálculo do FGA (Nota para Aprovação no Exame Final)

Para os alunos em **Exame Final**, é calculada a nota necessária para aprovação (**FGA**) com base na fórmula:

\[
5 \leq \frac{(\text{média} + \text{FGA})}{2}
\]

- Se o aluno **não** está em "Exame Final", o **FGA** é definido como `0`.
- O valor do **FGA** é então escrito na planilha.
