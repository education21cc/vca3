import { PixiComponent, applyDefaultProps, Graphics } from '@inlet/react-pixi'
import { LineStyle, LINE_CAP, LINE_JOIN } from 'pixi.js'
import { Point } from 'pixi.js'
import * as PIXI from 'pixi.js'

interface Props  {
  points?: Point[];
  style?: Partial<LineStyle>;
  dash?: number;
  gap?: number;
  speed?: number; // positive to move forward, negative to move backward, 0 to not move at all
}

/**
 * Draws a dashed line along a path
 */
const DashedLine = PixiComponent<React.ComponentProps<typeof Graphics> & Props, PIXI.Graphics>('DashedLine', {
  create: () => {
    return new PIXI.Graphics()
  },

  applyProps: (instance: PIXI.Graphics, oldProps: Props, newProps: Props) => {
    const {
      points = [],
      dash = 10,
      gap = 5,
      speed = 40,
      style,
      ...newP
    } = newProps

    // apply rest props to PIXI.Graphics
    applyDefaultProps(instance, oldProps, newP)
    instance.clear()

    const draw = () => {

      if (instance.destroyed) {
        // component is unmounted, cancel drawing the line
        return
      }

      instance.clear()
      instance.lineStyle({
        width: style?.width ?? 10,
        ...style,
        join: LINE_JOIN.ROUND,
        cap: LINE_CAP.ROUND,

      })

      const offsetPercentage = (Date.now() % (10000 / speed) + 1) / Math.abs(10000 / speed)

      let dashLeft = 0
      let gapLeft = 0
      if (offsetPercentage > 0) {
        const progressOffset = (dash + gap) * offsetPercentage * (speed < -1 ? 1 : -1)
        if (progressOffset < dash) {
          dashLeft = dash - progressOffset
        } else {
          gapLeft = gap - (progressOffset - dash)
        }
      }
      const rotatedpoints = []
      for (const point of points) {
        const p = point.clone()
        const cosAngle = Math.cos(instance.rotation)
        const sinAngle = Math.sin(instance.rotation)
        const dx = p.x
        const dy = p.y
        p.x = (dx * cosAngle - dy * sinAngle)
        p.y = (dx * sinAngle + dy * cosAngle)
        rotatedpoints.push(p)
      }

      for (let i = 0; i < rotatedpoints.length - 1; i++) {
        const p1 = rotatedpoints[i]
        const p2 = rotatedpoints[i + 1]
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const len = Math.sqrt(dx * dx + dy * dy)
        const normal = {
          x: dx / len,
          y: dy / len,
        }
        let progressOnLine = 0

        instance.moveTo(p1.x + gapLeft * normal.x, p1.y + gapLeft * normal.y)
        while (progressOnLine <= len) {
          progressOnLine += gapLeft
          if (dashLeft > 0) {
            progressOnLine += dashLeft
          } else {
            progressOnLine += dash
          }
          if (progressOnLine > len) {
            dashLeft = progressOnLine - len
            progressOnLine = len
          } else {
            dashLeft = 0
          }
          instance.lineTo(p1.x + progressOnLine * normal.x, p1.y + progressOnLine * normal.y)
          progressOnLine += gap
          if (progressOnLine > len && dashLeft === 0) {
            gapLeft = progressOnLine - len
          } else {
            gapLeft = 0
            instance.moveTo(p1.x + progressOnLine * normal.x, p1.y + progressOnLine * normal.y)
          }
        }
      }
      if (speed !== 0) {
        requestAnimationFrame(draw)
      }
    }
    draw()
  },
})

export default DashedLine
