import { MutableRefObject, PropsWithChildren, useEffect, useRef } from 'react'

type OutsideClickContainerProps = {
  onClick: () => void
}

export default function OutsideClickContainer({
  onClick,
  children,
}: PropsWithChildren<OutsideClickContainerProps>) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  useOutsideClick(wrapperRef, onClick)

  return (
    <div ref={wrapperRef} className='flex'>
      {children}
    </div>
  )
}

function useOutsideClick(ref: MutableRefObject<HTMLDivElement | null>, onClick: () => void) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // @ts-ignore
      if (ref.current && !ref.current.contains(event.target)) {
        onClick()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, onClick])
}
