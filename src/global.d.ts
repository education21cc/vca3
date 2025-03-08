// declare module '*.svg?react' {
//   import * as React from 'react'
//   export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
//   const src: string
//   export default src
// }

declare module '*.svg?react' {
  const content: React.FC<React.SVGProps<SVGElement>>
  export default content
}

declare global {
  interface Window {
    PIXI: unknown
    __PIXI_INSPECTOR_GLOBAL_HOOK__: {
      register: () => void
    }
  }
}