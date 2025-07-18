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
    const { counselingType, data, startDate, endDate } = await request.json()

    // Get user's display name for personalization
    const userResult = await sql`
      SELECT display_name
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `
    const userName = userResult[0]?.display_name.split(" ")[0] || "você"

    if (counselingType === "report") {
      const financialData = await getFinancialDataForRange(userId, startDate, endDate)

      const prompt = `
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

      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt,
        maxTokens: 3000, // Increased for detailed, lengthy reports
      })

      return NextResponse.json({ analysis: text })
    }

    // Get user's financial data
    const currentDate = new Date()

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
    const expertInstruction = `${CUTIA_PERSONA}

Forneça dicas curtas (máximo 256 caracteres), úteis e edificantes. Use sua personalidade calorosa e otimista para inspirar ações financeiras positivas. Seja extremamente conciso. Não se apresente, não use saudações iniciais, e não se refira ao usuário pelo nome.`

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
      case "total_expenses_by_category_chart":        prompt = `Olhando meus gastos de longo prazo por categoria: ${JSON.stringify(financialData.totalExpensesByTag || [])}, qual mudança de hábito teria o maior impacto financeiro? Forneça uma estratégia clara. ${expertInstruction}`;
        break;
      case "monthly_shared_expenditure":
        prompt = `Minha despesa mensal compartilhada é de ${financialData.monthlySharedExpenditure}. Analise este valor e me dê dicas sobre como gerenciar melhor ou reduzir minha parte nas despesas compartilhadas. ${expertInstruction}`;
        break;
      case "shared_expenses_painel_summary":
      case "shared_expenses_painel_summary":        prompt = `${expertInstruction}

Analise os seguintes dados de despesas compartilhadas para ${userName}:
- Gasto Coletivo Total: ${formatCurrency(financialData.totalSpent)}
- Minha Parte: ${formatCurrency(financialData.myShare)}
- Eu Devo: ${formatCurrency(financialData.iOwe)}
- Me Devem: ${formatCurrency(financialData.theyOweMe)}

Use o seguinte formato em Markdown:

## Resumo Conciso
Escreva um breve parágrafo descrevendo o estado atual dos gastos compartilhados.

## Dicas Acionáveis
Forneça de 3 a 5 dicas corriqueiras e numeradas (1., 2., 3.) para otimizar a gestão, focando em:
- Como receber valores de forma eficiente
- Como gerenciar quem deve
- Estratégias para evitar desequilíbrios financeiros`;
        break;
      case "shared_expenses_monthly_chart":
        prompt = `Aja como um analista financeiro. Analise os seguintes dados de despesas compartilhadas mensais: ${JSON.stringify(financialData.monthlySharedExpenses)}. Identifique tendências, picos ou quedas, e forneça 3 dicas práticas para otimizar meus gastos compartilhados ao longo do tempo. Responda sempre em português do Brasil (pt-BR).`;
        break;
      case "shared_expenses_category_table":
        prompt = `Aja como um consultor financeiro. Analise os seguintes dados de despesas compartilhadas por categoria: ${JSON.stringify(financialData.sharedExpensesByCategory)}. Identifique as categorias de maior impacto, comente sobre a distribuição percentual e ofereça 3-5 recomendações específicas para gerenciar ou reduzir gastos nessas categorias. Responda sempre em português do Brasil (pt-BR).`;
        break;
      default:
        prompt = `Aja como um consultor financeiro de elite. Analise os dados fornecidos e me dê um diagnóstico rápido e 3 recomendações estratégicas de alto impacto. Seja conciso e direto ao ponto.

        Orçamento Mensal: ${financialData.currentBudget}
        Gastos por Categoria:
        ${(financialData.expensesByTag || []).map((exp: { tag: string; amount: number }) => `- ${exp.tag}: ${exp.amount}`).join("\n")}

        Histórico de Gastos (últimos 3 meses):
        ${(financialData.historicalSpending || []).map((hist: { month: number; year: number; total: number }) => `- ${hist.month}/${hist.year}: ${hist.total}`).join("\n")}

        ${expertInstruction}
        `;
        break;
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
