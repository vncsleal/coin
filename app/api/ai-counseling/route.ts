import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency } from "@/lib/currency"

// Define Cutia's character and personality
const CUTIA_PERSONA = `Você é a Cutia, uma cutia sul-americana especialista em finanças pessoais. Suas características:

PERSONALIDADE:
- Amigável, otimista e encorajadora
- Sábia mas acessível, como uma mentora experiente
- Usa linguagem calorosa e positiva
- Foca em soluções práticas e acionáveis
- Inspira confiança sem ser condescendente
- NUNCA se apresente ou use saudações iniciais.

COMPORTAMENTO:
- Usa metáforas ocasionais sobre crescimento financeiro (mas com moderação)
- Mantém tom profissional mas amigável
- Oferece insights práticos baseados em dados reais
- NUNCA sugere outros aplicativos financeiros - sempre promove as funcionalidades do próprio app

ESTILO DE COMUNICAÇÃO:
- Para conselhos: dicas concisas (tamanho de tweet), diretas e inspiradoras
- Para relatórios: análises detalhadas, bem estruturadas e perspicazes
- Sempre em português do Brasil (pt-BR)
- Usa formatação Markdown quando apropriado
- Equilibra otimismo com realismo financeiro
- Evita excesso de metáforas da natureza - usa linguagem clara e direta`

