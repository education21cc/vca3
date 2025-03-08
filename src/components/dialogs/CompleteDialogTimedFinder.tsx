import { useEffect, useMemo, useState } from 'react'
import BaseDialog from './BaseDialog'
import StarEmpty from '@/common/images/star-empty.svg?react'
import StarFull from '@/common/images/star-full.svg?react'
import { useTranslationStore } from '@/stores/translations'
import { useTimerStore } from '@/stores/timer'
import { useContentStore } from '@/stores/content'
import { CompleteButtonsConfig, CompleteConfig, Content } from '@/data/Content'
import { GameData } from '@/components/playerBridge/GameData'

import './styles/completeDialogScenarios.scss'

interface Props {
  foundSituations: string[];
  onTryAgain: () => void;
  onExit: () => void;
  onLoadedNewGameData: (data: GameData<Content>) => void // when a game needs to load a new level
}
const DEFAULT_TIME = 120
const DEFAULT_COMPLETE_CONFIG: CompleteConfig = {
  buttons: [{
    text: 'complete-try-again',
    action: 'again',
    color: 'green'
  }, {
    text: 'complete-exit',
    action: 'exit',
    color: 'red'
  }]
}

const CompleteDialogTimedFinder = (props: Props) => {
  const { foundSituations, onTryAgain, onExit, onLoadedNewGameData } = props
  const { getText } = useTranslationStore()
  const totalStars = 4
  const [animationScore, setAnimationScore] = useState(0)
  const { timePassed } = useTimerStore()
  const { content } = useContentStore()
  const finderContent = content?.finder ?? {
    situations: [],
    final: {},
    time: DEFAULT_TIME,
    complete: DEFAULT_COMPLETE_CONFIG
  }
  const { time = DEFAULT_TIME } = finderContent ?? { time: DEFAULT_TIME }
  const buttonConfig = finderContent.complete?.buttons ?? DEFAULT_COMPLETE_CONFIG.buttons

  const score = useMemo(() => {
    if (foundSituations.length === 0) return 0
    if (foundSituations.length < finderContent.situations.length) return 1
    if ((time - timePassed) / time < .5) return 2
    if ((time - timePassed) / time < .8) return 3
    return 4
  }, [finderContent.situations.length, foundSituations.length, time, timePassed])

  useEffect(() => {
    if (window.setLevelScore) window.setLevelScore(1, score, totalStars)
  }, [score, totalStars])

  const renderStars = () => {
    const result = []
    for (let i = 0; i < totalStars; i++) {
      result.push(
        <div key={`star${i}`}>
          <StarEmpty />
          {i < animationScore && (<StarFull className="full"/>)}
        </div>
      )
    }
    return result
  }

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const update = () => {
      setAnimationScore(animationScore + 1)
    }
    if (animationScore < score) {
      timeout = setTimeout(update, 750)
    }

    return () => clearTimeout(timeout)
  }, [animationScore, score])

  const handleButtonClick = (config: CompleteButtonsConfig) => {
    const { action } = config
    switch (action) {
      case 'again': {
        onTryAgain()
        break
      }
      case 'exit': {
        onExit()
        break
      }
      case 'loadPage': {

        location.href = buttonConfig.find(bc => bc.action === action)?.actionArgs as string
        break
      }
      case 'loadConfig': {
        let url = buttonConfig.find(bc => bc.action === action)?.actionArgs as string
        if (!url.startsWith('http')) {
          url = import.meta.env.VITE_PUBLIC_URL + '/' + url
        }
        fetch(url)
          .then((response) => {
            response.json().then((data) => {
              onLoadedNewGameData(data)
            })
          })
        break
      }
    }
  }

  const buttonEnabled = (config: CompleteButtonsConfig) => {
    if (!config.condition) return true
    switch (config.condition.type) {
      case 'starsMinimum':
        return score >= (config.condition.args as number)
    }
  }

  const headerKey = (time - timePassed) <= 0 ? 'timeup-header' : 'complete-header'

  return (
    <BaseDialog className="complete-dialog">
      <div className="block">
        <h1>{getText(headerKey)}</h1>
      </div>
      { score === 0 ? (
        <div className={'block score timed}'}>
          {getText('score-list-0')}
        </div>
      ) : (
        <div className={`block score timed ${animationScore === score ? 'fade-out' : ''}`}>
          {/* {renderScoreList()} */}
          {animationScore > 0 && getText(`score-list-${animationScore}`)}
        </div>
      )}

      <div className="block stars">
        {renderStars()}
      </div>
      <div className="bottom">
        { buttonConfig.map(bc => (
          <button key={bc.text} disabled={!buttonEnabled(bc)} className={`button ${bc.color ?? 'red'}`} onClick={() => handleButtonClick(bc)}>
            {buttonEnabled(bc) ? getText(bc.text) : getText(bc.condition!.text)}
          </button>
        ))}
      </div>
    </BaseDialog>
  )
}

export default CompleteDialogTimedFinder
