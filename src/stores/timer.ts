import create from 'zustand'

type TimerStore = {
  timePassed: number
}

export const useTimerStore = create<TimerStore>(
  () => ({
    timePassed: 0,
  })
)
