import { TILE_WIDTH, TILE_HEIGHT, MARGIN_TOP } from '@/constants/tiles'
import { Point } from 'pixi.js'

export const tileLocationToPosition = (location: [number, number], horizontalTiles: number, verticalTiles: number) => {
  const x = getOriginX(horizontalTiles, verticalTiles) + (TILE_WIDTH / 2) * location[0] + (TILE_WIDTH / 2) * -location[1]
  const y = (location[0] + location[1]) * TILE_HEIGHT / 2 + (TILE_HEIGHT) + MARGIN_TOP
  return new Point(x, y)
}

/** x coordinate (pixel space) of the top of the tile with location [0, 0] */
export const getOriginX = (horizontalTiles: number, verticalTiles: number) => {
  return (verticalTiles - horizontalTiles) * (TILE_HEIGHT / 2) + ((verticalTiles + horizontalTiles) * TILE_WIDTH / 2) / 2
}

/** returns the tile index if the tiles were numbered going right-down */
export const getTileIndex = (location: [number, number], horizontalTiles: number) => {
  return  horizontalTiles * location[1] + location[0]
}
