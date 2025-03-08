import { ComponentProps, useEffect, useState } from 'react'
import { Sprite, Container, Stage } from '@inlet/react-pixi'
import { SceneElement } from '@/data/Content'

interface Props {
  imageBaseUrl: string;
  sceneConfig: SceneElement[];
}

// if (import.meta.env.VITE_NODE_ENV === 'development') {
//   // @ts-ignore
//   window.__PIXI_INSPECTOR_GLOBAL_HOOK__ && window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI })
// }

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720
const SituationScene = (props: Props & ComponentProps<typeof Container>) => {
  const {sceneConfig, imageBaseUrl, ...otherProps} = props
  const [scale, setScale] = useState(1)
  const renderElement = (sceneElement: SceneElement) => {
    const scale: [number, number] = [sceneElement.scale || 1, sceneElement.scale || 1]
    if (sceneElement.flipped) scale[0] = -scale[0]
    return (
      <Sprite
        image={`${imageBaseUrl}${sceneElement.image}`}
        key={sceneElement.image}
        position={sceneElement.position || [0, 0]}
      />
    )
  }

  useEffect(() => {
    const resize = () => {
      if (window.innerWidth < DEFAULT_WIDTH || window.innerHeight < DEFAULT_HEIGHT) {
        if (DEFAULT_WIDTH - window.innerWidth > DEFAULT_HEIGHT - window.innerHeight) {
          // width defines height
          setScale(window.innerWidth / DEFAULT_WIDTH)
        } else {
          // height defines width
          setScale(window.innerHeight / DEFAULT_HEIGHT)
        }
      } else {
        setScale(1)
      }
    }
    window.addEventListener('resize', resize)
    resize()
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <Stage width={DEFAULT_WIDTH * scale} height={DEFAULT_HEIGHT * scale} className="scene" options={{backgroundColor: 0xffffff}}>
      <Container {...otherProps} scale={scale} >
        {sceneConfig.map(e => renderElement(e))}
      </Container>
    </Stage>
  )
}

export default SituationScene