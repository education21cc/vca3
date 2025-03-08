import React from 'react'
import smoke from './smoke.json'
import ParticleEmitter from '@/components/pixi/ParticleEmitter'
import { TILE_WIDTH } from '@/constants/tiles'
import { Container } from '@inlet/react-pixi'


const Smoke1 = (props: React.ComponentProps<typeof Container> ) => {
  const { x = 0, y = 0 } = props
  return (
    <ParticleEmitter
      name="smoke"
      x={x}
      y={y}
      image={`${import.meta.env.VITE_PUBLIC_URL}/effects/smokeparticle.png`}
      config={smoke}
      pivot={[-TILE_WIDTH / 2, 0]}
    />
  )
}
export default Smoke1