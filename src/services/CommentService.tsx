import {
  useInfiniteQuery,
  MutationStatus,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { createContext, PropsWithChildren, useContext } from 'react'
import { getAddress, toHex } from 'viem'
import { useSignMessage } from 'wagmi'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { useWalletAddress } from '@/hooks/use-wallet-address'
import { useEtherspot, useLimitlessApi } from '@/services'
import { useWeb3Service } from '@/services/Web3Service'
import { CommentPost } from '@/types'
import { ProfileActionType } from '@/types/profiles'

export interface IUseCreateComment {
  content: string
  marketAddress: string
}

export interface CommentServiceContext {
  createComment: (data: IUseCreateComment) => Promise<CommentPost>
  isPostCommentLoading: boolean
  isPostCommentSuccess: boolean
  postCommentStatus: MutationStatus
}

const CommentServiceContext = createContext({} as CommentServiceContext)

export const CommentServiceProvider = ({ children }: PropsWithChildren) => {
  const toast = useToast()

  const { signMessage, smartWalletExternallyOwnedAccountAddress } = useEtherspot()
  const { signMessageAsync } = useSignMessage()
  const { getSigningMessage } = useLimitlessApi()
  const { client } = useWeb3Service()
  const account = useWalletAddress()
  const queryClient = useQueryClient()

  const {
    mutateAsync: createComment,
    isPending: isPostCommentLoading,
    isSuccess: isPostCommentSuccess,
    status: postCommentStatus,
  } = useMutation({
    mutationKey: ['create-comment'],
    mutationFn: async ({ content, marketAddress }: IUseCreateComment): Promise<CommentPost> => {
      const { data: registerProfileSigningMessage } = await getSigningMessage(
        ProfileActionType.LEAVE_COMMENT
      )

      if (!registerProfileSigningMessage) throw new Error('Failed to get signing message')
      const signature = (
        client === 'eoa'
          ? await signMessageAsync({ message: registerProfileSigningMessage, account })
          : await signMessage(registerProfileSigningMessage)
      ) as `0x${string}`

      const headers = {
        'x-account':
          client === 'eoa'
            ? getAddress(account!)
            : getAddress(smartWalletExternallyOwnedAccountAddress!),
        'x-signature': signature,
        'x-signing-message': toHex(String(registerProfileSigningMessage)),
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/comments`,
        {
          content,
          marketAddress,
        },
        {
          headers,
        }
      )
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

  const contextProviderValue = {
    createComment,
    isPostCommentLoading,
    isPostCommentSuccess,
    postCommentStatus,
    useMarketInfinityComments,
  }
  return (
    <CommentServiceContext.Provider value={contextProviderValue}>
      {children}
    </CommentServiceContext.Provider>
  )
}

export const useCommentService = () => useContext(CommentServiceContext)

export const useMarketInfinityComments = (marketAddress?: string) => {
  return useInfiniteQuery<Comment[], Error>({
    queryKey: ['market-comments', marketAddress],
    // @ts-ignore
    queryFn: async ({ pageParam = 1 }) => {
      const response: AxiosResponse<Comment[]> = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/comments/markets/${marketAddress}`,
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
}
