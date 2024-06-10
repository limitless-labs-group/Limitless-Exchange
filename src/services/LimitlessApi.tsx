import { Address } from '@/types';
import axios from 'axios';
import { PropsWithChildren, createContext, useContext } from 'react';

interface ILimitlessApi {
  any?: any;
}

const LimitlessApiContext = createContext({} as ILimitlessApi);

export const useLimitlessApi = () => useContext(LimitlessApiContext);

export const LimitlessApiProvider = ({ children }: PropsWithChildren) => {
  const contextProviderValue: ILimitlessApi = {};

  return <LimitlessApiContext.Provider value={contextProviderValue}>{children}</LimitlessApiContext.Provider>;
};

export class LimitlessApi {
  static predictionMarketBaseURI = 'https://pma-api.limitless.network';
  static gatewayBaseURI = 'https://gateway-api.limitless.network';

  static async getSigningMessage() {
    const res = await axios.post(`${this.gatewayBaseURI}/auth/signing-message`);
    const { SigningMessage: message } = res.data as { SigningMessage: string };
    return message;
  }

  static async getFixedProductMarketMakerAddress() {
    const { data: fixedProductMarketMakerAddress } = await axios.get(
      `${this.predictionMarketBaseURI}/market-maker-address`,
    );
    console.log('fixedProductMarketMakerAddress:', fixedProductMarketMakerAddress);
    return fixedProductMarketMakerAddress as Address;
  }
}
