import { PropsWithChildren } from 'react'
import './styles/progressBar.scss'

interface Props {
  value: number; // between 0 and 1
}

const ProgressBar = (props: PropsWithChildren<Props>) => {
  const { value, children } = props
  return (
    <div className="progressBar">
      <div className="bar" style={{ width: `${value * 100}%` }} />
      <div className="value">
        {children}
      </div>
    </div>
  )
}
export default ProgressBar
