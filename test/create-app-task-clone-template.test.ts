import { downloadTemplate } from 'giget'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { templateCacheDirectory } from '../src/utils/corrupt-archive-error'
import { createAppTaskCloneTemplate } from '../src/utils/create-app-task-clone-template'
import { GetArgsResult } from '../src/utils/get-args-result'
import { taskFail } from '../src/utils/vendor/clack-tasks'

vi.mock('giget', () => ({ downloadTemplate: vi.fn() }))
vi.mock('node:fs', () => ({ cpSync: vi.fn(), existsSync: vi.fn(() => false), mkdirSync: vi.fn() }))
vi.mock('node:fs/promises', () => ({ readdir: vi.fn(async () => ['package.json']) }))
vi.mock('../src/utils/vendor/clack-tasks', () => ({ taskFail: vi.fn() }))

function zlibError() {
  // The failure reported in #256: giget extracted a truncated cached tarball.
  return Object.assign(new Error('zlib: unexpected end of file'), { name: 'ZlibError' })
}

const args = {
  targetDirectory: '/tmp/app',
  template: { id: 'gh:solana-foundation/templates/nextjs-anchor' },
  verbose: false,
} as GetArgsResult

describe('createAppTaskCloneTemplate: corrupt cached archive (#256)', () => {
  const result = vi.fn((value) => value)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retries the download once when the cached archive is corrupt', async () => {
    vi.mocked(downloadTemplate)
      .mockRejectedValueOnce(zlibError())
      .mockResolvedValueOnce({ dir: '/tmp/app' } as Awaited<ReturnType<typeof downloadTemplate>>)

    await createAppTaskCloneTemplate(args).task(result)

    expect(vi.mocked(downloadTemplate)).toHaveBeenCalledTimes(2)
    // The retry clears whatever the failed attempt left in the target directory.
    expect(vi.mocked(downloadTemplate).mock.calls[1][1]).toMatchObject({ forceClean: true })
    expect(vi.mocked(taskFail)).not.toHaveBeenCalled()
  })

  it('surfaces an actionable message when the retry is also corrupt', async () => {
    vi.mocked(downloadTemplate).mockRejectedValue(zlibError())

    await createAppTaskCloneTemplate(args).task(result)

    expect(vi.mocked(downloadTemplate)).toHaveBeenCalledTimes(2)
    const message = vi.mocked(taskFail).mock.calls[0][0] as string
    expect(message).toContain(templateCacheDirectory())
    expect(message).toContain('corrupt')
  })

  it('does not retry unrelated download failures', async () => {
    vi.mocked(downloadTemplate).mockRejectedValue(new Error('Destination /tmp/app already exists.'))

    await createAppTaskCloneTemplate(args).task(result)

    expect(vi.mocked(downloadTemplate)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(taskFail)).toHaveBeenCalledOnce()
  })
})
