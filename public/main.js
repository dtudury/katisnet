const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

class Ball {
  constructor (i) {
    this.i = i
    this.x = (canvas.width * Math.random() + canvas.width) / 3
    this.y = (canvas.height * Math.random() + canvas.height) / 3
    this.dx = 0
    this.dy = 0
    this.connections = []
  }
  accelerateToward (x, y, p, f) {
    const dx = this.x - x
    const dy = this.y - y
    const d = dx * dx + dy * dy
    this.dx += dx * Math.pow(d, p) * f
    this.dy += dy * Math.pow(d, p) * f
  }
  updateVelocity () {
    balls.forEach(ball => {
      if (ball !== this) {
        this.accelerateToward(ball.x, ball.y, -1, 5)
      }
    })
    this.connections.forEach(ball => {
      this.accelerateToward(ball.x, ball.y, 0.5, -0.0001)
    })
    this.accelerateToward(canvas.width / 2, canvas.height / 2, 0.5, -0.00001)
    this.dx *= 0.95
    this.dy *= 0.95
  }
  updatePosition () {
    this.x += this.dx
    this.y += this.dy
  }
  toString () {
    return `{ ${this.i} [ ${this.connections.map(ball => ball.i).join(', ')} ] }`
  }
}

const balls = cloneBalls([])

function cloneBalls (balls) {
  let cloned = []
  for (let i = 0; i < 20; i++) {
    cloned.push(new Ball(i))
  }
  balls.forEach((ball, index) => {
    cloned[index].connections = ball.connections.map(connection => cloned[connection.i])
  })
  return cloned
}

function printBalls (balls) {
  console.log(balls.map(ball => ball.toString()).join(', '))
}

function drawBall (ctx, ball) {
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, 10, 0, 2 * Math.PI)
  ctx.closePath()
  if (ball.i === 0) {
    ctx.fillStyle = 'red'
  } else {
    ctx.fillStyle = 'black'
    ctx.arc(ball.x, ball.y, 9, 0, 2 * Math.PI, true)
  }
  ctx.fill()
}

function drawConnection (ctx, a, b) {
  let t = Math.atan2(a.y - b.y, a.x - b.x)
  ctx.beginPath()
  ctx.arc(a.x, a.y, 10, Math.PI + t, Math.PI + t)
  ctx.arc(b.x, b.y, 10, t, t)
  ctx.closePath()
  ctx.stroke()
}

function draw () {
  if (canvas.width !== window.innerWidth) {
    canvas.width = window.innerWidth
  }
  if (canvas.height !== window.innerHeight) {
    canvas.height = window.innerHeight
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  balls.forEach(ball => ball.updateVelocity())
  balls.forEach(ball => ball.updatePosition())
  balls.forEach(ball => drawBall(ctx, ball))
  const connections = []
  balls.forEach(ball => {
    ball.connections.forEach(connection => {
      if (connection.i > ball.i) {
        connections.push([ball, connection])
      }
    })
  })
  connections.forEach(connection => drawConnection(ctx, connection[0], connection[1]))
  window.requestAnimationFrame(draw)
}

function scoreFrom (ball) {
  let complete = new Set()
  let processing = new Set([ball])
  let score = 0
  let value = 1
  let runs = 0
  while (processing.size && runs++ < 100) {
    complete = new Set([...complete, ...processing])
    let next = new Set()
    processing.forEach(ball => {
      ball.connections.forEach(connection => {
        if (!complete.has(connection)) {
          score += value
          next.add(connection)
        }
      })
    })
    processing = next
    value *= 0.5
  }
  // const sortedBalls = [...balls].sort((a, b) => a.connections.length - b.connections.length)
  // printBalls(sortedBalls)
  console.log(score, complete.size, runs)
}

const first = balls[0]

function improve () {
  const sortedBalls = [...balls].sort((a, b) => a.connections.length - b.connections.length)
  let ball
  if (Math.random() > 0.5) {
    ball = sortedBalls[sortedBalls.length - 1]
    while (ball.connections.length > 3) {
      scoreFrom(first)
      const connection = ball.connections[Math.floor(Math.random() * ball.connections.length)]
      ball.connections.splice(ball.connections.indexOf(connection), 1)
      connection.connections.splice(connection.connections.indexOf(ball), 1)
    }
  } else {
    ball = sortedBalls[0]
    while (ball.connections.length < 3) {
      const newConnection = balls[Math.floor(Math.random() * balls.length)]
      if (newConnection !== ball && ball.connections.indexOf(newConnection) === -1) {
        ball.connections.push(newConnection)
        newConnection.connections.push(ball)
        scoreFrom(first)
      }
    }
  }
}

setInterval(improve, 10)

document.body.onresize = draw
draw()
