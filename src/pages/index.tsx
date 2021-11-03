import {GetStaticProps} from 'next'
import Head from 'next/head'
import Image from 'next/image'
import {SubscribeButton} from '../components/SubscribeButton'
import { HomeProps } from '../protocols/homeProtocols'
import { stripe } from '../services/stripe'

import styles from './home.module.scss'

export default function Home({product}: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | Dev.News</title>
      </Head>
      <main className={styles.contentContauner} >
        <section className={styles.hero} >
          <span>🤟  hey, welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId}/>
        </section>
        {/* O Next avisa para que seja utilizado o componente Image */}
        <Image 
          src="/images/avatar.svg" 
          alt="Girl coding"
          height={621}
          width={436}
        />
      </main>
    </>
  )
}

// Os casos abaixo são utilizados juntamente com o Next para auxiliar no processo de indexação do google/outros motores.

// Server-Side => Utilizado quando os dados do usuário que tá acessando a aplicação são utilizados em tempo real.
// Static Site Generation => Utilizado quando o html da página pode ser o mesmo para todos os usuários. (ex: um blog)
// Client- Side => Qualquer outro caso.

/* Para fazer uma chamada a API via SSR: Dentro de uma página do Next,
  deve-se criar uma função com o nome "GetServerSideProps" e importar a tipagem dela de dentro do Next
*/
export const getStaticProps: GetStaticProps = async () => {
  // Essa função não é executada no browser e sim dentro de um servidor Node dentro do Next.
  const price = await stripe.prices.retrieve("price_1JnA6DGDGQLqJ9x27l6UvKYb", {
    // para ter acesso a todas as informações do produto.
    expand: ["product"]
    // o expand não vai ser utilizado, só está ai para mostrar que é possivel pegar os dados do produto.
  })
  
  const product = {
    priceID: price.id,
    // O preço é salvo em centavos.
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: "USD",
    }).format(price.unit_amount / 100),

  }

  // O retorno precisa ser um objeto
  return {
    props: {
      product
    },
    // Quanto tempo em minutos essa página será mantida. (sem ter que ser reconstruida)
    revalidate: 60 * 60 * 24, // 24 horas
  }

} 
