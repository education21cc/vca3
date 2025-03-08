import { useRef, useEffect, useState, ComponentProps } from 'react'
import { Sprite } from '@inlet/react-pixi'
import { InteractionData, InteractionEvent, Point, Sprite as PixiSprite} from 'pixi.js'
import { gsap } from 'gsap'

const CAN_DRAG = false

export type Color = 'red' | 'green' | 'yellow'
interface Props {
  position?: Point;
  delay?: number; // Wait this long before showing
  bounce?: boolean;
  color?: Color;
}

/* A map marker (the red or green arrow thimg) */
const Marker = (props: Props & ComponentProps<typeof Sprite>) => {
  const { color = 'red' } = props
  const ref = useRef<PixiSprite>(null)
  const data = useRef<InteractionData>()
  const [position, setPosition] = useState<Point>(props.position || new Point())
  const popInDuration = 1
  const image = `${import.meta.env.VITE_PUBLIC_URL}/images/ui/marker-${color}.svg`

  useEffect(() => {
    // Pop in animation!
    gsap.from(ref.current, {
      duration: popInDuration,
      ease: 'elastic.out(2, 0.5)',
      pixi: {
        visible: false,
        scale: .1,
      }
    }).delay(props.delay || 0)
  }, [props.delay])

  useEffect(() => {
    let bounceAnim: gsap.core.Tween
    // Bounce animation!
    if (props.bounce !== false) {
      bounceAnim = gsap.to(ref.current, {
        duration: .5,
        yoyo: true,
        repeat: -1,
        pixi: {
          y: '-=40',
        }
      }).delay(popInDuration + Math.random())
    }
    return () => {
      bounceAnim?.kill()
    }
  }, [props.bounce])

  const onDragStart = (event: InteractionEvent) => {
    if (!CAN_DRAG) return
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    data.current = event.data
    event.stopPropagation() // Stop dragging the map!
  }

  const onDragEnd = () => {
    data.current = undefined
  }

  const onDragMove = () => {
    if (!CAN_DRAG) return
    if (data.current)
    {
      const newPosition = data.current.getLocalPosition(ref.current!.parent)
      setPosition(newPosition)
    }
  }

  return (
    <Sprite
      { ...props }
      anchor={[0.5, 0.5]}
      position={position}
      ref={ref}
      interactive={true}
      image={image}
      mousedown={onDragStart}
      touchstart={onDragStart}
      mouseup={onDragEnd}
      mouseupoutside={onDragEnd}
      mousemove={onDragMove}
      touchmove={onDragMove}
    />
  )
}

export default Marker
