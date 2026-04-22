interface BackgroundTask {
  key: string
  run: () => Promise<void>
}

const waitForIdleTime = async () => {
  if (import.meta.server) {
    return
  }

  if ('requestIdleCallback' in window) {
    await new Promise<void>((resolve) => {
      window.requestIdleCallback(() => resolve(), { timeout: 1200 })
    })
    return
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, 120)
  })
}

const waitForVisibility = async () => {
  if (import.meta.server || !document.hidden) {
    return
  }

  await new Promise<void>((resolve) => {
    const onVisibilityChange = () => {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', onVisibilityChange)
        resolve()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
  })
}

const shouldSkipBackgroundWork = () => {
  if (import.meta.server || typeof navigator === 'undefined') {
    return true
  }

  const connection = navigator.connection as (NetworkInformation & {
    saveData?: boolean
    effectiveType?: string
  }) | undefined

  if (connection?.saveData) {
    return true
  }

  return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'
}

export const useBackgroundPrefetchQueue = () => {
  const queue = useState<BackgroundTask[]>('background-prefetch-queue', () => [])
  const queuedKeys = useState<Record<string, true>>('background-prefetch-queued-keys', () => ({}))
  const completedKeys = useState<Record<string, number>>('background-prefetch-completed-keys', () => ({}))
  const processing = useState('background-prefetch-processing', () => false)

  const hasCompleted = (key: string) => Boolean(completedKeys.value[key])
  const isQueued = (key: string) => Boolean(queuedKeys.value[key])

  const remove = (matcher: string | RegExp) => {
    const matches = (taskKey: string) => typeof matcher === 'string'
      ? taskKey.startsWith(matcher)
      : matcher.test(taskKey)

    queue.value = queue.value.filter((task) => {
      if (!matches(task.key)) {
        return true
      }

      const { [task.key]: _removedTask, ...restQueuedKeys } = queuedKeys.value
      queuedKeys.value = restQueuedKeys
      return false
    })
  }

  const processQueue = async () => {
    if (processing.value || shouldSkipBackgroundWork()) {
      return
    }

    processing.value = true

    try {
      while (queue.value.length) {
        await waitForVisibility()
        await waitForIdleTime()

        const [task, ...restTasks] = queue.value
        queue.value = restTasks

        if (!task) {
          continue
        }

        const { [task.key]: _finishedTask, ...restQueuedKeys } = queuedKeys.value
        queuedKeys.value = restQueuedKeys

        try {
          await task.run()
          completedKeys.value = {
            ...completedKeys.value,
            [task.key]: Date.now()
          }
        } catch {
          // Background work is best-effort and must not affect the current UX.
        }
      }
    } finally {
      processing.value = false
    }
  }

  const enqueue = (task: BackgroundTask) => {
    if (import.meta.server || queuedKeys.value[task.key] || completedKeys.value[task.key]) {
      return
    }

    queuedKeys.value = {
      ...queuedKeys.value,
      [task.key]: true
    }
    queue.value = [...queue.value, task]
    void processQueue()
  }

  return {
    enqueue,
    hasCompleted,
    isQueued,
    processQueue,
    remove,
    waitForIdleTime
  }
}
