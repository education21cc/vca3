import { TiledTilesetData } from './tiledMapData'

// finds tileset based on gid
export const findTileset = (gid: number, tilesets: TiledTilesetData[]) => {
  let tileset
  for (let i = tilesets.length - 1; i >= 0; i--) {
    tileset = tilesets[i]
    if (tileset.firstgid <= gid) {
      break
    }
  }
  return tileset
}
