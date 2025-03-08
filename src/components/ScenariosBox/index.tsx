import { Scenario } from '@/data/Content'
import { useTranslationStore } from '@/stores/translations'

import './styles/scenariosBox.scss'

interface Props {
  scenarios: { [key: string]: Scenario }
  correctScenarios: string[];
  wrongScenarios: string[];
  onComplete: () => void;
}

const ScenarioBox = (props: Props) => {
  const { scenarios, correctScenarios, wrongScenarios } = props
  const { getText } = useTranslationStore()

  const scenariosNames = Object.keys(scenarios)
  const solvedScenarios = [...correctScenarios, ...wrongScenarios]
  const disabled = (correctScenarios.length + wrongScenarios.length) < scenariosNames.length

  return (
    <div className="scenarios-box">
      {`(${solvedScenarios.length}/${scenariosNames.length})`}
      <button className="green button" disabled={disabled} onClick={props.onComplete}>
        {getText('button-next')}
      </button>
    </div>
  )
}

export default ScenarioBox
