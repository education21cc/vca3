import { useTranslationStore } from '@/stores/translations'
import { useContentStore } from '@/stores/content'
import './styles/finderBox.scss'

interface Props {
  foundSituations: string[];
  onOpenGame: () => void;
}

const FinderBox = (props: Props) => {
  const { getText } = useTranslationStore()
  const { content } = useContentStore()
  const { foundSituations, onOpenGame } = props

  if (!content?.finder) return null
  const finderContent = content?.finder
  const disabled = foundSituations.length < finderContent.situations.length

  return (
    <div className="finder-box">
      {getText('finder-instruction')}
      {`(${foundSituations.length}/${content.finder.situations.length})`}
      <button className="green button" disabled={disabled} onClick={onOpenGame}>
        {getText('button-next')}
      </button>
    </div>
  )
}

export default FinderBox
