import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  createApp,
  detectInvokedPackageManager,
  fetchTemplateData,
  finalNote,
  getAppInfo,
  getArgs,
  listTemplateIds,
  listTemplates,
  listVersions,
  validateProjectName,
} from '../src/index'
import type {
  AppInfo,
  CreateAppArgs,
  CreateAppResult,
  FetchTemplateDataArgs,
  FetchTemplateDataResult,
  FinalNoteArgs,
  GetArgsResult,
  MenuConfig,
  MenuConfigItem,
  MenuItem,
  PackageManager,
  Template,
  TemplateJson,
  TemplateJsonGroup,
  TemplateJsonTemplate,
} from '../src/index'

type PublicApiTypes = {
  appInfo: AppInfo
  createAppArgs: CreateAppArgs
  createAppResult: CreateAppResult
  fetchTemplateDataArgs: FetchTemplateDataArgs
  fetchTemplateDataResult: FetchTemplateDataResult
  finalNoteArgs: FinalNoteArgs
  getArgsResult: GetArgsResult
  menuConfig: MenuConfig
  menuConfigItem: MenuConfigItem
  menuItem: MenuItem
  packageManager: PackageManager
  template: Template
  templateJson: TemplateJson
  templateJsonGroup: TemplateJsonGroup
  templateJsonTemplate: TemplateJsonTemplate
}

describe('package root exports', () => {
  it('exports the embeddable API functions', () => {
    const exportedFunctions = {
      createApp,
      detectInvokedPackageManager,
      fetchTemplateData,
      finalNote,
      getAppInfo,
      getArgs,
      listTemplateIds,
      listTemplates,
      listVersions,
      validateProjectName,
    }

    expect(Object.keys(exportedFunctions)).toEqual([
      'createApp',
      'detectInvokedPackageManager',
      'fetchTemplateData',
      'finalNote',
      'getAppInfo',
      'getArgs',
      'listTemplateIds',
      'listTemplates',
      'listVersions',
      'validateProjectName',
    ])
    expect(Object.values(exportedFunctions).every((value) => typeof value === 'function')).toBe(true)
  })

  it('exports the public API types', () => {
    expectTypeOf<PublicApiTypes['createAppArgs']>().toEqualTypeOf<PublicApiTypes['getArgsResult']>()
    expectTypeOf<PublicApiTypes['createAppResult']>().toEqualTypeOf<string[]>()
    expectTypeOf<PublicApiTypes['fetchTemplateDataArgs']>().toHaveProperty('config')
    expectTypeOf<PublicApiTypes['fetchTemplateDataResult']>().toHaveProperty('templates')
  })
})
