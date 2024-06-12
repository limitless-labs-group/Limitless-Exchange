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

  verbose = (...args: unknown[]) => {
    console.log('👀', this.title, '|', ...args)
  }

  info = (...args: unknown[]) => {
    console.info('💡', this.title, '|', ...args)
  }

  success = (...args: unknown[]) => {
    console.log('✅', this.title, '|', ...args)
  }

  error = (...args: unknown[]) => {
    console.error('🐞', this.title, '|', ...args)
  }

  warn = (...args: unknown[]) => {
    console.warn('⚠️', this.title, '|', ...args)
  }
}
