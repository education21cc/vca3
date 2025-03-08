import { PropsWithChildren } from 'react'
import './styles/baseDialog.scss'

interface Props {
  className: string;
}

const BaseDialog = (props: PropsWithChildren<Props>) => {
  return (
    <div className={`basedialog ${props.className}`}>
      {props.children}
    </div>
  )
}

export default BaseDialog