import { useApp } from '@inlet/react-pixi'

declare global {
  interface Window {
    __PIXI_APP__: unknown
  }
}

/** Connects to chrome Pixi.js extension
 * https://chromewebstore.google.com/detail/pixijs-devtools/aamddddknhcagpehecnhphigffljadon?hl=en
 */
const PixiDevToolsConnector = () => {
  const app = useApp()
  window.__PIXI_APP__ = app

  return null
}

export default PixiDevToolsConnector
