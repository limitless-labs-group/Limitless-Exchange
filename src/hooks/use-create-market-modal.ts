import { useAtom } from 'jotai'
import { createMarketModalAtom, modalMarketAtom } from '@/atoms/draft'

export const useCreateMarketModal = () => {
  const [isOpen, setIsOpen] = useAtom(createMarketModalAtom)
  const [market, setMarket] = useAtom(modalMarketAtom)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(!isOpen)
  const type = market?.type
  const mode = market?.mode
  const marketType = market?.marketType

  return { isOpen, open, close, toggle, market, type, mode, marketType, setMarket }
}
