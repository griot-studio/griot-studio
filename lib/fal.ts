import * as fal from '@fal-ai/serverless-client'

fal.config({ credentials: process.env.FAL_KEY })

export interface FalImageResult {
  images: Array<{ url: string; width: number; height: number }>
  prompt: string
}

export interface FalVideoResult {
  video: { url: string }
  prompt: string
}

export interface GenerateImageOptions {
  prompt: string
  imageSize?: 'square_hd' | 'square' | 'portrait_4_3' | 'landscape_4_3' | 'landscape_16_9'
  numImages?: number
  seed?: number
}

export interface GenerateVideoOptions {
  prompt: string
  duration?: 5 | 10
}

/**
 * Generate images via Flux Pro on fal.ai
 * 1 credit = 4 images standard
 */
export async function generateImages(
  options: GenerateImageOptions,
): Promise<FalImageResult> {
  const { prompt, imageSize = 'square_hd', numImages = 4, seed } = options

  const result = await fal.run('fal-ai/flux/dev', {
    input: {
      prompt,
      image_size: imageSize,
      num_images: numImages,
      enable_safety_checker: true,
      ...(seed !== undefined && { seed }),
    },
  }) as FalImageResult

  return result
}

/**
 * Generate a short video via Kling AI on fal.ai
 * 5 credits = 5s video, 10 credits = 10s video
 */
export async function generateVideo(
  options: GenerateVideoOptions,
): Promise<FalVideoResult> {
  const { prompt, duration = 5 } = options

  const result = await fal.run('fal-ai/kling-video/v1/standard/text-to-video', {
    input: {
      prompt,
      duration: String(duration),
      aspect_ratio: '16:9',
    },
  }) as FalVideoResult

  return result
}
