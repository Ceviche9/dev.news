# Fundamentos do NextJs

NextJs é um framework para React. O que isso quer dizer? O React é uma biblioteca Javascript para construção de interfaces e o Next é considerado um framework pois adiciona várias funcionalidades em cima do React. 

O NextJs auxilia no processo de indexação do google/outros motores, existem 3 formas de fazer essa indexação.

- SSR - Server-Side Rendering

Utilizado quando os dados do usuário que tá acessando a aplicação são utilizados em tempo real.

- SSG - Static Site Generation

Só pode ser utilizado em páginas que podem ser estáticas. Nesse caso o SSG é utilizado na home, para não ter que , toda vez que um usuário entrar na home page da plataforma, a aplicação fazer uma busca na API para trazer as informações sobre o preço da assinatura. Portanto, apenas a cada 24h, o servidor Node que está rodando no Next, faz essa busca na API do Stripe e atualiza a informação.

- CSR - Client Side Rendering

Utilizado em outros casos que também precisam de indexação.
## Estrutura de uma aplicação NextJs

As rotas da aplicação ficam todas dentro da pasta "/src/pages", esta pasta não pode ser renomeada e ela só pode está em dois lugares: na raiz do projeto ou dentro de uma pasta chamada "src". Dentro dela, o arquivo que tiver o nome "index" será a rota inicial da aplicação.

Também é possível notar que, dentro desta pasta, existe os arquivos _app.tsx e _document.tsx, o _document.tsx não é criado por padrão pelo template do Create Next-app, porem é de suma importância. 

O NextJs, por padrão, já vem com um sistema de "roteamento", ou seja, as rotas das aplicação já são construídas automaticamente ao criar arquivos dentro da pasta "pages", portanto, caso o desenvolvedor queira criar algo que irá repetir em várias páginas da aplicação ou criar um contexto global, ele terá que utilizar o arquivo _app.tsx, que fica "em volta" de toda aplicação, se comporta de uma forma bem semelhante ao app.tsx no CRA. Quando uma página é acessada no NextJs, ele acessa os páginas e os componentes por dentro do _App.tsx, esse arquivo é recarregado toda vez que usuário troca de página, ou quando um estado é modificado.

Já o arquivo _document.tsx, só é carregado uma vez, que é quando o usuário acessa a aplicação, esse arquivo se comporta da mesma forma que o index.html que fica dentro da pasta "public" no CRA.

### _document.tsx

```ts
import Document , {Html, Head, Main, NextScript} from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap" rel="stylesheet"/> 
          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        </Head>
        <body>
          <Main />
          <NextScript/>
        </body>
      </Html>
    )
  }
}
```
### _app.tsx

```ts
import {AppProps} from 'next/app'

import '../../styles/global.scss'
import { Header } from '../components/Header'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
```
## Estilização das páginas e componentes

No NextJs a estilização é um pouco diferente, não é possível criar arquivos styles.css e importa-los dentro de cada componente ou página. Para que o escopo de de estilização de um componente ou página não afete outras estilizações ou a estilização global, é utilizado o Scoped Css por padrão no NextJs. Para criar um Css único para um arquivo, basta adiconar a palavra "module" no nome do arquivo. 

Ex: home.module.css

Porém para estilizar cada componente ou tag HTML de um arquivo, é necessário utilizar classes ou Id's.

### home.module.scss

```scss
.contentContauner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 2rem;
  height: calc(100vh - 5rem);

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero {
  max-width: 600px;

  > span {
    font-size: 1.5rem;
    font-weight: bold;
  }

  h1 {
    font-size: 4.5rem;
    line-height: 4.5rem;
    font-weight: 900;

    margin-top: 2.5rem;

    span {
      color: var(--cyan-500)
    }
  }
  p {
    font-size: 1.5rem;
    line-height: 2.25rem;
    margin-top: 1.5rem;

    span {
      color: var(--cyan-500);
      font-weight: bold;
    }
  }

  button {
    margin-top: 1.5rem;
  }

}
```

### index.tsx (Sem os comentários e sem as configurações do SSG)

```tsx
import {GetStaticProps} from 'next'
import Head from 'next/head'
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
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  )
}
```
## API routes.

O API routes é uma ferramente do NextJs que permite a criação de APIs com o Next. Qualquer arquivo criado dentro da pasta `pages/api` é mapeado para /api/* e será tratado como um  endpoint da API em vez de uma página.

Ex: Imagine que o arquivo abaixo existe em `pages/api/index.ts`

```tsx
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' })
}
```

Ao acessar a rota `[http://localhost:3000/api/](http://localhost:3000/api/)` seria retornado um JSON com o status code 200. Essa API só é "montada" quando alguma requisição é feita por essa rota.

## Importante

Os unicos "locais seguros" dentro do NextJs que podem ser utilizados para executar métodos que utilizam as variáveis de ambientes ou necessitam de um certo nível de segurança são: 

- getServerSideProps().
- getStaticProps().
- API routes.

Os métodos de SSR e SSG são executados no servidor Node dentro do NextJs e não no front, não permitindo que o usuário consiga acessar esses métodos ou dados. E as API routes também são executadas dentro desse servidor. Porém os métodos SSR e SSG só são executados no memento em que a página está sendo renderizada.

## Next-Auth

O Next-auth permite que de uma forma rápida, simples e segura, o desenvolvedor adicione um sistema de autenticação pelo o front-end de sua aplicação NextJs. Como o Next possui um servidor NodeJs próprio, as informações do usuário não estão expostas no front.

Para criar uma estratégia de autenticação é preciso criar um arquivo com o nome `[...nextauth].ts` no caminho `pages/api/auth`. Dessa forma, uma rota será criada para fazer a autenticação do usuário. No caso dessa aplicação o arquivo ficou configurado da seguinte forma:

```tsx
import NextAuth from "next-auth"
import Providers from "next-auth/providers"

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: "read:user"
    }),
  ],
})
```
