import { OpenAI } from 'openai'

export async function augment_data(data: any[], augmentationFactor: number, augmentationPrompt: string, selectedColumn: string, openaiApiKey: string): Promise<any[]> {
  if (!openaiApiKey) {
    throw new Error("OpenAI API key is not provided");
  }
  if (!data || data.length === 0) {
    throw new Error("No data provided for augmentation")
  }

  const client = new OpenAI({ apiKey: openaiApiKey });

  const augmented_data = []
  for (const row of data) {
    augmented_data.push(row)  // Keep the original row
    
    const text = row[selectedColumn] || ""
    
    for (let i = 0; i < augmentationFactor - 1; i++) {  // Create new rows
      try {
        const completion = await client.chat.completions.create({
          model: "gpt-4",
          messages: [
            { role: "system", content: augmentationPrompt },
            { role: "user", content: text }
          ]
        })
        
        const generated_text = completion.choices[0].message.content

        const new_row: any = { ...row, is_augmented: "Yes" }
        new_row[selectedColumn] = generated_text

        augmented_data.push(new_row)
      } catch (error) {
        console.error(`Error augmenting row: ${error}`)
      }
    }
  }

  for (const row of data) {
    row["is_augmented"] = "No"
  }

  return augmented_data
}

