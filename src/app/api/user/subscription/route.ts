import { NextRequest } from 'next/server'
import { withApiHeaders } from '@/lib/api/headers'
import { handleApiError } from '@/lib/errors/api-handler'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

const subscriptionSchema = z.object({
  planId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req)
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { planId } = subscriptionSchema.parse(await req.json())

    if (planId === 'cancel') {
      const subscription = await prisma.subscription.findUnique({
        where: { userId: session.userId },
      })

      if (subscription?.stripeId) {
        await stripe.subscriptions.cancel(subscription.stripeId)
      }

      await prisma.subscription.delete({
        where: { userId: session.userId },
      })

      return withApiHeaders(
        new Response(null, { status: 204 })
      )
    }

    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: session.user?.email,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
      metadata: {
        userId: session.userId,
      },
    })

    return withApiHeaders(
      Response.json({ url: stripeSession.url })
    )
  } catch (error) {
    return handleApiError(error)
  }
}