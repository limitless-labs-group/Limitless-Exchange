export type LogLevel = 'verbose' | 'info' | 'success' | 'error' | 'warn'

export interface ILogger {
  level: LogLevel
}

export class Logger {
  title: string

  level: LogLevel

  constructor(title: string, options?: ILogger) {
    const { level } = options ?? {}
    this.title = title
    this.level = level ?? 'verbose'
  }

  verbose = (...args: any) => {
    console.log('👀', this.title, '|', ...args)
  }

  info = (...args: any) => {
    console.info('💡', this.title, '|', ...args)
  }

  success = (...args: any) => {
    console.log('✅', this.title, '|', ...args)
  }

  error = (...args: any) => {
    console.error('🐞', this.title, '|', ...args)
  }

  warn = (...args: any) => {
    console.warn('⚠️', this.title, '|', ...args)
  }
}
