import { GetStaticPaths, GetStaticProps } from 'next';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>Post | spacetraveling</title>
      </Head>

      <Header />

      <img
        className={styles.postImage}
        src={post.data.banner.url}
        alt="react"
      />

      <main className={`${commonStyles.content} ${styles.post}`}>
        <h1 className={styles.title}>{post.data.title}</h1>

        <div className={commonStyles.iconsContainer}>
          <div>
            <FiCalendar />
            <time>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
          </div>

          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>

          <div>
            <FiClock />
            <span>4 min</span>
          </div>
        </div>
        <article className={styles.article}>
          {post.data.content.map(item => (
            <div key={item.heading}>
              <h2 className={styles.heading}>{item.heading}</h2>
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(item.body),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      fetch: [],
    }
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    ...response,
    title: response.data.title,
    // content: RichText.asHtml(response.data.content),
  };

  return {
    props: {
      post,
    },
  };
};
