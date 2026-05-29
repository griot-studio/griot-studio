import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Griot Studio <noreply@griotstudio.com>'

export async function sendWelcomeEmail(to: string, name?: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Bienvenue sur Griot Studio ✦',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#080806;color:#F0EDE6;padding:32px;border-radius:12px">
        <h1 style="font-size:24px;margin-bottom:8px;color:#C9A84C">
          Griot<span style="color:#F0EDE6">.</span>Studio
        </h1>
        <p style="color:#A8A398;margin-bottom:24px">Le studio IA pour créateurs africains</p>
        <h2 style="font-size:18px;margin-bottom:12px">
          Bienvenue${name ? `, ${name}` : ''} 🎉
        </h2>
        <p>Tu as 5 crédits offerts pour explorer le studio.</p>
        <p style="margin-top:16px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/generate"
             style="display:inline-block;background:#C9A84C;color:#080806;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            ✦ Commencer à générer
          </a>
        </p>
      </div>
    `,
  })
}

export async function sendSubscriptionConfirmEmail(
  to: string,
  plan: string,
  credits: number | string,
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Plan ${plan} activé — Griot Studio`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#080806;color:#F0EDE6;padding:32px;border-radius:12px">
        <h1 style="font-size:24px;margin-bottom:8px;color:#C9A84C">Griot<span style="color:#F0EDE6">.</span>Studio</h1>
        <h2 style="font-size:18px;margin:24px 0 12px">Plan ${plan} activé ✓</h2>
        <p>
          Tu disposes maintenant de
          <strong style="color:#C9A84C">${credits === 999999 ? 'crédits illimités' : `${credits} crédits`}</strong>.
        </p>
        <p style="margin-top:16px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/generate"
             style="display:inline-block;background:#C9A84C;color:#080806;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            ✦ Générer maintenant
          </a>
        </p>
      </div>
    `,
  })
}

export async function sendCancellationEmail(to: string, cancelAt: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Abonnement annulé — Griot Studio',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#080806;color:#F0EDE6;padding:32px;border-radius:12px">
        <h1 style="font-size:24px;margin-bottom:8px;color:#C9A84C">Griot<span style="color:#F0EDE6">.</span>Studio</h1>
        <h2 style="font-size:18px;margin:24px 0 12px">Abonnement annulé</h2>
        <p>Ton abonnement prend fin le <strong>${cancelAt}</strong>.</p>
        <p>Tu garderas accès à toutes les fonctionnalités jusqu'à cette date.</p>
        <p style="margin-top:16px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings"
             style="display:inline-block;background:#C9A84C;color:#080806;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
            Gérer mon abonnement
          </a>
        </p>
      </div>
    `,
  })
}
