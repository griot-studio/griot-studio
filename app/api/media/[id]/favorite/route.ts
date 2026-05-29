import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Read current state
  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('is_favorite')
    .eq('id', params.id)
    .eq('user_id', user.id)   // RLS double-check
    .single()

  if (fetchError || !media) {
    return NextResponse.json({ error: 'Media introuvable' }, { status: 404 })
  }

  const newValue = !media.is_favorite

  const { error: updateError } = await supabase
    .from('media')
    .update({ is_favorite: newValue })
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ is_favorite: newValue })
}
