const cluster = require("cluster")

const users = []
process.on("message", (data) => {
    if (data.action == "create") {
        users.push(data.body)
    }
    else if (data.action == "update") {
        users[data.index] = data.body
    }
    else if (data.action == "delete") {
        users.splice(data.index, 1)
    }
})

const get_all = (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(users))
}

const get_one = (req, res) => {
    const { url } = req
    let split_url = url.split('/')
    const id = Number(split_url[split_url.length - 1])
    if (isNaN(id)) {
        res.statusCode = 400
        res.end('invalid id!')
        return
    }
    const user = users.find((u) => u.id === id)

    if (user) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(user))
    } else {
        res.statusCode = 404
        res.end('User not found')
    }
}

const create = (req, res) => {
    let body = ''

    req.on('data', (chunk) => {
        body += chunk.toString()
    })

    req.on('end', () => {
        try {
            const user = JSON.parse(body)
            let is_all_set = user.username && user.age && user.hobbies
            if (!is_all_set) {
                res.statusCode = 400
                res.end('body does not contains app required fields')
                return
            }
            user.id = users.length + 1
            let new_user = {
                id: user.id,
                username: user.username,
                age: user.age,
                hobbies: user.hobbies
            }
            users.push(new_user)
            if (cluster.worker) {
                process.send({
                    action: "create",
                    body: new_user
                })
            }
            res.statusCode = 201
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(new_user))
        } catch (error) {
            console.log(error)
            res.statusCode = 500
            res.end('internal server error occured')
        }

    })
}

const update = (req, res) => {
    const { url } = req
    let split_url = url.split('/')
    const id = Number(split_url[split_url.length - 1])

    if (isNaN(id)) {
        res.statusCode = 400
        res.end('invalid id!')
        return
    }

    let body = ''

    req.on('data', (chunk) => {
        body += chunk.toString()
    })

    req.on('end', () => {
        try {
            const user = JSON.parse(body)
            const index = users.findIndex((u) => u.id === id)

            if (index !== -1) {
                users[index] = {
                    id: id,
                    username: user.username || users[index].username,
                    age: user.age || users[index].age,
                    hobbies: user.hobbies || users[index].hobbies
                }
                if (cluster.worker) {
                    process.send({
                        action: "update",
                        index: index,
                        body: users[index]
                    })
                }
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(users[index]))
            } else {
                res.statusCode = 404
                res.end('User not found')
            }
        } catch (error) {
            res.statusCode = 500
            res.end('internal server error occured')
        }

    })
}


const remove = (req, res) => {
    const { url } = req
    let split_url = url.split('/')
    const id = Number(split_url[split_url.length - 1])

    if (isNaN(id)) {
        res.statusCode = 400
        res.end('invalid id!')
        return
    }
    const index = users.findIndex((u) => u.id === id)

    if (index !== -1) {
        users.splice(index, 1)
        if (cluster.worker) {
            process.send({
                action: "delete",
                index: index
            })
        }
        res.statusCode = 204
        res.end()
    } else {
        res.statusCode = 404
        res.end('User not found')
    }
}

module.exports = { get_one, get_all, create, update, remove }