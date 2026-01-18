import http from 'http'

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    let body = ''
    req.on('data', chunk => {
        body += chunk.toString()
    })
    req.on('end', () => {
        sendResponse(body, req, res)
    })
})

function sendResponse (body, req, res) {
    const json = {
        message: 'Hello, this is your custom JSON response!',
        status: 'success',
        event: body,
        signature: req.headers['x-paystack-signature']
    }

    res.end(JSON.stringify(json))
}

const port = 8086
server.listen(port, () => {
    console.log(`Serving custom JSON at http://localhost:${port}`)
})