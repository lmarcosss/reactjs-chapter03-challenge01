import { GetStaticPaths, GetStaticProps } from 'next';
import { useMemo } from 'react';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';
import Header from '../../components/Header';
import Comments from '../../components/Comments';
import { getPrismicClient } from '../../services/prismic';
import PreviewButton from '../../components/PreviewButton';

interface Post {
  first_publication_date: string | null;
  uid: string;
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
  prevPost: Post;
  nextPost: Post;
  preview: boolean;
}

export default function Post({
  post,
  preview,
  prevPost,
  nextPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const readTime = Math.round(
    post.data.content
      .reduce((text, article) => {
        return `${text} ${article.heading} ${RichText.asText(article.body)}`;
      }, '')
      .split(' ').length / 200 // HUMAN READ VALUE PER MINUTE
  );

  const navigationStyle = `${
    !prevPost && !!nextPost ? styles.containerNextPost : ''
  } ${!!prevPost && !nextPost ? styles.containerPrevPost : ''}`;

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

        <div
          className={`${commonStyles.iconsContainer} ${styles.containerInformations}`}
        >
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
            <span>{readTime} min</span>
          </div>
        </div>

        {!!post?.first_publication_date && (
          <time>
            * editado em{' '}
            {format(
              new Date(post.first_publication_date),
              "dd MMM yyyy, 'às' hh:mm",
              {
                locale: ptBR,
              }
            )}
          </time>
        )}

        <article className={styles.article}>
          {post.data.content.map(item => (
            <div key={item.heading}>
              <h2 className={styles.heading}>{item.heading}</h2>
              <div
                className={styles.postContent}
                /* eslint-disable */
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(item.body),
                }}
              />
            </div>
          ))}
        </article>

        <div
          className={`
            ${styles.navigationContainer}
            ${navigationStyle}
          `}
        >
          {prevPost?.data && prevPost?.uid && (
            <Link href={`/post/${prevPost.uid}`}>
              <a className={styles.previousPost}>
                <span>{prevPost.data.title}</span>
                <p>Post anterior</p>
              </a>
            </Link>
          )}

          {nextPost?.data && nextPost?.uid && (
            <Link href={`/post/${nextPost.uid}`}>
              <a className={styles.nextPost}>
                <span>{nextPost.data.title}</span>
                <p>Próximo post</p>
              </a>
            </Link>
          )}
        </div>

        <Comments />

        <PreviewButton preview={preview} />
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const post = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const prevPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      after: String(post.id),
      orderings: '[document.first_publication_date]',
    }
  );

  // const postsPagination = await prismic.query(
  //   Prismic.Predicates.at('document.type', 'post'),
  //   {
  //     ref: previewData?.ref ?? null,
  //     orderings: '[document.first_publication_date desc]',
  //   }
  // );

  const nextPost = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      after: String(post.id),
      orderings: '[document.first_publication_date desc]',
    }
  );

  console.log(prevPost.results);

  return {
    props: {
      post,
      preview,
      prevPost: prevPost.results[0] || null,
      nextPost: nextPost.results[0] || null,
    },
  };
};
