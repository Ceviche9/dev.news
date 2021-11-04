import { useEffect } from 'react';
import Head from 'next/head'
import { getSession } from "next-auth/client"
import { RichText } from "prismic-dom";

import { GetServerSideProps } from "next"
import { getPrismicClient } from "../../services/prismic";

import { PostContentProps } from '../../protocols/postProtocols';

import ReactMarkdown from 'react-markdown';
// import remarkHtml from 'remark-html';

import prims from 'prismjs'

import styles from './post.module.scss'

export default function Post({ post }: PostContentProps) {
  useEffect(() => {
    prims.highlightAll();
  }, []);

  return(
    <>
      <Head>
        <title>{post.title} | Dev.news</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <ReactMarkdown
            className={styles.postContent}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session  = await getSession({ req })
  const { slug } = params
  
  // Para redirecionar um usuário dentro do ServerSide =>
  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const prismic = getPrismicClient(req)

  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asText(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return {
    props: {
      post,
    }
  }
}