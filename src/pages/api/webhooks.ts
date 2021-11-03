/* eslint-disable import/no-anonymous-default-export */
// rodar um yarn webhook
import { NextApiRequest, NextApiResponse } from "next";

import {Readable} from 'stream';

import Stripe from "stripe";
import {stripe} from '../../services/stripe';

import { saveSubscription } from "./_lib/manageSubscription";

// As informações que vem do webhook do stripe vem em formato de stream
// A função abaixo pega os dados desse streaming e armazena em um array.
const buffer = async (readable: Readable) => {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === "string" ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks)

}

// Por padrão o Next tem um formato de entender a requisição, porém, nesse caso a requisição vem como uma stream.
// https://nextjs.org/docs/api-routes/api-middlewares
export const config = {
  api: {
    bodyParser: false
  }
}

// Determinando quais eventos são relevantes.
const relevantEvents = new Set([
  'checkout.session.completed'
])

export default async (req: NextApiRequest , res: NextApiResponse ) => {
  if(req.method === 'POST') {
    const buf = await buffer(req)
    // Os webhooks é uma rota da aplicação que se não for protegida qualquer um pode acessar.
    const secret = req.headers['stripe-signature']

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const {type} = event

    if(relevantEvents.has(type)) {
      try {
        // Expressão => condição
        // case => valor
        switch (type) {
          // caso o valor do type seja 'checkout.session.completed'
          case 'checkout.session.completed':

            const checkoutSession = event.data.object as Stripe.Checkout.Session

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString()
            )

            break;
          //Instruções executadas quando o valor da expressão é diferente de todos os cases
          default:
            throw new Error('Unhandled event')
        }
      } catch(err) {
        // O correto seria retornar alguma mensagem ao usuário avisando que deu um erro.
        res.json({error: 'webhook handler fail'})
        return
      }
    }
      
    res.json({receivedk: true})

  } else {
    // Esclarecendo para o front que o método que essa rota aceita é POST
    res.setHeader('allow', 'POST')
    res.status(405).end('Method nor allowed')
  }
}
