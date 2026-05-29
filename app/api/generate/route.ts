export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { optimizePrompt } from '@/lib/claude'
import { generateImages, generateVideo } from '@/lib/fal'
import { uploadFromUrl, buildMediaKey } from '@/lib/r2'
import { checkCredits, debitCredits, CREDIT_COSTS } from '@/lib/credits'
import { AFRICAN_STYLES, type StyleId } from '@/lib/styles'

// ── Request schema ────────────────────────────────────────────
interface GenerateRequest {
  prompt: string        // FR prompt from user
  styleId: StyleId
  type: 'image' | 'video'
  quality?: 'standard' | 'hd'
}

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // 2. Parse & validate body
  let body: GenerateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const { prompt, styleId, type = 'image', quality = 'standard' } = body

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
    return NextResponse.json({ error: 'Prompt trop court (min 3 caractères)' }, { status: 400 })
  }

  const validStyle = AFRICAN_STYLES.find((s) => s.id === styleId)
  if (!validStyle) {
    return NextResponse.json({ error: 'Style invalide' }, { status: 400 })
  }

  // 3. Determine credit cost
  let creditCost: number
  if (type === 'video') {
    creditCost = CREDIT_COSTS.video_short
  } else {
    creditCost = quality === 'hd' ? CREDIT_COSTS.image_hd : CREDIT_COSTS.image_standard
  }

  // 4. Check credits
  const { ok, credits } = await checkCredits(user.id, creditCost)
  if (!ok) {
    return NextResponse.json(
      { error: 'Crédits insuffisants', credits, required: creditCost },
      { status: 402 },
    )
  }

  // 5. Create generation record (status: processing)
  const { data: generation, error: genError } = await supabase
    .from('generations')
    .insert({
      user_id: user.id,
      prompt_fr: prompt.trim(),
      prompt_en: '',           // filled after Claude
      style: styleId,
      type,
      status: 'processing',
      credits_used: creditCost,
    })
    .select()
    .single()

  if (genError || !generation) {
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }

  try {
    // 6. Optimize prompt FR → EN via Claude
    const promptEn = await optimizePrompt(prompt.trim(), styleId)

    await supabase
      .from('generations')
      .update({ prompt_en: promptEn })
      .eq('id', generation.id)

    // 7. Generate via fal.ai
    let resultUrls: string[] = []

    if (type === 'image') {
      const imageSize = quality === 'hd' ? 'square_hd' : 'square'
      const falResult = await generateImages({
        prompt: promptEn,
        imageSize,
        numImages: 4,
      })
      resultUrls = falResult.images.map((img) => img.url)
    } else {
      // Video via Kling AI
      const duration = creditCost === CREDIT_COSTS.video_long ? 10 : 5
      const falResult = await generateVideo({ prompt: promptEn, duration })
      resultUrls = [falResult.video.url]
    }

    // 8. Upload to R2 (or use fal URLs directly in dev)
    const ext = type === 'video' ? 'mp4' : 'webp'
    const contentType = type === 'video' ? 'video/mp4' : 'image/webp'
    const mediaRecords = await Promise.all(
      resultUrls.map(async (sourceUrl, index) => {
        const key = buildMediaKey(user.id, generation.id, index, ext)
        const { publicUrl, r2Key } = await uploadFromUrl(sourceUrl, key, contentType)
        return {
          user_id: user.id,
          generation_id: generation.id,
          url: publicUrl,
          r2_key: r2Key,
          type: 'image' as const,
          style: styleId,
          prompt: promptEn,
        }
      }),
    )

    // 9. Save media to DB
    const { data: savedMedia, error: mediaError } = await supabase
      .from('media')
      .insert(mediaRecords)
      .select()

    if (mediaError) {
      throw new Error(`Media save failed: ${mediaError.message}`)
    }

    // 10. Debit credits
    await debitCredits(
      user.id,
      creditCost,
      `Génération ${type} — style ${styleId}`,
      generation.id,
    )

    // 11. Mark generation completed
    await supabase
      .from('generations')
      .update({
        status: 'completed',
        results: savedMedia?.map((m) => ({ id: m.id, url: m.url })) ?? [],
      })
      .eq('id', generation.id)

    return NextResponse.json({
      generationId: generation.id,
      promptEn,
      media: savedMedia,
    })
  } catch (err) {
    // Mark generation failed
    await supabase
      .from('generations')
      .update({ status: 'failed' })
      .eq('id', generation.id)

    const message = err instanceof Error ? err.message : 'Erreur interne'
    console.error('[/api/generate]', message, err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
