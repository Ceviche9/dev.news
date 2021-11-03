/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import { fauna } from "../../services/fauna";
import { query as q } from "faunadb"; 

// Método para conseguir as informações da sessão.
import {getSession} from 'next-auth/client'
import { stripe } from "../../services/stripe";

import { UserProps } from "./protocols/userProtocols";

export default async(req: NextApiRequest, res: NextApiResponse) => {
  // Verificando se o método da requisição é um POST
  if(req.method === 'POST') {
    // Cada cliente que se inscreve na aplicação precisa ser armazenado no Stripe, para isso um registro desse cliente precisa ser criado.
    // Por padrão o NextAuth salva as informações do usuário logado dentro dos Cookies da aplicação.
    const session = await getSession({ req })
    // Pegando os dados do usuário do Fauna.
    const faunaUserData = await fauna.query<UserProps>(
      q.Get(
        q.Match(
          q.Index('user_by_email'),
          q.Casefold(session.user.email)
        )
      )
    )
    const user = session.user

    let customerId = faunaUserData.data.stripe_customer_id

    if(!customerId) {
      // Criando um cliente Stripe.
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        //metadata
      })
  
      // Salvando o StripeId do cliente no Fauna.
      await fauna.query(
        q.Update(
          q.Ref(q.Collection('users'), faunaUserData.ref.id),
          {
            data: {
              stripe_customer_id: stripeCustomer.id
            }
          }
          )
      )
      
      customerId = stripeCustomer.id
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      // Caso queira obrigar o usuário a preencher o endereço.
      billing_address_collection: 'required',
      // Quais são os itens que o usuário pode adquirir.
      line_items: [
        {
          price: 'price_1JnA6DGDGQLqJ9x27l6UvKYb',
          quantity: 1,
        }
      ],
      mode: 'subscription',
      // Para permitir a criação de códigos promocionais.
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })

    return res.status(200).json({sessionId: stripeCheckoutSession.id})
  } else {
    // Esclarecendo para o front que o método que essa rota aceita é POST
    res.setHeader('allow', 'POST')
    res.status(405).end('Method nor allowed')
  }
}