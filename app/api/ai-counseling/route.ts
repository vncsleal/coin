import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency } from "@/lib/currency"
import { getDaysInMonth, startOfMonth, differenceInDays } from "date-fns"

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
    const { counselingType, data, startDate, endDate, customPrompt, messages, refreshData = false } = await request.json()

    // Check if this is the first message in conversation or if data refresh is requested
    const isFirstMessage = !Array.isArray(messages) || messages.length === 0
    const shouldFetchFreshData = isFirstMessage || refreshData

    let prompt = "";
    if (counselingType === "report") {
      const financialData = await getFinancialDataForRange(userId, startDate, endDate)
      prompt = `
        ${CUTIA_PERSONA}

        Crie um relatório financeiro detalhado e perspicaz para ${userName} no período de ${format(new Date(startDate), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(endDate), "dd/MM/yyyy", { locale: ptBR })}.

        **Análise de Despesas por Categoria:**
        ${financialData.expensesByCategory.map((item) => `- **${item.tag}:** ${formatCurrency(item.total)} (${item.percentage}%)`).join("\n")}
      `;
    } else if (counselingType === "general") {
      // Use cached financial data if available and not requesting fresh data
      let financialData;
      
      if (!shouldFetchFreshData && data && data.financialSummary) {
        // Reuse cached financial data from previous request
        financialData = data.financialSummary;
      } else {
        // Fetch fresh financial data
        // Budgets
        const currentMonth = format(new Date(), "MM");
        const currentYear = format(new Date(), "yyyy");
        const currentBudgetRes = await sql`
          SELECT amount FROM budgets
          WHERE user_id = ${userId} AND month = ${currentMonth} AND year = ${currentYear}
        `;
        const currentBudget = Number(currentBudgetRes[0]?.amount || 0);

        // Get monthly individual expenditure (same as dashboard)
        const monthlyIndividualExpenditure = await sql`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM expenses 
          WHERE user_id = ${userId}
          AND EXTRACT(MONTH FROM date) = ${currentMonth}
          AND EXTRACT(YEAR FROM date) = ${currentYear}
        `;

        // Get monthly shared expenditure (user's portion - same as dashboard)
        const monthlySharedExpenditureResult = await sql`
          SELECT
            COALESCE(SUM(CASE
              WHEN paid_by_user_id = ${userId} THEN total_amount / 2
              WHEN shared_with_user_id = ${userId} THEN total_amount / 2
              ELSE 0
            END), 0) as total
          FROM shared_expenses
          WHERE (paid_by_user_id = ${userId} OR shared_with_user_id = ${userId})
          AND EXTRACT(MONTH FROM date) = ${currentMonth}
          AND EXTRACT(YEAR FROM date) = ${currentYear}
        `;

        // Get monthly income (same as dashboard)
        const monthlyIncomeTotal = await sql`
          SELECT COALESCE(SUM(amount), 0) as total
          FROM incomes
          WHERE user_id = ${userId}
          AND EXTRACT(MONTH FROM date) = ${currentMonth}
          AND EXTRACT(YEAR FROM date) = ${currentYear}
        `;

        const totalIndividualExpenditure = Number(monthlyIndividualExpenditure[0]?.total || 0);
        const totalSharedExpenditure = Number(monthlySharedExpenditureResult[0]?.total || 0);
        const totalExpenditure = totalIndividualExpenditure + totalSharedExpenditure;
        const totalIncome = Number(monthlyIncomeTotal[0]?.total || 0);
        const remainingBudget = currentBudget - totalExpenditure;
        const netBalance = totalIncome - totalExpenditure;

        // Expenses by tag
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

        // Calculate projection metrics
        const now = new Date();
        const startOfCurrentMonth = startOfMonth(now);
        const daysInCurrentMonth = getDaysInMonth(now);
        const daysElapsed = differenceInDays(now, startOfCurrentMonth) + 1; // +1 to include today
        const daysRemaining = daysInCurrentMonth - daysElapsed;
        
        // Calculate daily averages and projections
        const dailyAverageExpense = daysElapsed > 0 ? totalExpenditure / daysElapsed : 0;
        const projectedMonthlyExpense = dailyAverageExpense * daysInCurrentMonth;
        const projectedRemainingBudget = currentBudget - projectedMonthlyExpense;
        const projectedNetBalance = totalIncome - projectedMonthlyExpense;

        // Create financial data object
        financialData = {
          currentBudget,
          totalExpenditure,
          remainingBudget,
          totalIndividualExpenditure,
          totalSharedExpenditure,
          totalIncome,
          netBalance,
          expensesByTag,
          // Projection data
          currentDate: format(now, "dd/MM/yyyy"),
          daysInMonth: daysInCurrentMonth,
          daysElapsed,
          daysRemaining,
          dailyAverageExpense,
          projectedMonthlyExpense,
          projectedRemainingBudget,
          projectedNetBalance,
        };
      }

      // Conversational context: include previous messages
      let conversationHistory = "";
      if (Array.isArray(messages) && messages.length > 0) {
        conversationHistory = messages.map((msg) => `${msg.role === "user" ? "Usuário" : "Tia Cutia"}: ${msg.content}`).join("\n");
      }

      const expertInstruction = `${CUTIA_PERSONA}

Responda como se fosse uma conversa natural entre amigos. Seja direta, calorosa e útil. Use linguagem coloquial brasileira. Mantenha as respostas entre 50-150 palavras. 

IMPORTANTE: Responda APENAS o que foi perguntado. Não adicione projeções ou análises extras se não foram solicitadas. Seja precisa e direta na resposta.`;

      prompt = `Responda como uma consultora financeira amigável em uma conversa informal. Use dados reais dos gastos abaixo:

**SITUAÇÃO ATUAL (${financialData.currentDate} - Dia ${financialData.daysElapsed} de ${financialData.daysInMonth}):**
- Orçamento Mensal: R$ ${financialData.currentBudget.toFixed(2)}
- Gastos até Agora: R$ ${financialData.totalExpenditure.toFixed(2)}
- Receitas: R$ ${financialData.totalIncome.toFixed(2)}
- Saldo Atual: R$ ${financialData.netBalance.toFixed(2)}

**PROJEÇÕES PARA O FIM DO MÊS:**
- Média Diária de Gastos: R$ ${financialData.dailyAverageExpense.toFixed(2)}
- Gasto Projetado Total: R$ ${financialData.projectedMonthlyExpense.toFixed(2)}
- Orçamento Restante Projetado: R$ ${financialData.projectedRemainingBudget.toFixed(2)}
- Saldo Final Projetado: R$ ${financialData.projectedNetBalance.toFixed(2)}
- Dias Restantes: ${financialData.daysRemaining}

${conversationHistory ? `\nContexto da conversa:\n${conversationHistory}\n` : ""}

Gastos por Categoria:
${(financialData.expensesByTag || []).map((exp) => `- ${exp.tag}: R$ ${exp.amount.toFixed(2)}`).join("\n")}

${customPrompt && typeof customPrompt === "string" && customPrompt.trim().length > 0 ? `\n\nPergunta do usuário: ${customPrompt}` : ""}

INSTRUÇÕES: 
- Responda APENAS o que foi perguntado especificamente
- Use dados atuais para perguntas sobre "agora" ou "até agora"  
- Use dados projetados APENAS se perguntarem sobre "fim do mês" ou "futuro"
- Seja direta e não ofereça análises extras não solicitadas
- Mantenha o foco na pergunta específica do usuário

${expertInstruction}`;

      const { text } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt,
        maxTokens: 400, // Increased for more conversational responses
      })

      return NextResponse.json({ 
        analysis: text,
        financialSummary: shouldFetchFreshData ? financialData : undefined // Return fresh data only when fetched
      })
    } // end of else if (counselingType === "general")
  } // end of try block
  catch (error) {
    console.error("AI Counseling error:", error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
} // end of POST function
