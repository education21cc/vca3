import { useEffect, useRef } from 'react'
import type { Content, ContentConfig } from '@/data/Content'
import { type GameData } from '@/components/playerBridge/GameData'
import { send } from '../playerBridge/utils'
import './styles/modal.css'

interface GameDataEvent {
  data: {
    type: 'exit' | 'setGameData' | 'back',
    data: GameData<Content>;
  }
}

interface Props {
  content: ContentConfig;
  open: boolean;
  onBack?: () => void;
  onSetGameData: (data: GameData<Content>) => void
}

const IFrameModal = (props: Props) => {
  const { onBack, onSetGameData, content} = props
  const ref = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleLoad = () => {
      // Send gamedata to iframe. Iframe needs to pick this up and serve it to the game when needed
      ref?.current?.contentWindow?.postMessage(content.data, '*')
    }

    const handleMessage = (event: GameDataEvent) => {
      switch (event.data.type) {
        case 'setGameData':
          // The iframe is sending a GameData to be stored
          onSetGameData(event.data.data)
          break
        case 'back':
          if (onBack) {
            onBack()
          }
          break
        case 'exit':
          send({
            type: 'exit'
          })
          break
      }
    }
    ref?.current?.addEventListener('load', handleLoad, true)
    window.addEventListener('message', handleMessage, true)

  }, [content.data, onBack, onSetGameData])

  return (
    <iframe
      src={content.url}
      ref={ref}
      title={content.url}
      className={`iframe-content ${props.open ? 'visible' : 'hidden'}`}
    />
  )
}

export default IFrameModal