async function getFinancialDataForRange(userId: string, startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const totalExpensesRes = await sql`
    SELECT SUM(amount) as total
    FROM expenses
    WHERE user_id = ${userId} AND date >= ${start.toISOString()} AND date <= ${end.toISOString()}
  `
  const totalExpenses = Number(totalExpensesRes[0]?.total || 0)

  const expensesByCategoryRes = await sql`
    SELECT tag, SUM(amount) as total
    FROM expenses
    WHERE user_id = ${userId} AND date >= ${start.toISOString()} AND date <= ${end.toISOString()}
    GROUP BY tag
    ORDER BY total DESC
  `
  const expensesByCategory = expensesByCategoryRes.map((row) => ({
    tag: row.tag,
    total: Number(row.total),
    percentage: totalExpenses > 0 ? ((Number(row.total) / totalExpenses) * 100).toFixed(2) : "0.00",
  }))

  const topExpensesRes = await sql`
    SELECT name, amount, date
    FROM expenses
    WHERE user_id = ${userId} AND date >= ${start.toISOString()} AND date <= ${end.toISOString()}
    ORDER BY amount DESC
    LIMIT 5
  `
  const topExpenses = topExpensesRes.map((row) => ({
    name: row.name,
    amount: Number(row.amount),
    date: row.date,
  }))

  const timeDifference = end.getTime() - start.getTime()
  const daysDifference = timeDifference > 0 ? Math.ceil(timeDifference / (1000 * 3600 * 24)) : 1
  const dailyAverage = totalExpenses / daysDifference

  return {
    totalExpenses,
    expensesByCategory,
    topExpenses,
    dailyAverage,
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Set the session variable for RLS
  await sql.query(`SET LOCAL "auth.user_id" = '${userId}';`)

  try {
    const { counselingType, data, startDate, endDate, customPrompt } = await request.json()

    // Get user's display name for personalization
    const userResult = await sql`
      SELECT display_name
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `
    const userName = userResult[0]?.display_name.split(" ")[0] || "você"

    let prompt = ""
    if (counselingType === "report") {
      const financialData = await getFinancialDataForRange(userId, startDate, endDate)
      prompt = `
        ${CUTIA_PERSONA}

        Crie um relatório financeiro detalhado e perspicaz para ${userName} no período de ${format(new Date(startDate), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(endDate), "dd/MM/yyyy", { locale: ptBR })}.

        **Dados Financeiros:**
        - **Total de Despesas:** ${formatCurrency(financialData.totalExpenses)}
        - **Renda (se aplicável):** (não disponível)
        - **Balanço (Renda - Despesas):** ${formatCurrency(-financialData.totalExpenses)}
        - **Média de Gasto Diário:** ${formatCurrency(financialData.dailyAverage)}

        **Análise de Despesas por Categoria:**
        ${financialData.expensesByCategory.map((item) => `- **${item.tag}:** ${formatCurrency(item.total)} (${item.percentage}%)`).join("\n")}

        **Principais Despesas:**
        ${financialData.topExpenses.map((exp) => `- ${exp.name} em ${format(new Date(exp.date), "dd/MM/yyyy", { locale: ptBR })}: ${formatCurrency(exp.amount)}`).join("\n")}

        **O relatório deve incluir as seguintes seções, com títulos claros e formatação em Markdown:**

        1.  **Resumo Executivo:** Um parágrafo conciso com os principais destaques financeiros do período.
        2.  **Análise de Padrões de Consumo:**
            - Identifique as 3 principais categorias de gastos.
            - Analise a distribuição de despesas. Há alguma concentração excessiva?
            - Comente sobre a frequência e o volume das transações.
        3.  **Visualização de Dados (Simulado):**
            - Descreva um gráfico de pizza para "Distribuição de Despesas por Categoria".
            - Descreva um gráfico de barras para "Top 5 Despesas".
        4.  **Insights e Observações:**
            - Destaque tendências importantes (ex: aumento de gastos em uma categoria específica).
            - Aponte anomalias ou despesas inesperadas.
            - Avalie a saúde financeira geral com base nos dados.
        5.  **Dicas e Recomendações Acionáveis:**
            - Forneça 3-5 dicas práticas e personalizadas para otimizar os gastos.
            - Sugira áreas para economia potencial.
            - Recomende estratégias para melhorar a gestão financeira com base nos padrões observados.

        **Instruções de Formato:**
        - Use Markdown para formatar o relatório com títulos, listas e negrito.
        - A resposta deve ser estruturada, clara e profissional.
        - Responda sempre em português do Brasil (pt-BR).
      `
      if (customPrompt && typeof customPrompt === "string" && customPrompt.trim().length > 0) {
        prompt += `\n\n**Prompt Personalizado:** ${customPrompt}`
      }
    } else if (counselingType === "general") {
      const currentMonth = format(new Date(), "MM");
      const currentYear = format(new Date(), "yyyy");

      const currentBudgetRes = await sql`
        SELECT amount FROM budgets
        WHERE user_id = ${userId} AND month = ${currentMonth} AND year = ${currentYear}
      `;
      const currentBudget = Number(currentBudgetRes[0]?.amount || 0);

      const expensesByTagRes = await sql`
        SELECT tag, SUM(amount) as total
        FROM expenses
        WHERE user_id = ${userId}
        GROUP BY tag
        ORDER BY total DESC
      `;
      const expensesByTag = expensesByTagRes.map((row) => ({
        tag: row.tag,
        amount: Number(row.total),
      }));

      const historicalSpending = await sql`
        SELECT 
          EXTRACT(MONTH FROM date) as month,
          EXTRACT(YEAR FROM date) as year,
          SUM(amount) as total
        FROM expenses 
        WHERE user_id = ${userId}
        AND date >= CURRENT_DATE - INTERVAL '3 months'
        GROUP BY EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)
        ORDER BY year DESC, month DESC
      `;

      const financialData = {
        currentBudget,
        expensesByTag,
        historicalSpending: historicalSpending.map((row) => ({
          month: row.month,
          year: row.year,
          total: Number(row.total),
        })),
      };

      const expertInstruction = `${CUTIA_PERSONA}

Forneça dicas curtas (máximo 256 caracteres), úteis e edificantes. Use sua personalidade calorosa e otimista para inspirar ações financeiras positivas. Seja extremamente conciso. Não se apresente, não use saudações iniciais, e não se refira ao usuário pelo nome.`

      prompt = `Aja como um consultor financeiro de elite. Analise os dados fornecidos e me dê um diagnóstico rápido e 3 recomendações estratégicas de alto impacto. Seja conciso e direto ao ponto.

        Orçamento Mensal: ${financialData.currentBudget}
        Gastos por Categoria:
        ${(financialData.expensesByTag || []).map((exp) => `- ${exp.tag}: ${exp.amount}`).join("\n")}

        Histórico de Gastos (últimos 3 meses):
        ${(financialData.historicalSpending || []).map((hist) => `- ${hist.month}/${hist.year}: ${hist.total}`).join("\n")}

        ${customPrompt && typeof customPrompt === "string" && customPrompt.trim().length > 0 ? `\n**Prompt Personalizado:** ${customPrompt}` : ""}

        ${expertInstruction}
      `;
    } else {
      return NextResponse.json({ error: "Tipo de análise inválido." }, { status: 400 })
    }

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 256, // Increased to prevent truncation of tweet-sized responses
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("AI Counseling error:", error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
