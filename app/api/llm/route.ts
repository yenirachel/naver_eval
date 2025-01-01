import { NextResponse } from 'next/server'
import { run_inference } from '@/app/utils/run_inference'
import { evaluate_llm } from '@/app/utils/evaluate_llm'
import { augment_data } from '@/app/utils/augment_data'

export async function POST(request: Request) {
  try {
    const { action, data, systemPrompt, userInput, augmentationFactor, augmentationPrompt, selectedColumn, evaluationSettings, apiKeys } = await request.json()
    
    console.log('Received API keys:', apiKeys);

    if (!action || !data || !Array.isArray(data) || data.length !== 1) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    let result
    switch (action) {
      case 'inference':
        console.log('Using CLIENT_ID and CLIENT_SECRET for inference');
        result = await run_inference(data, systemPrompt, userInput, apiKeys.CLIENT_ID, apiKeys.CLIENT_SECRET)
        break
      case 'evaluate':
        console.log('Using OPENAI_API_KEY for evaluation');
        result = await evaluate_llm(data, evaluationSettings, apiKeys.OPENAI_API_KEY)
        break
      case 'augment':
        console.log('Using OPENAI_API_KEY for augmentation');
        if (!augmentationFactor || !augmentationPrompt || !selectedColumn) {
          return NextResponse.json({ error: 'Missing augmentation parameters' }, { status: 400 })
        }
        if (!apiKeys.OPENAI_API_KEY) {
          return NextResponse.json({ error: 'OpenAI API key is not provided' }, { status: 400 })
        }
        result = await augment_data(data, augmentationFactor, augmentationPrompt, selectedColumn, apiKeys.OPENAI_API_KEY)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (!result) {
      throw new Error('Operation failed')
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

