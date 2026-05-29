import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GalleryClient } from './GalleryClient'
import type { Media } from '@/types'

export default async function GalleryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return <GalleryClient initialMedia={(media ?? []) as Media[]} />
}
