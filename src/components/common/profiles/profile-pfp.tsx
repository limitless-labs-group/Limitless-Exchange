import { EditPenIcon, AddImageIcon } from '@/components/common/profiles'
import { Toast } from '@/components/common/toast'
import { useToast } from '@/hooks'
import { useProfileService } from '@/services'
import { Box, Circle, Input, Spinner } from '@chakra-ui/react'
import { CSSProperties, useMemo } from 'react'

export const ProfilePfp = () => {
  const { pfpPreview, pfpUrl, pfpFileRef, updatePfpLoading, setPfpFile } = useProfileService()

  const bgImage = useMemo(() => {
    if (pfpPreview) return `url(${pfpPreview})`
    if (pfpUrl) return `url(${pfpUrl})`
    if (!pfpUrl && pfpPreview) return `url(${pfpPreview})`
    if (!pfpUrl && !pfpPreview) return undefined
    if (pfpUrl && pfpPreview) return `url(${pfpPreview})`
    if (pfpUrl && !pfpPreview) return `url(${pfpUrl})`
  }, [pfpPreview, pfpUrl])

  const renderIcon = () => {
    const _onClick = () => pfpFileRef.current.click()
    const _style: CSSProperties = { position: 'absolute', height: '16px', width: '16px' }
    const _cursor = 'pointer'

    if (pfpUrl || pfpPreview)
      return <EditPenIcon onClick={_onClick} cursor={_cursor} style={_style} />

    if (!pfpUrl)
      return <AddImageIcon color='grey.800' onClick={_onClick} cursor={_cursor} style={_style} />
  }

  return (
    <>
      <Circle
        size='80px'
        bg='grey.300'
        bgImage={bgImage}
        bgSize='cover'
        bgPosition='center'
        bgRepeat='no-repeat'
      >
        <Box
          pos='absolute'
          bg={!pfpUrl ? 'none' : 'grey.500'}
          w='32px'
          h='24px'
          borderRadius='2px'
          opacity={0.7}
          onClick={() => pfpFileRef.current.click()}
          // cursor={'pointer'}
        />
        {updatePfpLoading ? (
          <Spinner color={!pfpUrl ? 'grey.800' : 'white'} size='sm' />
        ) : (
          renderIcon()
        )}
      </Circle>

      <Input
        display='hidden'
        type='file'
        id='pfpFile'
        name='pfpFile'
        style={{ display: 'none' }}
        ref={pfpFileRef}
        accept={'image/png, image/jpeg'}
        onChange={(e) => setPfpFile(e?.target?.files?.[0])}
      />
    </>
  )
}
