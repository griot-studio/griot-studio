import Anthropic from '@anthropic-ai/sdk'
import { getStyle, type StyleId } from './styles'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Tu es un expert en prompts pour modèles de diffusion d'images (Stable Diffusion, Flux, Midjourney).
L'utilisateur soumet un prompt en français décrivant une scène africaine.
Tu dois :
1. Traduire le prompt en anglais
2. Enrichir avec des détails visuels précis (éclairage, composition, texture, atmosphère)
3. Ajouter les termes techniques de qualité (8K, photorealistic, sharp focus, etc.) si pertinents
4. Intégrer le suffixe de style africain fourni
5. Retourner UNIQUEMENT le prompt final optimisé en anglais (max 200 mots, pas d'explication)`

export async function optimizePrompt(
  promptFr: string,
  styleId: StyleId,
): Promise<string> {
  const style = getStyle(styleId)
  const styleSuffix = style?.promptSuffix ?? ''

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Prompt français : "${promptFr}"\n\nSuffixe de style à intégrer : ${styleSuffix}`,
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') {
    throw new Error('Claude returned unexpected content type')
  }

  return block.text.trim()
}
