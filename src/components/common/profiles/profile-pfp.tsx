import { CSSProperties, useCallback, useMemo } from 'react'
import {
  ClickEvent,
  ProfilePictureUploadClickedMetadata,
  useAmplitude,
  useProfileService,
} from '@/services'
import { Box, Circle, Input, Spinner } from '@chakra-ui/react'
import { EditPenIcon, AddImageIcon } from '@/components/common/profiles'
import { useIsMobile } from '@/hooks'
import Loader from '@/components/common/loader'

export interface IProfilePfp {
  onClick?: () => void
}

export const ProfilePfp = ({ onClick }: IProfilePfp) => {
  const isMobile = useIsMobile()
  const { trackClicked } = useAmplitude()
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

  const handleOnClickIconButton = useCallback(() => {
    pfpFileRef.current.click()
    onClick?.()
    trackClicked<ProfilePictureUploadClickedMetadata>(ClickEvent.ProfilePictureUploadClicked, {
      platform: isMobile ? 'Mobile' : 'Desktop',
    })
  }, [isMobile, pfpFileRef])

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
          onClick={handleOnClickIconButton}
          // cursor={'pointer'}
        />
        {updatePfpLoading ? (
          // <Spinner color={!pfpUrl ? 'grey.800' : 'white'} size='sm' />
          <Loader loadingIconColor={!pfpUrl ? 'grey.800' : 'white'} />
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
