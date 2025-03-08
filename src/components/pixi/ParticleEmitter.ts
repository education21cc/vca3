import { PixiComponent, applyDefaultProps, Container } from '@inlet/react-pixi'
import * as particles from 'pixi-particles'
import { ParticleContainer, Texture } from 'pixi.js'

interface Props  {
  image: string;
  config: particles.OldEmitterConfig | particles.EmitterConfig;
};

const ParticleEmitter = PixiComponent<Props & React.ComponentProps<typeof Container>, ParticleContainer>('ParticleEmitter', {
  create() {
    return new ParticleContainer(255, {})
  },

  applyProps(instance, oldProps: Props, newProps: Props) {
    const { image, config, ...newP } = newProps

    // apply rest props to PIXI.ParticleContainer
    applyDefaultProps(instance, oldProps, newP)

    let emitter = (this as any)._emitter
    if (!emitter) {
      emitter = new particles.Emitter(
        instance,
        [Texture.from(image)],
        config
      )

      let elapsed = performance.now()

      const tick = () => {
        emitter.raf = requestAnimationFrame(tick)
        const now = performance.now()
        // const amp = Math.random() * 5 + 15;
        // const amp = 15;
        // const freq = 0.0015;
        // emitter.acceleration.x = (Math.sin((elapsed * freq)) * amp) + 15;

        emitter.update((now - elapsed) * 0.0003)

        elapsed = now
      }
      emitter.emit = true
      // emitter.update(00.2);

      tick()
    }
    (this as any)._emitter = emitter
  },

  willUnmount() {
    if ((this as any)._emitter) {
      (this as any)._emitter.emit = false
      cancelAnimationFrame((this as any)._emitter.raf)
    }
  }
})

export default ParticleEmitter
