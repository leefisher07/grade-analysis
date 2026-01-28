/**
 * 请求队列管理
 *
 * 功能：
 * - 批量生成时控制请求频率
 * - 避免同时发送大量请求
 * - 显示进度
 */

export interface QueueTask<T = any> {
  id: string | number
  execute: () => Promise<T>
}

export class RequestQueue {
  private queue: QueueTask[] = []
  private running = false
  private currentIndex = 0
  private results: Map<string | number, any> = new Map()
  private errors: Map<string | number, Error> = new Map()

  // 回调函数
  public onProgress?: (current: number, total: number, currentTaskId: string | number) => void
  public onTaskComplete?: (taskId: string | number, result: any) => void
  public onTaskError?: (taskId: string | number, error: Error) => void
  public onComplete?: (results: Map<string | number, any>, errors: Map<string | number, Error>) => void

  constructor(private delayMs: number = 800) {}

  /**
   * 添加任务到队列
   */
  addTask(task: QueueTask) {
    this.queue.push(task)
  }

  /**
   * 批量添加任务
   */
  addTasks(tasks: QueueTask[]) {
    this.queue.push(...tasks)
  }

  /**
   * 开始执行队列
   */
  async start() {
    if (this.running) {
      console.warn('[RequestQueue] 队列已在运行中')
      return
    }

    this.running = true
    this.currentIndex = 0
    this.results.clear()
    this.errors.clear()

    console.log(`[RequestQueue] 开始执行队列，共 ${this.queue.length} 个任务`)

    for (let i = 0; i < this.queue.length; i++) {
      if (!this.running) {
        console.log('[RequestQueue] 队列已停止')
        break
      }

      const task = this.queue[i]
      this.currentIndex = i + 1

      // 触发进度回调
      this.onProgress?.(this.currentIndex, this.queue.length, task.id)

      try {
        // 执行任务
        const result = await task.execute()
        this.results.set(task.id, result)
        this.onTaskComplete?.(task.id, result)

        console.log(`[RequestQueue] 任务 ${task.id} 完成 (${this.currentIndex}/${this.queue.length})`)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        this.errors.set(task.id, err)
        this.onTaskError?.(task.id, err)

        console.error(`[RequestQueue] 任务 ${task.id} 失败:`, err.message)
      }

      // 延迟下一个请求（最后一个任务不需要延迟）
      if (this.currentIndex < this.queue.length && this.running) {
        await new Promise(resolve => setTimeout(resolve, this.delayMs))
      }
    }

    this.running = false
    this.queue = []

    console.log(`[RequestQueue] 队列执行完成，成功 ${this.results.size} 个，失败 ${this.errors.size} 个`)

    // 触发完成回调
    this.onComplete?.(this.results, this.errors)
  }

  /**
   * 停止队列执行
   */
  stop() {
    console.log('[RequestQueue] 停止队列执行')
    this.running = false
  }

  /**
   * 清空队列
   */
  clear() {
    this.queue = []
    this.results.clear()
    this.errors.clear()
    this.currentIndex = 0
  }

  /**
   * 获取当前进度
   */
  getProgress() {
    return {
      current: this.currentIndex,
      total: this.queue.length,
      isRunning: this.running
    }
  }

  /**
   * 获取结果
   */
  getResults() {
    return {
      results: this.results,
      errors: this.errors,
      successCount: this.results.size,
      errorCount: this.errors.size
    }
  }
}
