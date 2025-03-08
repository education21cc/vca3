import { Instruction } from '@/data/Content'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Viewport as PixiViewport } from 'pixi-viewport'
import { Point } from 'pixi.js'
import { GameState, useGameStateStore } from '@/stores/gameState'
import { useTranslationStore } from '@/stores/translations'
import './styles/instructionsBox.scss'

type Props = {
  instructions: Instruction[];
  viewport: PixiViewport | null;
  time: number
}

const InstructionsBox = (props: Props) => {
  const { instructions, viewport, time } = props
  const [step, setStep] = useState<number>(0)
  const { getTextRaw } = useTranslationStore()
  const { setState } = useGameStateStore()
  const ref = useRef<HTMLDivElement>(null)

  const timeString = useMemo(() => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60

    if (minutes === 0) {
      return `${seconds} ${getTextRaw('time-component-seconds')}`
    }
    if (minutes === 1) {
      if (seconds === 0) {
        return `1 ${getTextRaw('time-component-minute')}`
      }
      return `1 ${getTextRaw('time-component-minute')}, ${seconds} ${getTextRaw('time-component-seconds')}`
    }
    return `${minutes} ${getTextRaw('time-component-minutes')}, ${seconds} ${getTextRaw('time-component-seconds')}`
  }, [getTextRaw, time])

  useEffect(() => {
    const nextStep = () => {
      if (ref.current) {
        ref.current.style.opacity = '0'
      }
      if (step < instructions.length - 1) {
        setStep(step + 1)
      } else {
        setState(GameState.normal)
      }
    }
    const info = instructions?.[step]
    if (!info) {
      return
    }
    setTimeout(() => {
      if (ref.current) {
        ref.current.style.opacity = '1'
        ref.current.innerHTML = instructions[step]?.text
          .replace('{time}', timeString)
          .replace(/\n/g, '<br>')
      }

      viewport?.animate({
        time: info.time,
        position: new Point(info.x, info.y),
        scale: info.zoom,
        callbackOnComplete: nextStep
      })
    }, info.delay ?? 0)
  }, [instructions, setState, step, timeString, viewport])

  useEffect(() => {
    setStep(0)
  }, [viewport])

  return (
    <div className="instructions-box" ref={ref} style={{ opacity: 0}} />
  )
}

export default InstructionsBox
