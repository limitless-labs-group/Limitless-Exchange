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
 * @param {string} marketURI - The URI that points directly to the exchange.
 *                           - This should be a well-formed URI that users can visit to view the market directly.
 * @param {number[] | undefined} sharesCost - An array containing the percentages for each market outcome.
 *                                          - Each percentage represents the probability or share cost associated with a market outcome.
 *                                          - If undefined, the function will default to '0%' for each outcome in the message.
 *
 * @returns {ShareURI} An object containing URLs for sharing the market information
 *
 * @example
 * const marketExample = {
 *   title: "Presidential Election 2024",
 *   creator: { name: "Election Commission" },
 *   outcomeTokens: ["Candidate A", "Candidate B"]
 * };
 * const marketURI = "https://app.limitless.exchange/";
 * const sharesCost = [45.5, 54.5];
 *
 * const { tweetURI, castURI } = createShareUrls(marketExample, marketURI, sharesCost);
 * console.log(tweetURI);  // Outputs: URL for X tweet intent
 * console.log(castURI);   // Outputs: URL for Farcaster cast intent
 */
export function createShareUrls(
  market: Market | null,
  marketURI: string,
  sharesCost: number[] | undefined
): ShareURI {
  const formatOutcomeToken = (index: number) => `${sharesCost?.[index].toFixed(1) ?? 0}%`

  const baseMessage = `"${market?.title}" by ${market?.creator.name}\n${
    market?.outcomeTokens[0]
  } ${formatOutcomeToken(0)} | ${market?.outcomeTokens[1]} ${formatOutcomeToken(
    1
  )}\nMake your bet on`

  const encodedBaseMessage = encodeURI(baseMessage)

  return {
    tweetURI: `https://x.com/intent/tweet?text=${encodedBaseMessage} ${marketURI}`,
    //embeds is a param which gives ability to make pre-screen from market as Image/Link
    castURI: `https://warpcast.com/~/compose?text=${encodedBaseMessage}&embeds[]=${marketURI}`,
  }
}
