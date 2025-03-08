import { forwardRef } from 'react'
import { Viewport as PixiViewport } from 'pixi-viewport'
import { PixiComponent, useApp } from '@inlet/react-pixi'
import * as PIXI  from 'pixi.js'
import { InteractionEvent } from 'pixi.js'

interface Props {
  onClick?(event: InteractionEvent): void;
  screenWidth: number,
  screenHeight: number,
  worldWidth: number,
  worldHeight: number,
  minScale?: number;
  maxScale?: number;
}

/** Viewport leverages pixi-viewport to create a pannable map
 * https://davidfig.github.io/pixi-viewport/jsdoc/
 */
const Viewport = forwardRef<PixiViewport, any>((props, ref) => {
  const app = useApp()

  return <PixiComponentViewport app={app} {...props} ref={ref} />
})

interface PixiComponentProps {
  app: PIXI.Application;
}

const PixiComponentViewport = PixiComponent('Viewport', {
  create: (props: PixiComponentProps & Props) => {
    const viewport = new PixiViewport({
      screenWidth: props.screenWidth,
      screenHeight: props.screenHeight,
      worldWidth: props.worldWidth,
      worldHeight: props.worldHeight,
      ticker: props.app.ticker,
      //interaction: props.app.renderer.plugins.interaction,
      // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    })
    // viewport.on("clicked", (event) => { if(props.onClick) props.onClick(event) });
    // viewport.on('clicked', (e) => {
    // console.log(viewport.toLocal(e.data.global))
    // })
    // viewport.on('mousemove', (e) => {
    //console.log(viewport.toLocal(e.data.global))
    // })
    const {
      minScale = .15,
      maxScale = 1
    } = props

    viewport
      .drag()
      .pinch()
      .wheel()
      .clamp({ direction: 'all' })
      .setZoom(.15)
      .clampZoom({ minScale, maxScale })
      .decelerate()

    return viewport
  }
})
export default Viewport
