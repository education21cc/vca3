import './styles/loading.css'

const Loading = () => {
  return (
    <div className="loading-background">
      <div className="white-block">
        <div className="outset" />
        <div className="blue-block" />
      </div>
      <div className="subtext">
        Stay curious
        <span className="dots"><span className="dot1">.</span><span className="dot2">.</span><span className="dot3">.</span></span>
      </div>
    </div>
  )
}

export default Loading
