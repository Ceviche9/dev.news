import {query as q} from 'faunadb'

import NextAuth from "next-auth"
import Providers from "next-auth/providers"

import {fauna} from '../../../services/fauna'

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: "read:user"
    }),
  ],
  // Callbacks are asynchronous functions you can use to control what happens when an action is performed.
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    async session(session) {
      try{
        // Para buscar se o usuário já tem uma inscrição ativa.
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        )

        return {...session, activeSubscription: userActiveSubscription}
      } catch(err) {
        return {...session, activeSubscription: null}
      }
    },
    async signIn(user, account, profile ) {
      try {
        const {email} = user
        
        await fauna.query(
          // FQL +> Fauna query language

          q.If( // Se
            q.Not( // Não
              q.Exists( // Existe
                q.Match( // Um usuário que tenha esse email
                  q.Index('user_by_email'),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create(
              q.Collection('users'),
              {data: {email}}
            ), // Else
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
            )
          )
        )
        )

      } catch(err) {
        console.log(err)
        return false
      }
      
      return true
    }
  }
})