import { useCallback, useEffect, useMemo, useState } from 'react'
import { GameData } from '@/components/playerBridge/GameData'
import { Content, ContentConfig, GameMode } from '@/data/Content'
import { useGameLogic } from '@/hooks/useGameLogic'
import { PixiPlugin } from 'gsap/all'
import { gsap } from 'gsap'
import * as PIXI from 'pixi.js'
import FinderBox from '@/components/FinderBox'
import IFrameModal from '@/components/IFrameModal'
import ScenarioBox from '@/components/ScenariosBox'
import ScenarioScreen from '@/components/ScenarioScreen'
import Loading from '@/components/playerBridge/Loading'
import IntroDialog from '@/components/dialogs/IntroDialog'
import useTilesetsLoader from '@/hooks/useTilesetsLoader'
import { TiledTilesetData, TiledMapData } from '@/utils/tiledMapData'
import { loadResource } from '@/utils/pixiJs'
import CompleteDialogScenarios from '@/components/dialogs/CompleteDialogScenarios'
import Map from '@/components/pixi/Map'
import TimedFinderBox from '@/components/TimedFinderBox'
import { send } from '@/components/playerBridge/utils'
import useGameMode from '@/hooks/useGameMode'
import CompleteDialogTimedFinder from '@/components/dialogs/CompleteDialogTimedFinder'
import { useTimerStore } from '@/stores/timer'
import { GameState, useGameStateStore } from '@/stores/gameState'
import { useContentStore } from '@/stores/content'

interface Props {
  data: GameData<Content>
  onLoadedNewGameData: (data: GameData<Content>) => void // when a game needs to load a new level
}
// @ts-expect-error ts(2741)
window.PIXI = PIXI

PixiPlugin.registerPIXI(PIXI)
gsap.registerPlugin(PixiPlugin)

