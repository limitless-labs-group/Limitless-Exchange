import { Market } from '@/types'

/*
 * tweetURI: A URL for sharing the market details on Twitter. This URL is pre-configured with an intent to tweet,
 *           including the market details and a direct link to the market.
 * castURI:  A URL for sharing the market details on Farcaster. This URL includes the market details and embeds the market URI
 *           to provide a direct link along with the cast.
 */
export type ShareURI = {
  tweetURI: string
  castURI: string
}

/**
 * Generates URLs for sharing market information on social media platforms.
 * This function constructs a message containing details about a market, such as its title and creator, along with outcome probabilities.
 * It then encodes this message for URL compatibility and constructs URLs for sharing on specified platforms.
 *
 * @param {Market | null} market - The market object containing details like title, creator, and outcomes.
 * @param {number[] | undefined} outcomeTokensPercent - An array containing the percentages for each market outcome.
 *                                             - Each percentage represents the probability or share cost associated with a market outcome.
 *                                             - If undefined, the function will default to '50%' for each outcome in the message.
 * @param {string | undefined} creatorName - Markets creator name
 *
 * @returns {ShareURI} An object containing URLs for sharing the market information
 *
 * @example
 * const marketExample = {
 *   title: "Presidential Election 2024",
 *   creator: { name: "Election Commission" },
 *   outcomeTokens: ["Candidate A", "Candidate B"]
 * };
 * const outcomeTokensPercent = [45.5, 54.5];
 *
 * const { tweetURI, castURI } = createShareUrls(marketExample, outcomeTokensPercent);
 * console.log(tweetURI);  // Outputs: URL for X tweet intent
 * console.log(castURI);   // Outputs: URL for Farcaster cast intent
 */
export const createMarketShareUrls = (
  market: Market | null | undefined,
  outcomeTokensPercent: number[] | undefined,
  creatorName?: string
): ShareURI => {
  const formatOutcomeTokenPercent = (index: number) => {
    if (!outcomeTokensPercent || !outcomeTokensPercent[index]) return '51.00%'
    if (index < 0 || index >= outcomeTokensPercent.length) {
      console.warn('Invalid index provided to formatOutcomeTokenPercent')
      return '50.00%'
    }

    const currentValue = Math.max(0, outcomeTokensPercent[index])
    const sum = outcomeTokensPercent.reduce((acc, curr) => acc + Math.max(0, curr), 0)
    if (sum <= 0) {
      return '50.00%'
    } else if (sum > 100) {
      const normalizedValue = (currentValue * 100) / sum
      return `${normalizedValue.toFixed(2)}%`
    }

    return `${currentValue.toFixed(2)}%`
  }

  // const baseMessage = `"${
  //   market?.proxyTitle ?? market?.title
  // }" by ${creatorName}\n${'Yes'} ${formatOutcomeTokenPercent(0)} | 'No' ${formatOutcomeTokenPercent(
  //   1
  // )}\nMake your bet on`

  const marketURI = `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${market?.slug}`

  const baseMessage = `"${
    market?.proxyTitle ?? market?.title
  }" by ${creatorName}\nMake your bet on ${marketURI}`

  const encodedBaseMessage = encodeURI(baseMessage)

  return {
    tweetURI: `https://x.com/intent/tweet?text=${encodedBaseMessage}`,
    //embeds is a param which gives ability to make pre-screen from market as Image/Link
    castURI: `https://warpcast.com/~/compose?text=${encodedBaseMessage}&embeds[]=${marketURI}`,
  }
}

export const createPostShareUrls = (slug: string) => {
  const postURI = `${process.env.NEXT_PUBLIC_APP_URL}/markets/${slug}`
  const baseMessage = 'Check this post on Limitless'
  const encodedBaseMessage = encodeURI(baseMessage)

  return {
    tweetURI: `https://x.com/intent/tweet?text=${encodedBaseMessage}`,
    castURI: `https://warpcast.com/~/compose?text=${encodedBaseMessage}&embeds[]=${postURI}`,
  }
}

// /**
//  * Generates URLs for sharing portfolio information on social media platforms.
//  * This function constructs a message containing details about a market, such as its title and creator, along with the amount user invested and selected outcome.
//  * It then encodes this message for URL compatibility and constructs URLs for sharing on specified platforms.
//  *
//  * @param {Market | null} market - The market object containing details like title, creator, and outcomes.
//  * @param {HistoryPosition} position - The object from HistoryService that represents user's trading statistics on particular market.
//  *
//  * @returns {ShareURI} An object containing URLs for sharing the market information
//  */
// export const createPortfolioShareUrls = (
//   market: Market | null | undefined,
//   position: HistoryPosition
// ) => {
//   const baseMessage = `"${market?.proxyTitle ?? market?.title}" by ${
//     market?.creator.name
//   }\nMy bet: ${NumberUtil.toFixed(position.collateralAmount, 6)} ${
//     position.market.collateral?.symbol
//   } for ${position.outcomeIndex ? 'No' : 'Yes'}\nMake yours on`
//
//   const encodedBaseMessage = encodeURI(baseMessage)
//
//   const marketURI = `${process.env.NEXT_PUBLIC_FRAME_URL}/markets/${market?.address}`
//
//   return {
//     tweetURI: `https://x.com/intent/tweet?text=${encodedBaseMessage} ${marketURI}`,
//     //embeds is a param which gives ability to make pre-screen from market as Image/Link
//     castURI: `https://warpcast.com/~/compose?text=${encodedBaseMessage}&embeds[]=${marketURI}`,
//   }
// }
