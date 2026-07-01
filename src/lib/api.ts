import type { ApiConfig, GenerateParams, EditParams } from '@/types'

const USE_PROXY = import.meta.env.DEV

function buildHeaders(config: ApiConfig, targetUrl: string) {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json',
  }
  if (USE_PROXY) {
    headers['X-Target-Url'] = targetUrl
  }
  return headers
}

function getBaseUrl(config: ApiConfig) {
  return config.baseUrl.replace(/\/+$/, '')
}

function getRequestUrl(targetUrl: string) {
  if (USE_PROXY) {
    return '/cors-proxy'
  }
  return targetUrl
}

export async function testConnection(config: ApiConfig): Promise<boolean> {
  try {
    const targetUrl = `${getBaseUrl(config)}/models`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(getRequestUrl(targetUrl), {
      headers: buildHeaders(config, targetUrl),
      signal: controller.signal,
    })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}

function parseResponse(res: Response) {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) {
    throw new Error(`API 返回了非 JSON 响应，请检查 Base URL 是否正确（需要包含 /v1）`)
  }
  return res.json()
}

export async function generateImage(
  config: ApiConfig,
  params: GenerateParams
): Promise<string[]> {
  const hasRefImages = params.referenceImages && params.referenceImages.length > 0

  if (hasRefImages) {
    const imageDataUrls = await Promise.all(
      params.referenceImages!.map((f) => fileToBase64DataUrl(f))
    )

    const images = imageDataUrls.map((url) => ({ type: 'base64', image_url: url }))
    const body: Record<string, unknown> = {
      model: config.model,
      prompt: params.prompt,
      size: params.size,
      images: images,
    }
    if (params.quality !== 'auto') body.quality = params.quality
    if (params.background !== 'auto') body.background = params.background
    if (params.outputFormat !== 'png') body.output_format = params.outputFormat

    const targetUrl = `${getBaseUrl(config)}/images/generations`
    const res = await fetch(getRequestUrl(targetUrl), {
      method: 'POST',
      headers: buildHeaders(config, targetUrl),
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await parseResponse(res).catch(() => ({}))
      throw new Error(err?.error?.message || `API Error: ${res.status}`)
    }

    const data = await parseResponse(res)
    return data.data.map((item: { b64_json?: string; url?: string }) => {
      if (item.b64_json) return `data:image/${params.outputFormat};base64,${item.b64_json}`
      return item.url!
    })
  }

  const body: Record<string, unknown> = {
    model: config.model,
    prompt: params.prompt,
    n: params.n,
    size: params.size,
  }
  if (params.quality !== 'auto') body.quality = params.quality
  if (params.background !== 'auto') body.background = params.background
  if (params.outputFormat !== 'png') body.output_format = params.outputFormat

  const targetUrl2 = `${getBaseUrl(config)}/images/generations`
  const res = await fetch(getRequestUrl(targetUrl2), {
    method: 'POST',
    headers: buildHeaders(config, targetUrl2),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await parseResponse(res).catch(() => ({}))
    throw new Error(err?.error?.message || `API Error: ${res.status}`)
  }

  const data = await parseResponse(res)
  return data.data.map((item: { b64_json?: string; url?: string }) => {
    if (item.b64_json) return `data:image/${params.outputFormat};base64,${item.b64_json}`
    return item.url!
  })
}

function fileToBase64DataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export async function editImage(
  config: ApiConfig,
  params: EditParams
): Promise<string[]> {
  const targetUrl = `${getBaseUrl(config)}/images/edits`

  const imageDataUrls: string[] = []
  if (params.image) imageDataUrls.push(await fileToBase64DataUrl(params.image))
  for (const file of params.referenceImages) {
    imageDataUrls.push(await fileToBase64DataUrl(file))
  }

  const images = imageDataUrls.map((url) => ({ type: 'base64', image_url: url }))

  const body: Record<string, unknown> = {
    model: config.model,
    prompt: params.prompt,
    size: params.size,
  }
  if (images.length > 0) body.images = images
  if (params.quality !== 'auto') body.quality = params.quality
  if (params.outputFormat !== 'png') body.output_format = params.outputFormat

  const res = await fetch(getRequestUrl(targetUrl), {
    method: 'POST',
    headers: buildHeaders(config, targetUrl),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await parseResponse(res).catch(() => ({}))
    throw new Error(err?.error?.message || `API Error: ${res.status}`)
  }

  const data = await parseResponse(res)
  return data.data.map((item: { b64_json?: string; url?: string }) => {
    if (item.b64_json) return `data:image/${params.outputFormat};base64,${item.b64_json}`
    return item.url!
  })
}
