import { GameData } from '@/components/playerBridge/GameData'

export interface Content {
  mapJson: string
  situations: { [key: string]: Situation }
  scenarios: { [key: string]: Scenario }
  gameMode?: GameMode
  finder?: FinderContent
  mistakeMode?: boolean // when true, answering the wrong scenario will make the the marker disappear and it will cost a star
  stars?: number
  instructions?: Instruction[]
  disableBackButton?: boolean
}

export enum GameMode {
  scenarios = 'scenarios',
  finder = 'finder',
  timedFinder = 'timedFinder'
}

export interface Instruction {
  text: string
  time: number
  delay?: number
  x: number
  y: number
  zoom: number
}

export interface FinderContent {
  situations: string[]
  final: ContentConfig
  time?: number
  path?: [number, number][] // only used in timed finder
  complete: CompleteConfig // only used in timed finder atm
}

export interface CompleteConfig {
  buttons: CompleteButtonsConfig[]
}

export interface CompleteButtonsConfig {
  text: string
  action: 'again' | 'loadPage' | 'loadConfig' | 'exit'
  actionArgs?: unknown
  color?: 'red' | 'green' | 'white'
  condition?: CompleteButtonConditionConfig
}

export interface CompleteButtonConditionConfig {
  type: 'starsMinimum'
  args: unknown
  text: string
}

export interface ContentConfig {
  url: string
  data: GameData<unknown>
}

export interface Situation {
  url: string
  title: string
}

export interface Scenario {
  location: number[]
  description: string | string[]
  image?: string
  imageFeedback?: string
  hotspots?: Hotspot[]
  reactions: ScenarioReaction[]
}

export interface Hotspot {
  left: number
  top: number
  width: number
  image: string
  hotspot: string
}

// Something on the scene
export interface SceneElement {
  image?: string
  position?: [number, number]
  scale?: number
  flipped: boolean
}

export interface ScenarioReaction {
  correct: boolean,
  id: string,
}
