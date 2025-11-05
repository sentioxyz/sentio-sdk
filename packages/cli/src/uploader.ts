import fetch from 'node-fetch'
import { getApiUrl, getCliVersion, getSdkVersion } from './utils.js'
import { YamlProjectConfig } from './config.js'
import { createHash } from 'crypto'

export enum StorageEngine {
  DEFAULT = 0,
  S3 = 1,
  GCS = 2,
  SUBGRAPH = 3,
  WALRUS = 4,
  IPFS = 5
}

export enum FileType {
  PROCESSOR = 0,
  SOURCE = 1
}

export interface Auth {
  'api-key'?: string
  authorization?: string
}

export interface UploadPayload {
  object?: {
    putUrl: string
    bucket: string
    objectId: string
    fileId: string
  }
  walrus?: {
    putUrl: string
    jwtToken: string
    fileId: string
    blobId: string
    quiltPatchId: string
  }
  file_type: FileType
}

export interface InitBatchUploadResponse {
  warning: string
  replacing_version: number
  multi_version: boolean
  project_id: string
  engine: StorageEngine
  payloads: Record<string, UploadPayload>
}

export interface FinishBatchUploadResponse {
  projectFullSlug: string
  version: number
  processorId: string
}

export interface NetworkOverride {
  chain: string
  host: string
}

interface Files {
  source: Buffer
  code: Buffer
}

export abstract class BatchUploader {
  readonly projectSlug: string
  readonly projectOwner: string

  protected constructor(
    private readonly engine: StorageEngine,
    private readonly options: YamlProjectConfig,
    private readonly auth: Auth
  ) {
    const [projectOwner, projectSlug] = options.project.split('/')
    this.projectSlug = projectSlug
    this.projectOwner = projectOwner
  }

  abstract upload(
    files: Files,
    commitSha?: string,
    gitUrl?: string,
    debug?: boolean,
    continueFrom?: number,
    networkOverrides?: NetworkOverride[],
    rollback?: Record<string, number>
  ): Promise<FinishBatchUploadResponse>

  async initUpload(fileTypes?: Record<string, FileType>): Promise<InitBatchUploadResponse> {
    const initUploadUrl = getApiUrl(`/api/v1/processors/init_batch_upload`, this.options.host)

    const response = await fetch(initUploadUrl.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth
      },
      body: JSON.stringify({
        project_slug: this.projectSlug,
        project_owner: this.projectOwner,
        sdk_version: getSdkVersion(),
        engine: this.engine,
        file_types: fileTypes || {}
      })
    })

    if (!response.ok) {
      const body = await response.json()
      throw new Error(`Failed to init batch upload: ${response.status} ${response.statusText}, ${JSON.stringify(body)}`)
    }

    return (await response.json()) as InitBatchUploadResponse
  }

  async finishUpload(
    files: Files,
    payloads: Record<string, UploadPayload>,
    commitSha?: string,
    gitUrl?: string,
    debug?: boolean,
    continueFrom?: number,
    networkOverrides?: NetworkOverride[],
    rollback?: Record<string, number>
  ): Promise<FinishBatchUploadResponse> {
    const finishUploadUrl = getApiUrl(`/api/v1/processors/finish_batch_upload`, this.options.host)

    const sha256Map: Record<string, string> = {}
    for (const [fileKey, fileContent] of Object.entries(files)) {
      const hash = createHash('sha256')
      hash.update(fileContent)
      sha256Map[fileKey] = hash.digest('hex')
    }

    const response = await fetch(finishUploadUrl.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.auth
      },
      body: JSON.stringify({
        project_slug: this.projectSlug,
        project_owner: this.projectOwner,
        sdk_version: getSdkVersion(),
        sha256_map: sha256Map,
        commit_sha: commitSha,
        git_url: gitUrl,
        debug: debug || false,
        continue_from: continueFrom,
        cli_version: getCliVersion(),
        network_overrides: networkOverrides || [],
        engine: this.engine,
        payloads: payloads,
        rollback: rollback
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to finish batch upload: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as FinishBatchUploadResponse
  }
}

export class DefaultBatchUploader extends BatchUploader {
  constructor(options: YamlProjectConfig, auth: Auth) {
    super(StorageEngine.DEFAULT, options, auth)
  }

  async upload(
    files: Files,
    commitSha?: string,
    gitUrl?: string,
    debug?: boolean,
    continueFrom?: number,
    networkOverrides?: NetworkOverride[],
    rollback?: Record<string, number>
  ): Promise<FinishBatchUploadResponse> {
    // Step 1: Initialize upload with file types
    const fileTypes: Record<string, FileType> = {
      source: FileType.SOURCE,
      code: FileType.PROCESSOR
    }

    const initResponse = await this.initUpload(fileTypes)

    // Step 3: Upload files to S3 using presigned URLs
    for (const [fileKey, payload] of Object.entries(initResponse.payloads)) {
      if (!payload?.object?.putUrl) {
        throw new Error(`No S3 put URL found for file: ${fileKey}`)
      }
      const fileContent = files[fileKey as keyof Files]
      if (!fileContent) {
        throw new Error(`File content not found for key: ${fileKey}`)
      }

      const uploadResponse = await fetch(payload.object.putUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileContent.length.toString()
        },
        body: fileContent
      })

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file ${fileKey} to S3: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }
    }

    // Step 4: Finish upload with SHA256 map and payloads
    return this.finishUpload(
      files,
      initResponse.payloads,
      commitSha,
      gitUrl,
      debug,
      continueFrom,
      networkOverrides,
      rollback
    )
  }
}

