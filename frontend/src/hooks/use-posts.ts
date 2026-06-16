import { useEffect, useState } from 'react';
import Post from '@/types/post-type';
import { PostsResponse, postApi } from '@/lib/api';

type AsyncState<T> = {
  data: T;
  loading: boolean;
  error: string;
};

export function usePostList(params?: Record<string, string | number | undefined>) {
  const [state, setState] = useState<AsyncState<PostsResponse>>({
    data: { data: [] },
    loading: true,
    error: '',
  });

  useEffect(() => {
    let mounted = true;
    setState((current) => ({ ...current, loading: true, error: '' }));
    postApi
      .list(params)
      .then((data) => mounted && setState({ data, loading: false, error: '' }))
      .catch((error) =>
        mounted && setState({ data: { data: [] }, loading: false, error: error.message })
      );

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(params)]);

  return state;
}

export function useDiscoveryPosts() {
  const [state, setState] = useState<AsyncState<{ featured: Post[]; latest: Post[]; trending: Post[] }>>({
    data: { featured: [], latest: [], trending: [] },
    loading: true,
    error: '',
  });

  useEffect(() => {
    let mounted = true;
    Promise.all([postApi.featured(), postApi.latest(), postApi.trending()])
      .then(([featured, latest, trending]) => {
        if (mounted) setState({ data: { featured, latest, trending }, loading: false, error: '' });
      })
      .catch((error) => mounted && setState((current) => ({ ...current, loading: false, error: error.message })));

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
