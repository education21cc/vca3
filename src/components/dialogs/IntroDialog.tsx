import { useMemo } from 'react'
import BaseDialog from './BaseDialog'
import StarEmpty from './../../common/images/star-empty.svg?react'
import { useTranslationStore } from '@/stores/translations'
import { Content } from '@/data/Content'
import { GameData } from '@/components/playerBridge/GameData'

import './styles/introDialog.scss'

interface Props {
  gameData: GameData<Content>;
  onStart: () => void;
}

const IntroDialog = (props: Props) => {
  const { getText, getTextRaw } = useTranslationStore()
  const { gameData } = props
  const { levelsCompleted, content } = gameData

  const starsToGainText = useMemo<string>(() => {
    const currentScore = levelsCompleted?.[0]?.score || 0
    // const maxScore = content?.finder?.situations.length || 0;
    const maxScore = content?.stars || content?.finder?.situations.length || Object.keys(content?.scenarios || {}).length || 1
    const starsToGain = getTextRaw('intro-stars-to-gain')
    return ('' + starsToGain)
      .replace('{0}', ''+currentScore)
      .replace('{1}', ''+maxScore)
  }, [content?.finder?.situations.length, content?.scenarios, content?.stars, getTextRaw, levelsCompleted])

  return (
    <BaseDialog className="intro-dialog">
      <div className="top">
        <h1>{getText('intro-header')}</h1>
      </div>
      <div className="center">
        <section>{getText('intro-description')}</section>
      </div>
      <div className="bottom">
        <StarEmpty className="star"/>
        <span className="stars-to-gain">
          {starsToGainText}
        </span>
        <button className="green button start" onClick={props.onStart}>
          {getText('intro-start')}
        </button>
      </div>
    </BaseDialog>
  )
}

export default IntroDialog
