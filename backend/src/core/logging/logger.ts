

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  correlationId: string;
  module?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export class Logger {
  constructor(
    private correlationId: string,
    private module?: string
  ) {}

  private emit(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      correlationId: this.correlationId,
      module: this.module,
      data,
      timestamp: new Date().toISOString(),
    };

    const json = JSON.stringify(entry);

    switch (level) {
      case 'error': console.error(json); break;
      case 'warn':  console.warn(json);  break;
      default:      console.log(json);   break;
    }
  }

  debug(msg: string, data?: Record<string, unknown>) { this.emit('debug', msg, data); }
  info(msg: string,  data?: Record<string, unknown>) { this.emit('info',  msg, data); }
  warn(msg: string,  data?: Record<string, unknown>) { this.emit('warn',  msg, data); }
  error(msg: string, data?: Record<string, unknown>) { this.emit('error', msg, data); }

  child(module: string): Logger {
    return new Logger(this.correlationId, module);
  }
}

export function createLogger(correlationId: string, module?: string): Logger {
  return new Logger(correlationId, module);
}
