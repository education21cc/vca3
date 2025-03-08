import React, { forwardRef, memo } from 'react'
import { PixiComponent, applyDefaultProps, AnimatedSprite } from '@inlet/react-pixi'
import * as PIXI from 'pixi.js'

const SpriteAnimated = forwardRef<PIXI.AnimatedSprite, any>((props, ref) => {
  return <PixiComponentSpriteAnimated {...props} ref={ref} />
})

const PixiComponentSpriteAnimated = PixiComponent<React.ComponentProps<typeof AnimatedSprite>, PIXI.AnimatedSprite>('SpriteAnimated', {
  create: ({ textures }) => {
    const animatedSprite = new PIXI.AnimatedSprite(textures || [], true)
    return animatedSprite
  },
  applyProps: (instance, oldProps, newProps) => {
    if(oldProps.textures !== newProps.textures){
      applyDefaultProps(instance, oldProps, newProps)
      instance.gotoAndStop(instance.currentFrame)
    }
  },
})

export default memo(SpriteAnimated)
