import { useAtom } from 'jotai'
import { createMarketModalAtom, draftMarketTypeAtom, modalMarketAtom } from '@/atoms/draft'

export const useCreateMarketModal = () => {
  const [isOpen, setIsOpen] = useAtom(createMarketModalAtom)
  const [market, setMarket] = useAtom(modalMarketAtom)
  const [, setMarketType] = useAtom(draftMarketTypeAtom)

  const open = () => setIsOpen(true)
  const reset = () => {
    setMarket(null)
  }
  const close = () => {
    setIsOpen(false)
    reset()
  }
  const toggle = () => {
    setIsOpen(!isOpen)
    reset()
  }
  const type = market?.type
  const mode = market?.mode
  const marketType = market?.marketType
  const id = market?.id

  return { isOpen, open, id, close, toggle, market, type, mode, marketType, setMarket, reset }
}
