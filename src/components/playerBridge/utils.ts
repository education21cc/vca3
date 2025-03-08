
type Payload = {
  type: string
  data?: unknown
}

export const send = (payload: Payload) => {
  if (Object.prototype.hasOwnProperty.call(window, 'webkit') && Object.prototype.hasOwnProperty.call(window.webkit, 'messageHandlers')){
    const stringifiedMessageObj = JSON.stringify(payload)
    // Send to In App Browser context
    window.webkit?.messageHandlers.cordova_iab.postMessage(stringifiedMessageObj)
  }
  else {
    window.parent.postMessage(payload, '*')
  }
}