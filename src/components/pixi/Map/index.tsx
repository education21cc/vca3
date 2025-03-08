import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Stage, Sprite, Container } from '@inlet/react-pixi'
import {
  TiledMapData,
  TiledLayerData,
  TiledLayerType,
  TiledObjectData,
} from '@/utils/tiledMapData'
import * as PIXI from 'pixi.js'
import sound from 'pixi-sound'
import Viewport from '../Viewport'
import { Viewport as PixiViewport } from 'pixi-viewport'
import { TILE_HEIGHT, TILE_WIDTH, MARGIN_TOP} from '@/constants/tiles'
import { tileLocationToPosition } from '@/utils/isometric'
import FloorTileLayer from '@/components/pixi/FloorTileLayer'
import Marker, { Color } from '@/components/pixi/Marker'
import { GameMode, Scenario } from '@/data/Content'
import { findTileset } from '@/utils/tiles'
import MapObject from '../MapObject'
import { GameState, useGameStateStore } from '@/stores/gameState'
import { useContentStore } from '@/stores/content'
import ShowFinderPath from '../ShowFinderPath'
import InstructionsBox from '@/components/InstructionsBox'
import { YELLOW_HIGHLIGHT_FILTER } from '../filters'
import PixiDevToolsConnector from '../PixiDevToolsConnector'

interface Props {
  mapData: TiledMapData;
  gameMode: GameMode;
  tilesetsTextures: {[key: string]: any};
  foundSituations: string[];
  onSituationClick: (situation: string) => void;
  mistakeMode: boolean;
  correctScenarios: string[];
  wrongScenarios: string[];
  onScenarioClick: (scenario: string) => void;
}

declare global {
  interface Window {
    __PIXI_INSPECTOR_GLOBAL_HOOK__: {
      register: (conf: { PIXI: unknown }) => void
    }
  }
}

// This stuff is needed for the pixi-js browser plugin
if (import.meta.env.DEV) {
  window.__PIXI_INSPECTOR_GLOBAL_HOOK__?.register({ PIXI: window.PIXI })
}