export class WalrusBatchUploader extends BatchUploader {
  constructor(options: YamlProjectConfig, auth: Auth) {
    super(StorageEngine.WALRUS, options, auth)
  }

  private createQuiltMultipartFormData(files: Files): FormData {
    const form = new FormData()

    // Add files with proper Quilt API format
    for (const [fileKey, fileContent] of Object.entries(files)) {
      const blob = new Blob([fileContent], { type: 'application/octet-stream' })
      const fileName = fileKey === 'source' ? 'source.zip' : 'lib.js'
      form.append(fileKey, blob, fileName)
    }

    // Add metadata for the quilt with identifiers for each file
    const metadata = Object.keys(files).map((fileKey) => ({
      identifier: fileKey,
      tags: {
        type: fileKey === 'source' ? 'source-code' : 'processor-code',
        uploader: 'sentio-cli'
      }
    }))

    form.append('_metadata', JSON.stringify(metadata))

    return form
  }

  async upload(
    files: Files,
    commitSha?: string,
    gitUrl?: string,
    debug?: boolean,
    continueFrom?: number,
    networkOverrides?: NetworkOverride[],
    rollback?: Record<string, number>
  ): Promise<FinishBatchUploadResponse> {
    // Step 1: Initialize upload with file types
    const fileTypes: Record<string, FileType> = {
      source: FileType.SOURCE,
      code: FileType.PROCESSOR
    }

    const initResponse = await this.initUpload(fileTypes)

    // Step 2: Create quilt multipart form data for all files
    const formData = this.createQuiltMultipartFormData(files)

    // Step 3: Upload all files to Walrus using Quilt API in a single PUT request
    // Get the first payload to extract the base URL and JWT token
    const firstPayload = Object.values(initResponse.payloads)[0]
    if (!firstPayload?.walrus?.putUrl || !firstPayload.walrus.jwtToken) {
      throw new Error('No Walrus put URL or JWT token found')
    }

    const uploadResponse = await fetch(firstPayload.walrus.putUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${firstPayload.walrus.jwtToken}`
      },
      body: formData
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      throw new Error(
        `Failed to upload files to Walrus: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`
      )
    }

    const walrusResponse = (await uploadResponse.json()) as {
      blobStoreResult: {
        newlyCreated?: {
          blobObject: {
            id: string
            blobId: string
          }
        }
        alreadyCertified?: {
          blob_id: string
        }
      }
      storedQuiltBlobs: Array<{
        identifier: string
        quiltPatchId: string
      }>
    }

    const updatedPayloads = { ...initResponse.payloads }
    const blobId =
      walrusResponse.blobStoreResult.alreadyCertified?.blob_id ||
      walrusResponse.blobStoreResult.newlyCreated?.blobObject.blobId

    if (!blobId) {
      throw new Error(
        'No valid response data or blobId from Walrus upload, response: ' + JSON.stringify(walrusResponse)
      )
    }

    for (const [fileKey, payload] of Object.entries(updatedPayloads)) {
      if (payload.walrus) {
        payload.walrus.blobId = blobId
        const quiltPatchId = walrusResponse.storedQuiltBlobs.find((b) => b.identifier === fileKey)?.quiltPatchId
        payload.walrus.quiltPatchId = quiltPatchId || ''
      }
    }

    // Step 5: Finish upload with SHA256 map and updated payloads
    return this.finishUpload(files, updatedPayloads, commitSha, gitUrl, debug, continueFrom, networkOverrides, rollback)
  }
}

// legacy single file upload
export async function initUpload(
  host: string,
  auth: Auth,
  projectSlug: string,
  sdkVersion: string,
  sequence: number,
  contentType?: string
) {
  const initUploadUrl = getApiUrl(`packages/cli/src/uploader.ts`, host)
  return fetch(initUploadUrl.href, {
    method: 'POST',
    headers: {
      ...auth
    },
    body: JSON.stringify({
      project_slug: projectSlug,
      sdk_version: sdkVersion,
      sequence,
      contentType
    })
  })
}

export async function finishUpload(
  options: YamlProjectConfig,
  auth: Auth,
  sha256: string,
  commitSha: string,
  gitUrl: string,
  continueFrom: number | undefined,
  sequence = 1,
  warnings?: string[]
) {
  const finishUploadUrl = getApiUrl(`/api/v1/processors/finish_upload`, options.host)
  return fetch(finishUploadUrl.href, {
    method: 'POST',
    headers: {
      ...auth
    },
    body: JSON.stringify({
      project_slug: options.project,
      cli_version: getCliVersion(),
      sdk_version: getSdkVersion(),
      sha256: sha256,
      commit_sha: commitSha,
      git_url: gitUrl,
      debug: options.debug,
      sequence,
      continueFrom,
      networkOverrides: options.networkOverrides,
      warnings
    })
  })
}
