/**
 * TCP proxy 0.0.0.0 -> localhost để OWASP ZAP (trong Docker) gọi được API dev
 * khi server chỉ bind localhost/::1.
 */
const http = require('http')

const LISTEN_HOST = '0.0.0.0'
const LISTEN_PORT = Number(process.env.ZAP_PROXY_PORT || 18017)
const TARGET_HOST = 'localhost'
const TARGET_PORT = Number(process.env.ZAP_PROXY_TARGET_PORT || 8017)

const server = http.createServer((clientReq, clientRes) => {
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: clientReq.url,
    method: clientReq.method,
    headers: clientReq.headers
  }

  const proxyReq = http.request(options, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(clientRes)
  })

  proxyReq.on('error', (err) => {
    clientRes.writeHead(502, { 'Content-Type': 'application/json' })
    clientRes.end(JSON.stringify({ message: err.message }))
  })

  clientReq.pipe(proxyReq)
})

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  console.log(
    `[zap-api-proxy] ${LISTEN_HOST}:${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`
  )
})
