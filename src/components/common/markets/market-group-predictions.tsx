import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  VStack,
  Text,
} from '@chakra-ui/react'
import MarketPrediction from '@/app/(markets)/market-group/[slug]/components/market-prediction'
import { useTradingService } from '@/services'
import { paragraphMedium } from '@/styles/fonts/fonts.styles'

export default function MarketGroupPredictions() {
  const { setMarket, marketGroup } = useTradingService()

  const lessOnePercentMarkets = marketGroup?.markets.filter((market) => market.prices[0] < 1)

  const moreOnePercentMarkets = marketGroup?.markets.filter((market) => market.prices[0] >= 1)

  return marketGroup ? (
    <Box mt='24px'>
      <VStack w='full' gap='8px' mb='8px'>
        {moreOnePercentMarkets?.map((market) => (
          <MarketPrediction market={market} setSelectedMarket={setMarket} key={market.address} />
        ))}
      </VStack>
      {!!lessOnePercentMarkets?.length && (
        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton w='fit-content' gap='4px' color='grey.500'>
                <Text {...paragraphMedium} color='grey.500'>
                  Predictions with less than a 1% chance
                </Text>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              <VStack gap='8px'>
                {lessOnePercentMarkets.map((market) => (
                  <MarketPrediction
                    key={market.address}
                    market={market}
                    setSelectedMarket={setMarket}
                  />
                ))}
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </Box>
  ) : null
}
