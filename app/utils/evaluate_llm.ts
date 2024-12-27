import { OpenAI } from 'openai'

interface EvaluationSettings {
  model: string
  selectedColumns: string[]
  evaluationPrompt: string
  scoreRange: number
  scoreCriteria: { [key: number]: string }
}

export async function evaluate_llm(data: any[], evaluationSettings: EvaluationSettings): Promise<any[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const evaluatedData = await Promise.all(data.map(async (row) => {
    try {
      // Replace all column placeholders with actual values from the row
      let finalPrompt = evaluationSettings.evaluationPrompt

      // Replace each {columnName} with its actual value from the row
      evaluationSettings.selectedColumns.forEach(column => {
        const placeholder = `{${column}}`
        finalPrompt = finalPrompt.replace(placeholder, row[column])
      })

      // Replace {scoreRange} with actual score range
      finalPrompt = finalPrompt.replace('{scoreRange}', evaluationSettings.scoreRange.toString())

      // Replace {scoreCriteria} with formatted criteria text
      const criteriaText = Object.entries(evaluationSettings.scoreCriteria)
        .map(([score, criteria]) => `${score}점: ${criteria}`)
        .join('\n')
      finalPrompt = finalPrompt.replace('{scoreCriteria}', criteriaText)

      const completion = await openai.chat.completions.create({
        model: evaluationSettings.model,
        messages: [{ role: 'user', content: finalPrompt }],
      })

      const response = completion.choices[0].message.content
      const scoreMatch = response.match(/평가 점수: (\d+)\/\d+/)
      const score = scoreMatch ? scoreMatch[1] : 'N/A'

      return {
        ...row,
        'LLM_Eval 근거': response,
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