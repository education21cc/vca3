import { PixiComponent } from '@inlet/react-pixi'
import * as PIXI  from 'pixi.js'
import { TiledTilesetData, TiledLayerData } from '@/utils/tiledMapData'
import { CompositeRectTileLayer } from '@pixi/tilemap'

interface Props  {
  texture: PIXI.Texture;
  horizontalTiles: number;
  layer: TiledLayerData;
  tileset: TiledTilesetData;
  spritesheet: PIXI.Spritesheet;
};

const IsoTiledLayer = PixiComponent<Props, CompositeRectTileLayer>('IsoTiledLayer', {
  create(props: Props) {
    // @ts-expect-error ts(2554)
    const tileLayer = new CompositeRectTileLayer(0, [props.texture])
    return tileLayer
  },

  applyProps(instance, _oldProps: Props, props: Props) {
    const {layer, tileset, horizontalTiles,spritesheet} = props
    if (!layer.data) {
      return
    }
    for (let i = 0; i < layer.data.length; i++) {
      const w = tileset.tilewidth
      const h = tileset.tileheight
      const x = (i % horizontalTiles) * w
      const y = Math.floor(i / horizontalTiles) * h

      if (layer.data[i] > 0) {
        const spriteId = `${tileset.name}-${layer.data[i]}`
        instance.addFrame(spritesheet.textures[spriteId], x, y)
      }
    }
  }
})

export default IsoTiledLayer
