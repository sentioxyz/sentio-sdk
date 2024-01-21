export interface ExecutionConfig {
  // Whether to execute transactions sequentially, by default it's false
  sequential: boolean
}
export interface GlobalConfig {
  execution: ExecutionConfig
}

// Experimental global config, only apply to eth for now
export const GLOBAL_CONFIG: GlobalConfig = {
  execution: {
    sequential: false
  }
}
