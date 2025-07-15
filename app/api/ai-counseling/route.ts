import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency } from "@/lib/currency"

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
    const { counselingType, data, startDate, endDate } = await request.json()

    if (counselingType === "report") {
      const financialData = await getFinancialDataForRange(userId, startDate, endDate)

      const prompt = `
        Aja como um analista financeiro especialista. Crie um relatório financeiro detalhado e perspicaz para o período de ${format(new Date(startDate), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(endDate), "dd/MM/yyyy", { locale: ptBR })}.

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

      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt,
        maxTokens: 2000, // Increased for detailed report
      })

      return NextResponse.json({ analysis: text })
    }

    // Get user's financial data
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Get last 3 months spending for trend analysis (still needed as it's not passed from frontend)
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
    `

    const financialData = {
      ...data, // Use data passed from frontend
      historicalSpending: historicalSpending.map((row) => ({
        month: row.month,
        year: row.year,
        total: Number(row.total),
      })),
    }

    let prompt = ""
    const expertInstruction = "Forneça dicas curtas, diretas e de alto impacto, como se fossem de um especialista financeiro. Cada frase deve ter um valor claro. Evite texto genérico. Responda sempre em português do Brasil (pt-BR)."

    switch (counselingType) {
      case "monthly_income":
        prompt = `Minha renda mensal é de ${financialData.monthlyIncome}. Analise essa renda e me dê dicas de como posso aumentá-la ou diversificá-la. ${expertInstruction}`;
        break;
      case "net_balance":
        prompt = `Meu balanço mensal (renda - despesas) é de ${financialData.netBalance}. O que esse número significa para minha saúde financeira? Me dê conselhos sobre como melhorar esse indicador. ${expertInstruction}`;
        break;
      case "monthly_incomes_chart":
        prompt = `Analise meus dados de renda mensal: ${JSON.stringify(financialData.monthlyIncomes || [])}. Aponte as tendências e me dê estratégias para estabilizar ou aumentar minhas fontes de renda. ${expertInstruction}`;
        break;
      case "monthly_expenditure":
        prompt = `Meu gasto mensal atual é de ${financialData.monthlyExpenditure}. Analise estes dados e os gastos por categoria: ${JSON.stringify(financialData.expensesByTag || [])}. Me dê estratégias práticas e imediatas para reduzir este valor sem sacrificar o essencial. ${expertInstruction}`;
        break;
      case "daily_average":
        prompt = `Com base na minha média de gastos diária de ${financialData.dailyAverage}, me diga de forma direta se estou no caminho certo. Projete meu gasto mensal e me dê um conselho chave para otimizar. Meu orçamento é ${financialData.currentBudget}. ${expertInstruction}`;
        break;
      case "current_budget":
        prompt = `Meu orçamento é ${financialData.currentBudget} e meu gasto atual é ${financialData.monthlyExpenditure}. Me dê 3 ações críticas e objetivas para garantir que eu termine o mês dentro do orçamento. ${expertInstruction}`;
        break;
      case "remaining_budget":
        prompt = `Com ${financialData.remainingBudget} de orçamento restante, quais são as 3 principais prioridades para o resto do mês? Seja direto e acionável. ${expertInstruction}`;
        break;
      case "monthly_expenses_chart":
        prompt = `Com base nestes dados históricos de despesas mensais: ${JSON.stringify(financialData.monthlyExpenses || [])}, aponte a tendência mais preocupante e a mais positiva. Dê uma dica poderosa para cada uma. ${expertInstruction}`;
        break;
      case "expenses_by_category_chart":
        prompt = `Analisando minhas despesas por categoria: ${JSON.stringify(financialData.expensesByTag || [])}, identifique a de maior gasto e me dê duas táticas não óbvias para reduzir custos nela imediatamente. ${expertInstruction}`;
        break;
      case "total_expenses_by_category_chart":
        prompt = `Olhando meus gastos de longo prazo por categoria: ${JSON.stringify(financialData.totalExpensesByTag || [])}, qual mudança de hábito teria o maior impacto financeiro? Forneça uma estratégia clara. ${expertInstruction}`;
        break;
      default:
        prompt = `Aja como um consultor financeiro de elite. Analise estes dados e me dê um diagnóstico rápido e 3 recomendações estratégicas de alto impacto. Seja conciso e direto ao ponto.\n\n        Gasto no Mês Atual: ${financialData.totalSpending}\n        Orçamento Mensal: ${financialData.budget}\n        Gastos por Categoria:\n        ${(financialData.expensesByTag || []).map((exp: { tag: string; total: number }) => `- ${exp.tag}: ${exp.total}`).join("\n")}\n\n        Histórico de Gastos (últimos 3 meses):\n        ${(financialData.historicalSpending || []).map((hist: { month: number; year: number; total: number }) => `- ${hist.month}/${hist.year}: ${hist.total}`).join("\n")}\n\n        ${expertInstruction}\n        `;
        break;
    }

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 500, // Reduced max tokens for shorter responses
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("AI Counseling error:", error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
