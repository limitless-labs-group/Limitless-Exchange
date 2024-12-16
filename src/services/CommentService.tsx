import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { useAccount as useWagmiAccount } from 'wagmi'
import { Toast } from '@/components/common/toast'
import { useAxiosPrivateClient } from './AxiosPrivateClient'
import { useToast } from '@/hooks'
import { limitlessApi } from '@/services/LimitlessApi'
import { CommentPost, LikePost, LikesGet } from '@/types'

export interface IUseCreateComment {
  content: string
  marketAddress: string
}

export interface ILikeComment {
  id: number
}

export interface CommentServiceContext {
  createComment: (data: IUseCreateComment) => Promise<CommentPost>
  isPostCommentLoading: boolean
  isPostCommentSuccess: boolean
}

const CommentServiceContext = createContext({} as CommentServiceContext)

export const CommentServiceProvider = ({ children }: PropsWithChildren) => {
  const toast = useToast()

  const privateClient = useAxiosPrivateClient()
  const queryClient = useQueryClient()

  const {
    mutateAsync: createComment,
    isPending: isPostCommentLoading,
    isSuccess: isPostCommentSuccess,
  } = useMutation({
    mutationKey: ['create-comment'],
    mutationFn: async ({ content, marketAddress }: IUseCreateComment): Promise<CommentPost> => {
      const res = await privateClient.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/comments`, {
        content,
        marketAddress,
      })
      return res.data
    },
    onSuccess: (_, { marketAddress }) => {
      queryClient.invalidateQueries({ queryKey: ['market-comments', marketAddress] })
    },
    onError: () => {
      const id = toast({
        render: () => <Toast id={id} title='An error occurred while submitting a comment' />,
      })
    },
  })

  const contextProviderValue = useMemo(() => {
    return {
      createComment,
      isPostCommentLoading,
      isPostCommentSuccess,
    }
  }, [isPostCommentLoading, isPostCommentSuccess])
  return (
    <CommentServiceContext.Provider value={contextProviderValue}>
      {children}
    </CommentServiceContext.Provider>
  )
}

export const useCommentService = () => useContext(CommentServiceContext)

export const useMarketInfinityComments = (marketAddress?: string) => {
  const { isConnected } = useWagmiAccount()
  const privateClient = useAxiosPrivateClient()
  const {
    data: comments,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<Comment[], Error>({
    queryKey: ['market-comments', marketAddress],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const client = isConnected ? privateClient : limitlessApi
      const response: AxiosResponse<Comment[]> = await client.get(
        `/comments/markets/${marketAddress}`,
        {
          params: {
            page: pageParam,
            limit: 10,
          },
        }
      )
      return { data: response.data, next: (pageParam as number) + 1 }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // @ts-ignore
      return lastPage.data.comments.length === 10 ? lastPage.next : null
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!marketAddress,
  })
  return useMemo(() => {
    return {
      data: comments,
      hasNextPage,
      fetchNextPage,
    }
  }, [comments, hasNextPage, fetchNextPage])
}

export const useLikeComment = (id: number) => {
  const { isConnected } = useWagmiAccount()
  const privateClient = useAxiosPrivateClient()
  return useMutation({
    mutationKey: ['like-comment', id],
    mutationFn: async (): Promise<LikePost> => {
      if (!isConnected) throw new Error('Login to like comments')

      const res = await privateClient.post(`/comments/${id}/like`)
      return res.data
    },
  })
}

export const useUnlikeComment = (id: number) => {
  const { isConnected } = useWagmiAccount()
  const privateClient = useAxiosPrivateClient()
  return useMutation({
    mutationKey: ['unlike-comment', id],
    mutationFn: async (): Promise<LikePost> => {
      if (!isConnected) throw new Error('Login to unlike comments')

      const res = await privateClient.post(`/comments/${id}/unlike`)
      return res.data
    },
  })
}

export const useLikes = (id: number) => {
  const privateClient = useAxiosPrivateClient()
  return useQuery({
    queryKey: ['likes', id],
    queryFn: async () => {
      const res = await privateClient.get(`/comments/${id}/likes`)
      return res.data
    },
    enabled: !!id,
  })
}