const Game = (props: Props) => {
  const { data, onLoadedNewGameData } = props
  const [mapData, setMapData] = useState<TiledMapData>()

  const [scenario, setScenario] = useState<string|undefined>()
  const [foundSituations, setFoundSituations] = useState<string[]>([])
  const [scenarioReactions, setScenarioReactions] = useState<{[key: string]: string}>({}) // key = scenario, value = reaction id
  const [iframeOpen, setIframeOpen] = useState(false)
  const { content } = useContentStore()
  useGameLogic(content, foundSituations)
  const gameMode = useGameMode(content)
  const { state, setState } = useGameStateStore()

  const handleBack = useCallback(() => {
    setIframeOpen(false)
  }, [])
  const levelsCompleted = useMemo(() => data?.levelsCompleted, [data])

  const {
    loadComplete,
    loadTilesets,
    tilesetsTextures
  } = useTilesetsLoader(determineTilesetSpritesheetPath)

  useEffect(() => {
    if (!content) return
    // Content loaded, load map json
    const jsonPath = content.mapJson
    loadResource(`${import.meta.env.VITE_PUBLIC_URL}/${jsonPath}`, (resource) => {
      setMapData(resource.data)
    })
  }, [content])

  useEffect(() => {
    if (!mapData) return
    loadTilesets(mapData.tilesets)
  }, [loadTilesets, mapData])

  const iframe = useMemo(() => {
    if (!levelsCompleted) return
    if (!content.finder?.final) return

    // Copy the levelsCompleted of VCA game into minigame
    const final: ContentConfig = {
      ...content.finder?.final,
      data: {
        ...content.finder.final.data,
        levelsCompleted
      }
    }
    return final
  }, [content, levelsCompleted])

  const handleOpenGame = () => {
    setIframeOpen(true)
  }

  const handleSetGameData = useCallback((data: GameData<Content>) => {
    window.setGameData(data)
  }, [])


  const handleComplete = () => {
    setState(GameState.complete)

    handleSetGameData({
      ...data!,
      levelsCompleted: [{
        level: 1,
        score: correctScenarios.length,
        maxScore: correctScenarios.length
      }]
    })
  }

  const handleStart = useCallback(() => {
    if (content.instructions) {
      setState(GameState.instructions)
    } else {
      setState(GameState.normal)
    }
  }, [content.instructions, setState])

  const handleSituationClick = (situation: string) => {
    if (!content.finder) return
    if (state !== GameState.normal) return

    if (content.finder.situations.indexOf(situation) > -1 && foundSituations.indexOf(situation) === -1){
      setFoundSituations([...foundSituations, situation])
    }
  }

  const handleScenarioClick = (scenario: string) => {
    setScenario(scenario)
  }

  const handleCorrectReaction = (reaction: string) => {
    // gets called from within modal once the correct answer is selected

    setScenarioReactions({
      ...scenarioReactions,
      [scenario!]: reaction
    })
  }

  const handleWrongScenario = (reaction: string) => {
    // gets called from within modal once the correct answer is selected

    if(content.mistakeMode) {
      setScenarioReactions({
        ...scenarioReactions,
        [scenario!]: reaction
      })
    }
  }

  const exitScenario = () => {
    setScenario(undefined)
  }

  const handleExit = () => {
    send({
      type: 'exit'
    })
  }

  const handleReset = () => {
    setState(GameState.normal)
    setScenarioReactions({})
    setFoundSituations([])
    useTimerStore.setState({ timePassed: 0})
  }

  const handleLoadedNewGameData = (data: GameData<Content>) => {
    onLoadedNewGameData(data)
    handleReset()
    setState(GameState.intro)

  }

  const { correctScenarios, wrongScenarios } = useMemo(() => {
    // make maps of correct and wrong answers
    return Object.keys(scenarioReactions || {}).reduce<{ correctScenarios: string[], wrongScenarios: string[]}>((acc, value) => {
      const scenario = content.scenarios[value]
      if (scenario) {
        const isCorrect = !!scenario.reactions.find(r => r.id === scenarioReactions[value])?.correct
        if (isCorrect) {
          acc.correctScenarios.push(value)
        } else {
          acc.wrongScenarios.push(value)
        }
      }
      return acc
    }, {
      correctScenarios: [],
      wrongScenarios: []
    })
  }, [content.scenarios, scenarioReactions])

  const showMap = state === GameState.instructions || state === GameState.normal || state === GameState.preComplete
  return (
    <>
      {(!loadComplete) && (
        <Loading />
      )}
      {loadComplete && (
        <>
          {(state === GameState.intro) &&
            (<IntroDialog
              gameData={data}
              onStart={handleStart}
            />)}
          {(showMap) && mapData && gameMode && (
            <>
              <Map
                mapData={mapData}
                gameMode={gameMode}
                tilesetsTextures={tilesetsTextures}
                onSituationClick={handleSituationClick}
                foundSituations={foundSituations}
                mistakeMode={content.mistakeMode ?? false}
                correctScenarios={correctScenarios}
                wrongScenarios={wrongScenarios}
                onScenarioClick={handleScenarioClick}
              />
              {gameMode === GameMode.finder && content.finder && (
                <FinderBox
                  foundSituations={foundSituations}
                  onOpenGame={handleOpenGame}
                />
              )}
              { state === GameState.normal && gameMode === GameMode.timedFinder && content.finder && (
                <TimedFinderBox
                  foundSituations={foundSituations}
                />
              )}
              {gameMode === GameMode.scenarios && content.scenarios && (
                <ScenarioBox
                  scenarios={content.scenarios}
                  correctScenarios={correctScenarios}
                  wrongScenarios={wrongScenarios}
                  onComplete={handleComplete}
                />
              )}
            </>
          )}
          {iframe && (
            <IFrameModal
              content={iframe}
              open={iframeOpen}
              onBack={handleBack}
              onSetGameData={handleSetGameData}
            />
          )}
          {scenario && (
            <ScenarioScreen
              scenario={scenario}
              content={content.scenarios[scenario]}
              selectedReaction={scenarioReactions[scenario]}
              onCorrectReaction={handleCorrectReaction}
              onWrongReaction={handleWrongScenario}
              onBack={exitScenario}
            />
          )}
          {(state === GameState.complete) && (
            <>
              {((gameMode === GameMode.scenarios &&
                  (<CompleteDialogScenarios
                    onTryAgain={handleReset}
                    onExit={handleExit}
                    total={Object.keys(content.scenarios!).length || 0}
                    mistakes={wrongScenarios.length}
                  />)
              ))}
              {((gameMode === GameMode.timedFinder && content.finder &&
                  (<CompleteDialogTimedFinder
                    foundSituations={foundSituations}
                    onTryAgain={handleReset}
                    onExit={handleExit}
                    onLoadedNewGameData={handleLoadedNewGameData}
                  />)
              ))}
            </>
          // ((gameMode === GameMode.scenarios &&
          //   (<CompleteDialog
          //     onTryAgain={handleReset}
          //     onExit={handleExit}
          //     total={Object.keys(content?.scenarios!).length || 0}
          //     mistakes={wrongScenarios.length}
          //   />)
          // )
          )}
        </>
      )}
    </>
  )
}

export default Game

// returns the path to the spritesheet for given tileset
const determineTilesetSpritesheetPath = (tilesetData: TiledTilesetData) => `${import.meta.env.VITE_PUBLIC_URL}/maps/tilesets/${tilesetData.name}.json`
