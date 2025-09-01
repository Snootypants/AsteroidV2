export type LogLevel = 'log' | 'info' | 'warn' | 'error'
export type LogEntry = { t: number; level: LogLevel; msg: string }

class DebugBusImpl {
  private entries: LogEntry[] = []
  private maxEntries = 500
  private subscribers: ((entries: LogEntry[]) => void)[] = []

  subscribe(cb: (entries: LogEntry[]) => void): () => void {
    this.subscribers.push(cb)
    return () => {
      const index = this.subscribers.indexOf(cb)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  push(level: LogLevel, ...args: any[]): void {
    const msg = args.map(arg => {
      try {
        return typeof arg === 'string' ? arg : JSON.stringify(arg)
      } catch {
        return String(arg)
      }
    }).join(' ')

    const entry: LogEntry = { t: Date.now(), level, msg }
    
    // Ring buffer - remove oldest if at capacity
    if (this.entries.length >= this.maxEntries) {
      this.entries.shift()
    }
    
    this.entries.push(entry)
    
    // Notify subscribers
    this.subscribers.forEach(cb => cb([...this.entries]))
  }

  get(): LogEntry[] {
    return [...this.entries]
  }

  setMax(n: number): void {
    this.maxEntries = n
    // Trim existing entries if needed
    if (this.entries.length > n) {
      this.entries = this.entries.slice(-n)
    }
  }

  clear(): void {
    this.entries = []
    this.subscribers.forEach(cb => cb([]))
  }
}

export const DebugBus = new DebugBusImpl()

// Attach helpers to window.debug
;(window as any).debug = {
  log: (...a: any[]) => DebugBus.push('log', ...a),
  info: (...a: any[]) => DebugBus.push('info', ...a),
  warn: (...a: any[]) => DebugBus.push('warn', ...a),
  error: (...a: any[]) => DebugBus.push('error', ...a),
}

// Catch runtime errors (with guard for HMR)
if (!(window as any).__debugBusErrorHandlersAdded) {
  window.addEventListener('error', e => DebugBus.push('error', e.message))
  window.addEventListener('unhandledrejection', e => 
    DebugBus.push('error', (e.reason && e.reason.message) || 'unhandled rejection')
  )
  ;(window as any).__debugBusErrorHandlersAdded = true
}