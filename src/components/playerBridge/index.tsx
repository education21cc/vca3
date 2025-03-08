
import { useEffect } from 'react'
import CloseIcon from './style/close.svg?react'
import { GameData } from './GameData'
import { send } from './utils'

import './style/styles.css'

interface Props<TContentType> {
  enabled?: boolean // in dev mode bridge is off
  disableBackButton?: boolean
  gameDataReceived: (gameData: GameData<TContentType>) => void
}

export type GameEvent = {
  code: string,
  level?: number,
  additionalInfo?: string
}

declare global {
  interface Window {
    setGameData: (gameData: unknown) => void;
    storeGameEvent: (gameEvent: GameEvent) => void;
    getGameData: () => unknown
    GAMEDATA: unknown
    webkit?: {
      messageHandlers: {
        cordova_iab: {
          postMessage: (message: string) => void
        }
      }
    }
  }
}

const PlayerBridge = <TContentType,>(props: Props<TContentType>) => {
  const { gameDataReceived, disableBackButton, enabled } = props
  useEffect(() => {
    /* Add the following to index.html
    <script>
      const receiveMessage = (msg) => {
        if (!msg.data.hasOwnProperty('content')){
            return;
        }
        window.GAMEDATA = msg.data;
      }
      window.addEventListener("message", receiveMessage, false);
    </script>
    */
    if (!enabled) {
      return
    }

    window.getGameData = () => {
      return window.GAMEDATA
    }

    const check = () => {
      if (window.GAMEDATA) {
        clearInterval(interval)
        gameDataReceived(window.GAMEDATA as GameData<TContentType>)
      }
    }
    // cordova iab just sets window.GAMEDATA
    const interval = setInterval(check, 250)

    return () => {
      clearInterval(interval)
    }
  }, [enabled, gameDataReceived])

  if (!enabled) {
    return null
  }

  if (disableBackButton === true) {
    return null
  }

  return (
    <div className="close">
      <CloseIcon onClick={exit} />
    </div>
  )
}

export default PlayerBridge

const exit = () => {
  send({
    type: 'exit'
  })
}

window.setGameData = (gameData: unknown) => {
  send({
    type: 'setGameData',
    data: gameData
  })
}

window.storeGameEvent = (gameEvent: GameEvent) => {
  send({
    type: 'gameEvent',
    data: gameEvent
  })
}
