import create from 'zustand'

export enum GameState {
  intro = 1 << 0,
  instructions = 1 << 1,
  normal = 1 << 2,
  preComplete = 1 << 3, // show an animation
  complete = 1 << 4
}

type GameStateStore = {
  state: GameState
  setState: (s: GameState) => void
}

export const useGameStateStore = create<GameStateStore>(
  (set): GameStateStore => ({
    state: GameState.intro,
    setState: (state: GameState) => set({ state })
  })
)
