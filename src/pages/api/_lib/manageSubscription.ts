import { fauna } from "../../../services/fauna"
import { stripe } from "../../../services/stripe"

import { query as q } from "faunadb"

export const saveSubscription = async (
  subscriptionId: string,
  customerId: string
) => {
try {
  //Buscar o usuário no banco do Fauna com o Id do Stripe.
  const userRef = await fauna.query(
    // Usando o q.Select é possivel escolher quais campos da tabela você quer retornar.
    q.Select(
      "ref",
      q.Get(
        q.Match(
          q.Index('user_by_stripe_customer_id'),
            customerId
          )
        )
      )
    )

  // Pelo o webhook o stripe envia apenas o id da subscription.
  // Para conseguir todos os dados =>
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,

  }


  await fauna.query(
    q.Create(
      q.Collection('subscriptions'),
      {data: subscriptionData}
    )
  )

}catch(err) {
  console.log(err)
  return
}



  // Salvar os dados da subscription do usuário no Fauna.

}