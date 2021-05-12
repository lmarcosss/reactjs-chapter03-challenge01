import { useState } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(() => {
    if (postsPagination?.results) {
      return postsPagination.results;
    }

    return [];
  });

  const [pagination, setPagination] = useState(() => postsPagination.next_page);

  function fetchMorePosts(): void {
    fetch(postsPagination.next_page).then(response =>
      response.json().then((data: PostPagination) => {
        setPosts([...posts, ...data.results]);
        setPagination(data.next_page);
      })
    );
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={commonStyles.container}>
        <div className={`${commonStyles.content} ${styles.posts}`}>
          <img alt="logo" src="images/logo.svg" />

          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <p className={styles.title}>{post.data.title}</p>
                <p className={styles.subtitle}>{post.data.subtitle}</p>
                <div className={commonStyles.iconsContainer}>
                  <div>
                    <FiCalendar />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        { locale: ptBR }
                      )}
                    </time>
                  </div>

                  <div>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {pagination && (
            <button type="button" onClick={fetchMorePosts}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsPagination = await prismic.query(
    Prismic.Predicates.at('document.type', 'post'),
    { fetch: [] }
  );

  return {
    props: { postsPagination },
  };
};
