import { Viewport } from 'pixi-viewport'
import { useCallback, useEffect } from 'react'
import { useContentStore } from '@/stores/content'
import { GameState, useGameStateStore } from '@/stores/gameState'
import { tileLocationToPosition } from '@/utils/isometric'
import DashedLine from './DashedLine'

export type Props = {
  verticalTiles: number;
  horizontalTiles: number;
  viewport: Viewport
  mapWidth: number;
  mapHeight: number;
}

const ShowFinderPath = (props: Props) => {
  const { verticalTiles, horizontalTiles, mapWidth, mapHeight, viewport } = props
  const { content } = useContentStore()
  const path = content.finder?.path ?? []
  const { setState } = useGameStateStore()

  const convert = useCallback((location: [number, number]) => {
    const point = tileLocationToPosition(location, horizontalTiles, verticalTiles)
    point.set(point.x, point.y - 32)
    return point
  }, [horizontalTiles, verticalTiles])

  useEffect(() => {
    viewport.animate({
      time: 1000,
      position: {
        x: mapWidth / 2,
        y: mapHeight / 2
      },
      scale: 0.25
    })
  }, [mapHeight, mapWidth, viewport])
  const positions = path.map(l => convert(l as [number, number]))
  const valid = false

  useEffect(() => {
    const interval = setTimeout(() => {
      setState(GameState.complete)
    }, 2000)
    return () => {
      clearInterval(interval)
    }
  }, [setState])

  return (
    <DashedLine
      points={positions}
      dash={36}
      gap={54}
      speed={20}
      rotation={0}
      style={{
        width: 22,
        color: valid ? 0xffffff : 0x8b0000,
        alpha: 1,
      }}
    />
  )
}

export default ShowFinderPath
