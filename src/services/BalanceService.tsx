import { Toast, ToastWithdraw } from '@/components';
import { collateralToken, collateralTokensArray, defaultChain, weth } from '@/constants';
import { wethABI } from '@/contracts';
import { useToast } from '@/hooks';
import { publicClient, usePriceOracle } from '@/providers';
import { useEtherspot } from '@/services';
import { Address, GetBalanceResult, MarketTokensIds, Token } from '@/types';
import { Logger, NumberUtil } from '@/utils';
import { QueryObserverResult, UseMutateAsyncFunction, useMutation, useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  erc20Abi,
  formatEther,
  formatUnits,
  getContract,
  isAddress,
  parseEther,
  parseUnits,
  TransactionReceipt,
} from 'viem';
import { getBalance } from 'viem/actions';

interface IBalanceService {
  balanceOfSmartWallet: GetBalanceResult[] | undefined;
  refetchbalanceOfSmartWallet: () => Promise<QueryObserverResult<GetBalanceResult[] | undefined, Error>>;
  overallBalanceUsd: string;

  mint: (params: { address: Address; newToken?: boolean }) => void;
  isLoadingMint: boolean;

  addressToWithdraw: string;
  setAddressToWithdraw: (amount: string) => void;
  amount: string;
  setAmount: (amount: string) => void;
  unwrap: boolean;
  setUnwrap: (unwrap: boolean) => void;
  withdraw: UseMutateAsyncFunction<void, Error, void, unknown>;

  status: BalanceServiceStatus;
  setToken: Dispatch<SetStateAction<Token>>;
}

const BalanceService = createContext({} as IBalanceService);

export const useBalanceService = () => useContext(BalanceService);

