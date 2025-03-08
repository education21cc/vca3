import { useState, useEffect, useCallback } from 'react'
import { GameData } from '@/components/playerBridge/GameData'
import { Content } from '@/data/Content'
import { useTranslationStore } from '@/stores/translations'
import PlayerBridge from '@/components/playerBridge'
import { useContentStore } from '@/stores/content'
import Game from './Game'

import './styles/common.scss'
import './App.css'

function App() {
  const [data, setData] = useState<GameData<Content>>()
  const { loaded, setContent } = useContentStore()
  const [ backButtonDisabled, setBackButtonDisabled ] = useState(false)

  const handleGameDataReceived = useCallback((data: GameData<Content>) => {
    setBackButtonDisabled(data.content.disableBackButton === true)

    // PIXI.settings.SCALE_MODE = SCALE_MODES.NEAREST; // prevent lines on the edges of tiles
    setData(data)
    const { content } = data
    setContent(content)

    if (data.translations){
      const t = data.translations.reduce<{[key: string]: string}>((acc, translation) => {
        acc[translation.key] = translation.value
        return acc
      }, {})
      useTranslationStore.setState({ texts: t })
    }
  }, [setContent])


  useEffect(() => {
    // See if we are fed gamedata by 21ccplayer app, if not, go fetch it ourselves
    if (import.meta.env.DEV) {
      if(!window.GAMEDATA) {
        console.log('no bridge found, fetching fallback')
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/data-handling.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/data-plan-your-lift-1.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/data-plan-your-lift-2.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/data-plan-your-lift-3.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/data-fireextinguishers.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/data-emergencyexits.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/data-aeds.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/data-dangeroussituations.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-basic-english-EN.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-basic-math-EN.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-basic-math-BN.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1_HI.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1_EN.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1_EN-US.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1_CH.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1_MS.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1_MR.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1_KN.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1_TM.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1-microsoft_EN.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-1-microsoft_HI.json`)
        fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-2.json`)
        // fetch(`${import.meta.env.VITE_PUBLIC_URL}/config/scenarios-3.json`)
          .then((response) => {
            response.json().then((data) => {

              handleGameDataReceived(data)
            })
          })
      }
    }
  }, [handleGameDataReceived])
  return (
    <div className="background" >
      <PlayerBridge<Content>
        enabled={import.meta.env.PROD}
        gameDataReceived={handleGameDataReceived}
        disableBackButton={backButtonDisabled}
        // disableBackButton={!!iframeOpen || !!scenario}
      />
      {loaded && data && (
        <Game data={data} onLoadedNewGameData={handleGameDataReceived} />
      )}
    </div>
  )
}

export default App
