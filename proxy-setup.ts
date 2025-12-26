import { type Dispatcher, ProxyAgent } from 'undici'

const { fetch: originalFetch } = global

const proxyAgent = new ProxyAgent('http://127.0.0.1:7890/')

global.fetch = (
  url: string | URL | Request,
  opts: RequestInit & { dispatcher?: Dispatcher } = {}
) => {
  // 只对特定域名使用代理
  // const urlStr = url.toString();

  // 排除本地 API 请求
  // if (urlStr.includes(":3008/api/")) {
  //   return originalFetch(url, opts);
  //}

  // 请求使用代理
  opts.dispatcher = proxyAgent

  try {
    return originalFetch(url, opts)
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}