export const BalanceServiceProvider = ({ children }: PropsWithChildren) => {
  /**
   * Helpers
   */
  const toast = useToast();
  const log = new Logger(BalanceServiceProvider.name);
  const pathname = usePathname();
  const { ethPrice, marketTokensPrices, convertAssetAmountToUsd } = usePriceOracle();

  /**
   * Etherspot
   */
  const { smartWalletAddress, transferErc20, whitelist, etherspot } = useEtherspot();

  /**
   * Weth balance
   */
  const { data: balanceOfSmartWallet, refetch: refetchbalanceOfSmartWallet } = useQuery({
    queryKey: ['balance', smartWalletAddress],
    queryFn: async () => {
      if (!smartWalletAddress) {
        return;
      }

      const balances = await Promise.allSettled(
        collateralTokensArray.map(async (token) => {
          const contract = getContract({
            address: token.address[defaultChain.id],
            abi: token.id === MarketTokensIds.WETH ? wethABI : erc20Abi,
            client: publicClient,
          });
          let newBalanceBI = (await contract.read.balanceOf([smartWalletAddress])) as bigint;
          // small balance to zero
          if (newBalanceBI < parseEther('0.000001')) {
            newBalanceBI = 0n;
          }

          return {
            symbol: token.symbol,
            id: token.id,
            name: token.name,
            decimals: token.decimals,
            value: newBalanceBI,
            formatted: formatUnits(newBalanceBI, token.decimals),
            image: token.imageURI,
            contractAddress: token.address[defaultChain.id],
            price: marketTokensPrices ? marketTokensPrices[token.id].usd : 0,
          } as GetBalanceResult;
        }),
      );

      const balanceResult: GetBalanceResult[] = balances.map((balance) => {
        // @ts-ignore
        return balance.value;
      });

      log.success('ON_BALANCE_SUCC', smartWalletAddress, balanceResult);

      balanceResult.forEach((balance) => {
        if (!!balanceOfSmartWallet) {
          const currentBalance = balanceOfSmartWallet.find((currentBalanceEntity) => {
            return currentBalanceEntity.id === balance.id;
          });
          if (currentBalance && balance.value > currentBalance.value) {
            !defaultChain.testnet && whitelist();
            const depositAmount = formatUnits(balance.value - currentBalance.value, collateralToken.decimals);

            toast({
              render: () => (
                <Toast title={`Balance top up: ${NumberUtil.toFixed(depositAmount, 6)} ${balance.symbol}`} />
              ),
            });
          }
        }
      });

      return balanceResult;
    },
    enabled: !!smartWalletAddress,
    refetchInterval: 5000,
  });

  console.log(balanceOfSmartWallet);

  const overallBalanceUsd = useMemo(() => {
    let _overallBalanceUsd = 0;
    balanceOfSmartWallet?.forEach((balanceResult) => {
      _overallBalanceUsd += convertAssetAmountToUsd(balanceResult.id, balanceResult.formatted);
    });
    return NumberUtil.toFixed(_overallBalanceUsd, 2);
  }, [balanceOfSmartWallet]);

  /**
   * Auto-wrap/unwrap Eth
   */
  const [unwrap, setUnwrap] = useState(false); // unwrap on withdrawal

  // disable unwrapping
  useEffect(() => {
    setUnwrap(false);
  }, [pathname]);

  useQuery({
    queryKey: ['autoWrapEth', smartWalletAddress, unwrap],
    queryFn: async () => {
      if (!smartWalletAddress || !etherspot || unwrap) {
        return;
      }

      const eth = await getBalance(publicClient, { address: smartWalletAddress });
      const ethFormatted = formatEther(eth);
      log.info('ETH balance:', ethFormatted);

      const gasFee = defaultChain.testnet ? 0.01 : 0; // there's no paymaster on testnet so it's required to left some eth for gas

      if (Number(ethFormatted) > gasFee) {
        if (!defaultChain.testnet) {
          await whitelist(); // TODO: refactor the logic of whitelisting
        }

        toast({
          render: () => <Toast title={'Wrapping ETH...'} />,
        });

        const receipt = await etherspot.wrapEth(eth - parseEther(gasFee.toString()));
        if (!receipt) {
          // TODO: show toast?
          log.error('autoWrapEth');
        } else {
          log.success('autoWrapEth', receipt);
        }
      }
    },
    enabled: !!smartWalletAddress && !!etherspot && !unwrap,
    refetchInterval: pathname.includes('wallet') && 5000, // polling on wallet page only
  });

  /**
   * Mint mocked erc20
   */
  const { mutate: mint, isPending: isLoadingMint } = useMutation({
    mutationFn: async (params: { address: Address; newToken?: boolean }) => {
      if (!etherspot) {
        return;
      }
      toast({
        render: () => <Toast title={'Processing transaction...'} />,
      });
      await etherspot.mintErc20(
        params.address,
        parseUnits('1', collateralToken.decimals),
        smartWalletAddress || '0x',
        params.newToken,
      );
      toast({
        render: () => <Toast title={'Confirmed. Updating balance...'} />,
      });
      await refetchbalanceOfSmartWallet();
    },
  });

  /**
   * WITHDRAW
   */
  // Address to withdraw funds to
  const [addressToWithdraw, setAddressToWithdraw] = useState<string>('');
  const isInvalidAddressToWithdraw = useMemo(
    () => !addressToWithdraw || !isAddress(addressToWithdraw),
    [addressToWithdraw],
  );

  // Amount to be withdrawn
  const [amount, setAmount] = useState<string>('');
  const [token, setToken] = useState(weth);
  const amountBI = useMemo(() => parseUnits(amount ?? '0', collateralToken.decimals), [amount]);
  const isInvalidAmount = useMemo(() => {
    const isInvalidBalance = balanceOfSmartWallet === undefined;
    const isNegativeOrZeroAmount = amountBI <= 0n;
    const balanceEntity = balanceOfSmartWallet?.find((balance) => {
      console.log(token);
      console.log(balance);
      return balance.id === token.id;
    }) as GetBalanceResult;
    const isExceedsBalance = !!balanceOfSmartWallet && amountBI > balanceEntity.value;
    return isInvalidBalance || isNegativeOrZeroAmount || isExceedsBalance;
  }, [balanceOfSmartWallet, amountBI, token]);

  // Mutation
  const { mutateAsync: withdraw, isPending: isLoadingWithdraw } = useMutation({
    mutationFn: async () => {
      if (unwrap) {
        toast({
          render: () => <Toast title={'Unwrapping ETH...'} />,
        });

        const unwrapReceipt = await etherspot?.unwrapEth(amountBI);
        if (!unwrapReceipt) {
          // TODO: show error toast
          log.error('Unwrap is unsuccessful');
          return;
        }

        await refetchbalanceOfSmartWallet();

        toast({
          render: () => <Toast title={'Sending ETH...'} />,
        });

        const transferReceipt = (await etherspot?.transferEthers(addressToWithdraw as Address, amountBI, true)) as
          | TransactionReceipt
          | undefined;

        if (!transferReceipt) {
          // TODO: show error toast
          log.error('Transfer ETH is unsuccessful');
          return;
        }

        setAmount('');
        setUnwrap(false);

        toast({
          render: () => <ToastWithdraw receipt={transferReceipt} />,
        });

        return;
      }

      await transferErc20({
        token: collateralToken.address[defaultChain.id],
        to: addressToWithdraw as Address,
        amount: amountBI,
        onSign: () => {
          toast({
            render: () => <Toast title={'Processing transaction...'} />,
          });
        },
        onConfirm: async (receipt) => {
          setAmount('');
          await refetchbalanceOfSmartWallet();
          toast({
            render: () => <ToastWithdraw receipt={receipt} />,
          });
        },
      });
    },
  });

  /**
   * UI STATUS
   */
  const status: BalanceServiceStatus = useMemo(() => {
    if (isLoadingMint || isLoadingWithdraw) {
      return 'Loading';
    }
    if (isInvalidAddressToWithdraw) {
      return 'InvalidAddress';
    }
    if (isInvalidAmount) {
      return 'InvalidAmount';
    }
    return 'ReadyToFund';
  }, [isInvalidAddressToWithdraw, isInvalidAmount, isLoadingMint, isLoadingWithdraw]);

  return (
    <BalanceService.Provider
      value={{
        balanceOfSmartWallet,
        refetchbalanceOfSmartWallet,
        overallBalanceUsd,
        mint,
        isLoadingMint,
        addressToWithdraw,
        setAddressToWithdraw,
        amount,
        setAmount,
        unwrap,
        setUnwrap,
        withdraw,
        setToken,
        status,
      }}
    >
      {children}
    </BalanceService.Provider>
  );
};

export type BalanceServiceStatus =
  | 'WalletNotConnected'
  | 'WrongNetwork'
  | 'InvalidAmount'
  | 'InvalidAddress'
  | 'ExceedsAllowance'
  | 'ReadyToFund'
  | 'FundingSubmitted'
  | 'Loading'
  | 'Idle';