const Map = (props: Props) => {
  const {
    mistakeMode,
    foundSituations,
    mapData,
    tilesetsTextures,
    gameMode,
    onSituationClick
  } = props

  const [screenWidth, setScreenWidth] = useState(window.innerWidth)
  const [screenHeight, setScreenHeight] = useState(window.innerHeight)
  const { content } = useContentStore()
  const { state } = useGameStateStore()
  const [instructionsShown, setInstructionsShown] = useState(false)

  // PIXI.settings.ROUND_PIXELS = false;

  // https://stackoverflow.com/questions/4615116/how-to-calculate-the-height-and-width-of-an-isometric-rectangle-square
  const mapWidth = ((mapData?.width || 1) + (mapData?.height || 1)) * (TILE_WIDTH / 2)
  const mapHeight = ((mapData?.width || 1) + (mapData?.height || 1)) * (TILE_HEIGHT / 2) + MARGIN_TOP

  const viewportRef = useRef<PixiViewport>(null)

  useEffect(() => {
    // focus on center of the map
    if (viewportRef.current) {
      const viewport = viewportRef.current
      viewport.moveCenter(mapWidth / 2, mapHeight / 2)
    }
  }, [mapData, mapHeight, mapWidth, tilesetsTextures])

  useEffect(() => {
    if (!content?.finder) {
      // Only plop in scenario mode
      sound.add('plops', {
        url: `${import.meta.env.VITE_PUBLIC_URL}/sound/plops.mp3`,
        autoPlay: true,
      })
    }
  }, [content?.finder])

  useEffect(() => {
    const resize = () => {
      setScreenWidth(window.innerWidth)
      setScreenHeight(window.innerHeight)
    }
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', resize)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', resize)
    }
  }, [])


  const renderFloor = (layer?: TiledLayerData) => {
    if (!layer) {
      console.warn('No layer with name \'floor\' found!')
      return null
    }
    const data = getTiles(layer)
    const firstTileGid = data.find(Boolean)
    if (!firstTileGid) {
      console.warn('Layer with name \'floor\' is empty?')
      return null
    }
    const actualGid = firstTileGid & 0x1FFFFFFF
    const tileset = findTileset(actualGid, mapData!.tilesets)
    if (!tileset) {
      console.warn('No tileset found for floor layer. Huh?')
      return null
    }
    const resource = tilesetsTextures[tileset.name]
    PIXI.utils.clearTextureCache()

    if (!resource.spritesheet) {
      console.warn(`No texture loaded found for floor layer. Was looking for ${tileset.name}`)
      return null
    }
    return (
      <FloorTileLayer
        texture={(resource.spritesheet as any)._texture}
        verticalTiles={mapData.height}
        horizontalTiles={mapData.width}
        layer={layer}
        tileset={tileset}
        spritesheet={resource.spritesheet}
      />
    )
  }

  useEffect(() => {
    const tween = gsap.to(YELLOW_HIGHLIGHT_FILTER, {
      duration: .6,
      thickness: 2,
      yoyo: true,
      repeat: -1,
    })
    return () => {
      tween.pause(0)
      tween.kill()
    }
  }, [])


  const renderLayers = (layers: TiledLayerData[]) => {
    return layers.filter(l => l.visible && l.name !== 'floor' && l.type === TiledLayerType.tilelayer)
      .map((layer: TiledLayerData, index: number) => {
        const data = getTiles(layer)
        return renderLayerTiles(data, layer, index)
      })
  }

  const renderLayerTiles = (tileData: number[], layer: TiledLayerData, layerIndex: number) => {
    return tileData.map((gid, i) => {
      const actualGid = gid & 0x1FFFFFFF
      const tileset = findTileset(actualGid, mapData!.tilesets)
      if (!tileset || !tileset.tiles || gid === 0) return null

      const columns = mapData!.width
      const x = (i % columns)
      const y = Math.floor(i / columns)
      // See https://discourse.mapeditor.org/t/data-field-in-the-tmx-format-json/3633
      const flipHor = (gid & 0x80000000) !== 0
      const flipVert = (gid & 0x40000000) !== 0
      // const flipDiag = (gid & 0x20000000) !== 0;
      const scale: [number, number] = [1, 1]
      if (flipHor) {
        scale[0] *= -1
      }
      if (flipVert) {
        scale[1] *= -1
      }
      const texture = tileset.tiles.find((t) => t.id === actualGid - tileset.firstgid)
      if (!texture) return null

      // the image is in the format "tiles/structure-wall/tile-structure-wall-gray-left.png"
      // the 'structure-wall' part refers to the spritesheet, the 'tile-structure-wall-gray-left' is the texture on the spriesheet
      const [
        ,
        spritesheet,
        textureName
      ] = texture.image.split('/')
      if (!tilesetsTextures[spritesheet]) {
        console.warn(`Could not find spritesheet ${textureName} ${spritesheet} ${tilesetsTextures}`)
      };
      if (!tilesetsTextures[spritesheet].textures![textureName]) {
        console.warn(`Could not find texture ${spritesheet} ${textureName}`)
      }

      return (
        <Sprite
          key={i}
          name={`${layer.name}: ${x},${y} (${textureName})`}
          scale={scale}
          texture={tilesetsTextures[spritesheet].textures![textureName]}
          anchor={[0, 1]}
          pivot={[TILE_WIDTH / 2, 0]}
          position={tileLocationToPosition([x, y], mapData.width, mapData.height)}
          zIndex={i * 100 + layerIndex}
        />
      )
    })
  }

  const renderObjectLayers = (layers: TiledLayerData[]) => {

    return layers.filter(l => l.visible && l.type === TiledLayerType.objectgroup)
      .map((layer: TiledLayerData) => {
        return renderObjects(layer.objects)
      })
  }

  const renderObjects = (objects: TiledObjectData[]) => {
    return objects.filter(o => o.visible).map((o, index) => {
      const found = foundSituations.indexOf(o.name) > -1

      return (
        <MapObject
          data={o}
          key={`${o.type}${o.name}${index}`}
          found={found}
          gameMode={gameMode}
          tilesetsTextures={tilesetsTextures}
          mapData={mapData}
          onClick={onSituationClick}
        />
      )
    })
  }

  const handleMarkerClick = (name: string) => {
    props.onScenarioClick(name)
  }

  const renderScenarioMarker = (name: string, scenario: Scenario, index: number) => {

    const delay = index * 0.25
    const position = tileLocationToPosition(scenario.location as [number, number], mapData.width, mapData.height)
    const correct = props.correctScenarios.indexOf(name) > -1
    const wrong = props.wrongScenarios.indexOf(name) > -1
    let color: Color = 'red'
    if (correct) {
      color = 'green'
    }
    else if (mistakeMode && !wrong) {
      color = 'yellow'
    }
    return (
      <Marker
        position={position}
        pointertap={() => handleMarkerClick(name)}
        delay={delay}
        bounce={!correct && !wrong}
        color={color}
        key={name}
        name={name}
        scale={1.5}
      />
    )
  }

  const options = {
    sharedLoader: true,
    backgroundColor: parseBackgroundColor(mapData?.backgroundcolor)
  }

  useEffect(() => {
    // Ensure viewport ref is ready
    setInstructionsShown(state === GameState.instructions)
  }, [state])

  return (
    <>
      {instructionsShown && content.instructions && (
        <InstructionsBox
          instructions={content.instructions}
          time={content?.finder?.time ?? 0}
          viewport={viewportRef.current}
        />
      )}

      <Stage width={screenWidth} height={screenHeight} className="background" options={options}>
        <PixiDevToolsConnector />
        <Viewport
          worldWidth={mapWidth}
          worldHeight={mapHeight}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          ref={viewportRef}
        >
          {renderFloor(mapData.layers.find(l => l.name === 'floor'))}
          {/* <Graphics
              name="selectioncircle"
              draw={graphics => {
                  const line = 3;
                  graphics.lineStyle(line, 0xFFFFFF);
                  graphics.drawCircle(0, 0, 5);
                  graphics.endFill();
                }}
                position={tileLocationToPosition([0, 0], mapData.width, mapData.height)}
              /> */}
          <Container sortableChildren={true}>
            {renderLayers(mapData.layers)}
          </Container>
          <Container sortableChildren={true}>
            {renderObjectLayers(mapData.layers)}
          </Container>
          {Object.entries(content?.scenarios || []).map(([key, value], index) => renderScenarioMarker(key, value, index))}
          { viewportRef.current && state === GameState.preComplete && (
            <ShowFinderPath
              viewport={viewportRef.current}
              mapWidth={mapWidth}
              mapHeight={mapHeight}
              verticalTiles={mapData.height}
              horizontalTiles={mapData.width}
            />
          )}
        </Viewport>
      </Stage>
    </>
  )
}

export default Map


const parseBackgroundColor = (asString: string | undefined) : number | undefined => {
  if (!asString) {
    return
  }
  return parseInt(asString.substring(1), 16) // strip the hash, conver to int
}

const getTiles = (layer: TiledLayerData): number[] => {

  const rawData = layer.data

  if (typeof(rawData) !== 'string') {
    // return new Uint8Array(rawData);
    return rawData
  }

  // ==================================
  // == If applicable, decode Base64 ==
  // ==================================
  if(layer.encoding === 'base64') {
    // data = base64.decode(rawData);
    // data = base64.decode("dGVzdA==");
  }

  // ============================================
  // == If applicable, extract compressed data ==
  // ============================================
  if(layer.compression === 'gzip') {
    //    data = zlib.gunzipSync(data);
  }

  // ====================================
  // == Read buffer data every 4 bytes ==
  // ====================================

  // Each 32-bit integer is placed in an 8-bit integer array.
  // There will never be a tile ID greater than 255, so only 1 byte is required.
  // let array = new Uint8Array(layer.width * layer.height);
  // for(let i=0, index=0; i<data.length; i += 4, index++) {
  //     array[index] = data.readUInt32LE(i);
  //     index++;
  // }
  // return array;
  return []
}
