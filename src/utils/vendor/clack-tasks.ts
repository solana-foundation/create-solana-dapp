/**
 * Vendor in the clack tasks code until it's released to npm
 * Read more here: https://github.com/bombshell-dev/clack/issues/181
 *
 * This code is licensed under the MIT License:
 * MIT License
 * Copyright (c) Nate Moore
 *
 * The full MIT License is available in the LICENSE file at the root of this repository.
 */
import { log, spinner } from '@clack/prompts'

export type Task = {
  /**
   * If enabled === false the task will be skipped
   */
  enabled?: boolean
  /**
   * Task function
   */
  task: (
    result: (input: { instructions?: string[]; message: string }) => void,
  ) => Promise<{ instructions?: string[]; message: string }> | void | Promise<void>

  /**
   * Task title
   */
  title: string
}

/**
 * Define a group of tasks to be executed
 */
export async function tasks(tasks: Task[]): Promise<string[]> {
  const instructions: string[] = []
  for (const task of tasks) {
    if (task.enabled === false) continue

    const s = spinner()
    s.start(task.title)

    const result = await task.task((val) => {
      return val
    })

    s.stop(result?.message ?? task.title)
    if (result?.instructions) {
      instructions.push(...result.instructions)
    }
  }
  return instructions
}

export function taskFail(message: string) {
  log.error(message)
  throw new Error(message)
}
