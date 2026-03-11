import { auth } from "@clerk/nextjs/server"
import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatCurrency } from "@/lib/currency"
import { getDaysInMonth, startOfMonth, differenceInDays, subMonths } from "date-fns"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

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

interface ExpenseByTag {
  tag: string;
  amount: number;
}

interface MonthlySummary {
  label: string;
  month: string;
  year: string;
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  expensesByTag: ExpenseByTag[];
}

async function fetchMonthlySummary(userId: string, month: string, year: string): Promise<MonthlySummary> {
  const monthStart = new Date(Number(year), Number(month) - 1, 1)
  const monthEnd = new Date(Number(year), Number(month), 1) // exclusive: first day of next month
  const startIso = monthStart.toISOString()
  const endIso = monthEnd.toISOString()

  const [expensesRes, incomeRes, tagRes, sharedExpensesRes, sharedTagRes] = await Promise.all([
    sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE user_id = ${userId}
      AND date >= ${startIso} AND date < ${endIso}
    `,
    sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM incomes
      WHERE user_id = ${userId}
      AND date >= ${startIso} AND date < ${endIso}
    `,
    sql`
      SELECT tag, SUM(amount) as total
      FROM expenses
      WHERE user_id = ${userId}
      AND date >= ${startIso} AND date < ${endIso}
      GROUP BY tag
      ORDER BY total DESC
    `,
    sql`
      SELECT COALESCE(SUM(CASE
        WHEN paid_by_user_id = ${userId} THEN total_amount / 2
        WHEN shared_with_user_id = ${userId} THEN total_amount / 2
        ELSE 0
      END), 0) as total
      FROM shared_expenses
      WHERE (paid_by_user_id = ${userId} OR shared_with_user_id = ${userId})
      AND date >= ${startIso} AND date < ${endIso}
    `,
    sql`
      SELECT COALESCE(category, 'Compartilhado') as tag,
             SUM(total_amount / 2) as total
      FROM shared_expenses
      WHERE (paid_by_user_id = ${userId} OR shared_with_user_id = ${userId})
      AND date >= ${startIso} AND date < ${endIso}
      GROUP BY category
      ORDER BY total DESC
    `,
  ])

  const individualExpenses = Number(expensesRes[0]?.total || 0)
  const sharedExpenses = Number(sharedExpensesRes[0]?.total || 0)
  const totalExpenses = individualExpenses + sharedExpenses
  const totalIncome = Number(incomeRes[0]?.total || 0)

  // Merge individual and shared expense tags
  const tagMap = new Map<string, number>()
  for (const row of tagRes) {
    tagMap.set(row.tag, (tagMap.get(row.tag) ?? 0) + Number(row.total))
  }
  for (const row of sharedTagRes) {
    tagMap.set(row.tag, (tagMap.get(row.tag) ?? 0) + Number(row.total))
  }
  const expensesByTag = Array.from(tagMap.entries())
    .map(([tag, amount]) => ({ tag, amount }))
    .sort((a, b) => b.amount - a.amount)

  return {
    label: format(new Date(Number(year), Number(month) - 1, 1), "MMMM yyyy", { locale: ptBR }),
    month,
    year,
    totalExpenses,
    totalIncome,
    netBalance: totalIncome - totalExpenses,
    expensesByTag,
  }
}

function buildHistorySection(history: MonthlySummary[]): string {
  if (!history.length) return ""
  const lines = history.map((m) => {
    const label = m.label.charAt(0).toUpperCase() + m.label.slice(1)
    const tagLines =
      m.expensesByTag.length
        ? m.expensesByTag.map((t) => `    - ${t.tag}: R$ ${t.amount.toFixed(2)}`).join("\n")
        : "    - Nenhum gasto registrado"
    return `- **${label}**: Gastos R$ ${m.totalExpenses.toFixed(2)} | Receitas R$ ${m.totalIncome.toFixed(2)} | Saldo R$ ${m.netBalance.toFixed(2)}\n${tagLines}`
  })
  return `\n**HISTÓRICO DOS ÚLTIMOS MESES:**\n${lines.join("\n\n")}\n`
}

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

        Crie um relatório financeiro detalhado e perspicaz para o período de ${format(new Date(startDate), "dd/MM/yyyy", { locale: ptBR })} a ${format(new Date(endDate), "dd/MM/yyyy", { locale: ptBR })}.

        **Análise de Despesas por Categoria:**
        ${financialData.expensesByCategory.map((item) => `- **${item.tag}:** ${formatCurrency(item.total)} (${item.percentage}%)`).join("\n")}
      `;

      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt,
        maxTokens: 800,
      })

      return NextResponse.json({ analysis: text })
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

        // Fetch historical monthly summaries (last 6 months, excluding current month)
        const historyPromises = Array.from({ length: 6 }, (_, i) => {
          const d = subMonths(now, i + 1)
          return fetchMonthlySummary(userId, format(d, "MM"), format(d, "yyyy"))
        })
        const history = await Promise.all(historyPromises)

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
          history,
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

${buildHistorySection(financialData.history || [])}
${conversationHistory ? `\nContexto da conversa:\n${conversationHistory}\n` : ""}

Gastos por Categoria (mês atual):
${(financialData.expensesByTag || []).map((exp: { tag: string; amount: number }) => `- ${exp.tag}: R$ ${exp.amount.toFixed(2)}`).join("\n")}

${customPrompt && typeof customPrompt === "string" && customPrompt.trim().length > 0 ? `\n\nPergunta do usuário: ${customPrompt}` : ""}

INSTRUÇÕES: 
- Responda APENAS o que foi perguntado especificamente
- Use dados atuais para perguntas sobre "agora" ou "até agora"  
- Use dados projetados APENAS se perguntarem sobre "fim do mês" ou "futuro"
- Use o HISTÓRICO DOS ÚLTIMOS MESES quando o usuário perguntar sobre meses anteriores (ex: "como fui em janeiro?", "quanto gastei em fevereiro?")
- Se o histórico de um mês não tiver dados, diga que não há registros para aquele período
- Seja direta e não ofereça análises extras não solicitadas
- Mantenha o foco na pergunta específica do usuário

${expertInstruction}`;

      const { text } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt,
        maxTokens: 400, // Increased for more conversational responses
      })

      return NextResponse.json({ 
        analysis: text,
        financialSummary: shouldFetchFreshData ? financialData : undefined // Return fresh data only when fetched
      })
    } // end of else if (counselingType === "general")

    return NextResponse.json({ error: "Invalid counseling type" }, { status: 400 })
  } // end of try block
  catch (error) {
    console.error("AI Counseling error:", error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
} // end of POST function
