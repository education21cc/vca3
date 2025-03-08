import { Content, GameMode } from '@/data/Content'

const useGameMode = (content: Content) => {
  if (content.gameMode) return content.gameMode
  // for backwards compatibility
  if (content.finder) return GameMode.finder
  if (content.scenarios) return GameMode.scenarios
}

export default useGameMode
