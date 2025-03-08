
export interface SpritesheetData {
  frames: {
    [name: string]: SpriteData
  }
  meta: {
    image: string
    size: Size
    scale: number
  }
}

export interface SpriteData {
  frame: Frame,
  rotated?: boolean,
  trimmed?: boolean
  spriteSourceSize?: Frame
  sourceSize?: Size
}

interface Position {
  x: number, y: number
}
interface Size {
  w: number
  h: number
}
type Frame = Size & Position
