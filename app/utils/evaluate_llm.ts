import { OpenAI } from 'openai'

interface EvaluationSettings {
  model: string
  selectedColumns: string[]
  evaluationPrompt: string
  scoreRange: number
  scoreCriteria: { [key: number]: string }
}

interface DataRow {
  [key: string]: string | number
}

interface EvaluatedRow extends DataRow {
  'LLM_Eval 근거': string
  LLM_Eval: string
}

export async function evaluate_llm(data: DataRow[], evaluationSettings: EvaluationSettings): Promise<EvaluatedRow[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const evaluatedData = await Promise.all(data.map(async (row) => {
    try {
      let finalPrompt = evaluationSettings.evaluationPrompt

      evaluationSettings.selectedColumns.forEach(column => {
        const placeholder = `{${column}}`
        finalPrompt = finalPrompt.replace(placeholder, String(row[column]))
      })

      finalPrompt = finalPrompt.replace('{scoreRange}', evaluationSettings.scoreRange.toString())

      const criteriaText = Object.entries(evaluationSettings.scoreCriteria)
        .map(([score, criteria]) => `${score}점: ${criteria}`)
        .join('\n')
      finalPrompt = finalPrompt.replace('{scoreCriteria}', criteriaText)

      const completion = await openai.chat.completions.create({
        model: evaluationSettings.model,
        messages: [{ role: 'user', content: finalPrompt }],
      })

      const responseContent = completion.choices[0]?.message?.content
      if (!responseContent) {
        throw new Error('No response content from OpenAI')
      }

      const scoreMatch = responseContent.match(/평가 점수: (\d+)\/\d+/)
      const score = scoreMatch ? scoreMatch[1] : 'N/A'

      return {
        ...row,
        'LLM_Eval 근거': responseContent,
        LLM_Eval: score,
      }
    } catch (error) {
      console.error('Error in LLM evaluation:', error)
      return {
        ...row,
        'LLM_Eval 근거': 'An error occurred during evaluation',
        LLM_Eval: 'Error',
      }
    }
  }))

  return evaluatedData
}