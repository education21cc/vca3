import { Content } from '@/data/Content'
import create from 'zustand'

type ContentStore = {
  content: Content
  setContent: (c: Content) => void
  loaded: boolean
}

export const useContentStore = create<ContentStore>(
  (set) => ({
    content: {
      mapJson: '',
      situations: {},
      scenarios: {}
    },
    loaded: false,
    setContent: (content: Content) => {
      set({content, loaded: true})
    },
  })
)
