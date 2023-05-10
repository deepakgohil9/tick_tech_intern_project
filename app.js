const http = require('http')
const cluster = require('cluster')
const { get_one, get_all, create, update, remove } = require("./controllers/user")

const server = http.createServer((req, res) => {
    const { method, url } = req
    if (method === 'GET' && url === '/users') {
        get_all(req, res)
    }
    else if (method === 'GET' && /^\/users\/[\w\d]+$/.test(url)) {
        get_one(req, res)
    }
    else if (method === 'POST' && url === '/users') {
        try {
            create(req, res)
        } catch (error) {
            res.statusCode = 500
            res.end('internal server error occured')
        }
    }
    else if (method === 'PUT' && /^\/users\/[\w\d]+$/.test(url)) {
        update(req, res)
    }
    else if (method === 'DELETE' && /^\/users\/[\w\d]+$/.test(url)) {
        remove(req, res)
    } else {
        res.statusCode = 404
        res.end('Not found')
    }
})

let port = (process.env.PORT || 3000)
if (cluster.worker) {
    port += cluster.worker.id
}
server.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})


