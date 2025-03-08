export interface TiledMapData {
  width: number
  height: number
  tilewidth: number
  tileheight: number
  infinite: boolean
  backgroundcolor?: string
  orientation: Orientation
  renderorder: RenderOrder
  tilesets: TiledTilesetData[]
  layers: TiledLayerData[]
}

export interface TiledTilesetData {
  columns: number
  firstgid: number
  source: string
  image: string
  imagewidth: number
  imageheight: number
  tilewidth: number
  tileheight: number
  tilecount: number
  name: string
  margin: number // todo:
  spacing: number // todo
  tiles?: TileData[]
}

export interface TileData {
  id: number,
  image: string
  type?: string
  properties?: TiledProperty[]
}

export interface TiledLayerData {
  data: number[]
  objects: TiledObjectData[]
  type: TiledLayerType
  height: number
  id: number
  name: string
  opacity: number // not supported atm
  visible: boolean
  x: number
  y: number
  width: number
  properties?: TiledProperty[]
  encoding?: 'base64'
  compression?: '' | 'gzip' | 'zstd'
}

export interface TiledObjectData {
  gid?: number
  id: number
  name: string
  properties?: TiledProperty[]
  polygon?: { x: number, y: number}[]
  type: string
  visible: boolean
  width: number
  height: number
  x: number
  y: number
}

export enum TiledLayerType {
  tilelayer = 'tilelayer',
  objectgroup = 'objectgroup'
}

export interface TiledProperty {
  name: string,
  type: string,
  value: string
}

enum Orientation {
  orthagonal = 'orthagonal',
  isometric = 'isometric',
  staggered = 'staggered',
  hexagonal = 'hexagonal'
}

enum RenderOrder {
  rightUp = 'right-up',
  rightDown = 'right-down',
  leftUp = 'left-up',
  leftDown = 'left-down'
}