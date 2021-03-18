import {LogLevel, UILogWriter} from '../shared';

export class ConsoleLogWriter implements UILogWriter {
  write(date: Date, level: LogLevel, message: string): void {
    console.log(`${date.toISOString()} | ${LogLevel[level]} | ${message}`);
  }
}
