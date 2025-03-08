import { ReactNode } from 'react'
import create from 'zustand'

type TranslationsStore = {
  texts: {[key: string]: string},
  getText: (key: string) => ReactNode
  getTextRaw: (key: string) => string
}

export const useTranslationStore = create<TranslationsStore>(
  (_, get): TranslationsStore => ({
    texts: {},
    getText: (key: string) => {
      const text = get().texts[key]
      return convertToJSX(text)
    },
    getTextRaw: (key: string) => {
      return  get().texts[key]
    }
  })
)

const convertToJSX = (text: string) => text?.split('\n').reduce<ReactNode>((acc, item) => (
  acc === null ? item : (
    <>
      {acc}
      <br />
      {item}
    </>
  )
), null)
