const cluster = require("cluster")
const http = require("http")
const os = require("os")

cluster.setupPrimary({
    exec: "./app.js"
})

let worker_pool = []
let num_cpus = os.cpus().length
for (let i = 0; i < num_cpus; i++) {
    worker_pool[i] = cluster.fork()
}

cluster.on("message", (worker, data) => {
    for (let i = 0; i < worker_pool.length; i++) {
        if ((worker.id - 1) != i) {
            worker_pool[i].send(data)
        }
    }
})

let last_requested = 0;
const port = process.env.PORT || 3000

let balancer = http.createServer((req, res) => {

    last_requested = (last_requested + 1) % num_cpus
    console.log(`req goes to port ${port + last_requested + 1}`)
    let proxy_req = http.request({
        host: '127.0.0.1',
        port: port + last_requested + 1,
        method: req.method,
        path: req.url,
        headers: req.headers
    }, proxy_res => {
        res.writeHead(proxy_res.statusCode, proxy_res.headers)
        proxy_res.pipe(res)
    })

    req.pipe(proxy_req)
})

balancer.listen(port, () => {
    console.log("Load Balancer started !")
})
