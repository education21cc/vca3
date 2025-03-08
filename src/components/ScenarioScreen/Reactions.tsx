import ReactMarkdown from 'react-markdown'
import { ScenarioReaction } from '@/data/Content'
import { useTranslationStore } from '@/stores/translations'

interface Props {
  scenario: string;
  reactions: ScenarioReaction[];
  selected?: string;
  onSelect: (id: string) => void;
}

const Reactions = (props: Props) => {
  const { getTextRaw } = useTranslationStore()
  return (
    <ul>
      {props.reactions.map(r => {
        const handleClick = () => {
          props.onSelect(r.id)
        }
        return (
          <li key={r.id} onClick={handleClick} className={`reaction ${props.selected === r.id ? 'selected': ''}`}>
            <ReactMarkdown>
              {getTextRaw(`reaction-${props.scenario}-${r.id}`)}
            </ReactMarkdown>
          </li>
        )
      })}
    </ul>
  )
}

export default Reactions
