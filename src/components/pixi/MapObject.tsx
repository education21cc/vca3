import { useEffect, useMemo, useRef } from 'react'
import {
  TiledObjectData,
  TiledProperty,
  TiledMapData,
  TiledTilesetData,
} from '@/utils/tiledMapData'
import { Sprite, Graphics } from '@inlet/react-pixi'
import { TILE_HEIGHT, TILE_WIDTH } from '@/constants/tiles'
import { findTileset } from '@/utils/tiles'
import { getTileIndex, tileLocationToPosition } from '@/utils/isometric'
import Smoke1 from './effects/smoke1'
import { gsap, Linear } from 'gsap'
import SpriteAnimated from './SpriteAnimated'
import { AnimatedSprite } from 'pixi.js'
import { GameMode } from '@/data/Content'
import { YELLOW_HIGHLIGHT_FILTER } from './filters'

interface Props {
  data: TiledObjectData;
  found?: boolean;
  gameMode: GameMode;
  mapData: TiledMapData;
  tilesetsTextures: { [key: string]: any };
  onClick: (name: string) => void;
}

const popInDuration = 1
const fadeOutDuration = 0.5
const MapObject = (props: Props) => {
  const o = props.data
  const { mapData, tilesetsTextures, found, gameMode, onClick } = props

  const checkRef = useRef(null)
  const ref = useRef<AnimatedSprite>(null)
  const tileset = useRef<TiledTilesetData>()
  const spritesheetTextures = useRef<any>()

  const filters = useMemo(() => {
    const filter = o.properties?.find((p) => p.name === 'filter')?.value
    switch (filter) {
      case 'yellow-highlight':
        return [YELLOW_HIGHLIGHT_FILTER]
      default:
        return null
    }
  }, [o.properties])

  useEffect(() => {
    // Pop in animation!
    if (!checkRef.current) return
    gsap.from(checkRef.current, {
      duration: popInDuration,
      ease: 'elastic.out(2, 0.5)',
      pixi: {
        visible: false,
        scale: 0.1,
      },
    })
    if (gameMode === GameMode.timedFinder) {
      // fade the entire thing out in timedFinder mode
      gsap.to(ref.current, {
        duration: fadeOutDuration,
        ease: Linear.easeNone,
        delay: popInDuration,
        pixi: {
          visible: false,
          alpha: 0,
        },
      })
    }
  }, [found, gameMode])

  useEffect(() => {
    const checkRefEffect = checkRef.current
    const refEffect = ref.current
    return () => {
      gsap.killTweensOf(checkRefEffect)
      gsap.killTweensOf(refEffect)
    }
  }, [])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    let tl: gsap.core.Timeline
    if (!ref.current) return

    const animation = o.properties?.find((p) => p.name === 'animation')
    if (!animation) return

    const type = o.properties?.find((p) => p.name === 'type')?.value
    const delay = parseFloat(
      o.properties?.find((p) => p.name === 'delay')?.value || '0'
    )

    switch (type) {
      case 'move': {
        // Pass a string like "[[0, 22], [5, 22], [5,25], [11, 25], [11, 18]]" with coordinates
        let steps
        try {
          steps = JSON.parse(animation.value)
        } catch (e) {
          throw new Error(
            `Couldn't parse animation steps: "${animation.value}"\n${e}`
          )
        }
        // the spritheet is to show different frames for different angles.
        // it looks for sprites with the given type in the tileset.
        // first frame is southeast, second frame is northeasth
        const animSpritesheet = o.properties?.find(
          (p) => p.name === 'spritesheet'
        )?.value
        tl = gsap.timeline({
          repeat: -1,
          delay,
        })
        for (let i = 1; i < steps.length; i++) {
          const lastStep = steps[i - 1]
          const currentStep = steps[i]
          const distance = Math.sqrt(
            Math.pow(currentStep[0] - lastStep[0], 2) +
              Math.pow(currentStep[1] - lastStep[1], 2)
          )

          ref.current.gotoAndStop(0)
          const position = tileLocationToPosition(
            currentStep,
            mapData.width,
            mapData.height
          )
          const speed = parseFloat(
            o.properties?.find((p) => p.name === 'speed')?.value ?? '0.25'
          )

          tl.to(ref.current, {
            onStart: () => {
              if (animSpritesheet) {
                if (
                  lastStep[0] === currentStep[0] &&
                  lastStep[1] > currentStep[1]
                ) {
                  ref.current!.gotoAndStop(1)
                  ref.current!.scale.set(1, 1)
                } else if (
                  lastStep[0] > currentStep[0] &&
                  lastStep[1] === currentStep[1]
                ) {
                  ref.current!.gotoAndStop(1)
                  ref.current!.scale.set(-1, 1)
                } else if (
                  lastStep[0] === currentStep[0] &&
                  lastStep[1] < currentStep[1]
                ) {
                  ref.current!.gotoAndStop(0)
                  ref.current!.scale.set(-1, 1)
                } else {
                  ref.current!.gotoAndStop(0)
                  ref.current!.scale.set(1, 1)
                }
              }
            },
            onUpdate: () => {
              if (ref.current) {
                ref.current.zIndex = getTileIndex(currentStep, mapData.width)
              }
            },
            duration: speed * distance,
            pixi: {
              x: position.x,
              y: position.y,
            },
            ease: Linear.easeNone,
          })
        }

        break
      }
      case 'flicker': {
        const flash = () => {
          ref.current!.visible = Math.random() < 0.5
          timeout = setTimeout(flash, Math.random() * 250)
        }
        timeout = setTimeout(flash, Math.random() * 250)
        break
      }

      case 'scale': {
        tl = gsap.timeline({
          repeat: -1,
          delay,
        })
        const scale = JSON.parse(animation.value)

        tl.to(ref.current, {
          onStart: () => {
            if (ref.current) {
              // hard coded for now
              ref.current.pivot.y = -32
              ref.current.position.y -= 32
            }
          },
          pixi: {
            scale,
          },
          duration: 1,
          stagger: {
            each: 0.5,
            repeat: -1
          }
        })
      }
    }

    return () => {
      clearTimeout(timeout)
      if (tl) {
        tl.clear()
      }
    }
  }, [mapData, o.properties])

  if (o.polygon) {
    const { x, y } = o
    const location: [number, number] = [x / TILE_HEIGHT, y / TILE_HEIGHT]

    const points = o.polygon.reduce(
      (acc: number[], value: { x: number; y: number }) => {
        acc.push(value.y + value.x)
        acc.push(value.y / 2 - value.x / 2)
        return acc
      },
      []
    )

    return (
      <Graphics
        key={`${o.type}${o.name}`}
        draw={(graphics) => {
          graphics.beginFill(0xbada55)
          graphics.drawPolygon(points)
          graphics.endFill()
        }}
        position={tileLocationToPosition(
          location,
          mapData.width,
          mapData.height
        )}
        pivot={[TILE_WIDTH / 2, TILE_HEIGHT / 2]}
      />
    )
  } else if (o.gid) {
    // todo: DRY
    const { x, y, gid } = o
    const location: [number, number] = [
      x / TILE_HEIGHT - 1,
      y / TILE_HEIGHT - 1,
    ]

    const actualGid = gid & 0x1fffffff
    tileset.current = findTileset(actualGid, mapData!.tilesets)

    if (!tileset || !tileset.current!.tiles || gid === 0) return null

    // See https://discourse.mapeditor.org/t/data-field-in-the-tmx-format-json/3633
    const flipHor = (gid & 0x80000000) !== 0
    const flipVert = (gid & 0x40000000) !== 0
    const scale: [number, number] = [1, 1]
    if (flipHor) {
      scale[0] *= -1
    }
    if (flipVert) {
      scale[1] *= -1
    }
    const texture = tileset.current!.tiles.find(
      (t) => t.id === actualGid - tileset.current!.firstgid
    )
    if (!texture) return null

    // the image is in the format "tiles/structure-wall/tile-structure-wall-gray-left.png"
    // the 'structure-wall' part refers to the spritesheet, the 'tile-structure-wall-gray-left' is the texture on the spritesheet
    const [
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _,
      spritesheet,
      textureName,
    ] = texture.image.split('/')
    if (!tilesetsTextures[spritesheet]) {
      console.warn(
        `Could not find spritesheet ${spritesheet} ${tilesetsTextures}`
      )
    }
    spritesheetTextures.current = tilesetsTextures[spritesheet].textures
    if (!spritesheetTextures.current![textureName]) {
      console.warn(`Could not find texture ${spritesheet} ${textureName}`)
    }

    // the spritheet is to show different frames for different angles.
    // it looks for sprites with the given type in the tileset.
    // first frame is southeast, second frame is northeast
    const animSpritesheet = o.properties?.find(
      (p) => p.name === 'spritesheet'
    )?.value
    let textures
    if (animSpritesheet) {
      const spritesheetTiles = tileset.current?.tiles
        ?.filter((t) => t.type === animSpritesheet)
        .map((td) => td.image)

      textures = spritesheetTiles!.map((image) => {
        const str = image.substr(image.lastIndexOf('/') + 1)
        return tilesetsTextures[spritesheet].textures?.[str]
      })
    } else {
      textures = [spritesheetTextures.current![textureName]]
    }

    return (
      <SpriteAnimated
        name={`${o.name}: ${x},${y} (${textureName})`}
        ref={ref}
        scale={scale}
        textures={textures}
        filters={filters}
        // texture={spritesheetTextures.current![textureName]}
        anchor={[0, 1]}
        pivot={[TILE_WIDTH / 2, 0]}
        position={tileLocationToPosition(
          location,
          mapData.width,
          mapData.height
        )}
        pointerdown={() => onClick(o.name)}
        interactive={!!o.name}
        zIndex={getTileIndex(location, mapData.width)}
      >
        {renderEffects(o.properties)}
        {found && (
          <Sprite
            ref={checkRef}
            image={`${import.meta.env.VITE_PUBLIC_URL}/images/ui/check.svg`}
            scale={0.8}
            anchor={[-0.1, 1]}
            pivot={[TILE_WIDTH / 2, 0]}
            hitArea={null}
          />
        )}
      </SpriteAnimated>
    )
  }
  return null
}

export default MapObject

const renderEffects = (properties?: TiledProperty[]) => {
  if (!properties) return null

  let x = '0'
  let y = '0'
  const offset = properties.find((p) => p.name === 'offset')
  if (offset) {
    [x, y] = offset.value.split(',')
  }

  const effect = properties.find((p) => p.name === 'effect')
  if (effect?.value === 'smoke1') {
    return <Smoke1 x={+x} y={+y} />
  }
  return null
}
