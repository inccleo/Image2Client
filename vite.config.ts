import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

function corsProxyPlugin(): Plugin {
  return {
    name: 'cors-proxy',
    configureServer(server) {
      server.middlewares.use('/cors-proxy', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400',
          })
          res.end()
          return
        }

        const targetUrl = req.headers['x-target-url'] as string
        if (!targetUrl) {
          res.writeHead(400)
          res.end('Missing x-target-url header')
          return
        }

        let body: Buffer[] = []
        req.on('data', (chunk: Buffer) => { body.push(chunk) })
        req.on('end', async () => {
          try {
            const headers: Record<string, string> = {}
            if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization'] as string
            if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'] as string

            const reqBody = Buffer.concat(body)
            const fetchRes = await fetch(targetUrl, {
              method: req.method || 'POST',
              headers,
              body: req.method !== 'GET' && reqBody.length > 0 ? reqBody : undefined,
            })

            const resHeaders: Record<string, string> = {
              'Access-Control-Allow-Origin': '*',
            }
            const ct = fetchRes.headers.get('content-type')
            if (ct) resHeaders['Content-Type'] = ct

            const responseBody = await fetchRes.arrayBuffer()
            res.writeHead(fetchRes.status, resHeaders)
            res.end(Buffer.from(responseBody))
          } catch (e: unknown) {
            res.writeHead(502)
            res.end(`Proxy error: ${e instanceof Error ? e.message : 'Unknown error'}`)
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), corsProxyPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
