export type { IConfig, ILoggingConfig, IKafkaConfig }

interface IConfig {
  logging?: ILoggingConfig
}

interface ILoggingConfig {
  showCommands?: boolean
  showEvents?: boolean
}

interface IKafkaConfig {
  namespace: string
  bootstrapServer: string
}
