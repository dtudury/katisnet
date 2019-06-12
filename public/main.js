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
}

const balls = []
for (let i = 0; i < 20; i++) {
  balls.push(new Ball(i))
}
for (let i = 0; i < 20; i++) {
  let pairs = new Set()
  while (pairs.size < 2) {
    let j = Math.floor(Math.random() * 20)
    if (j !== i && balls[j].connections.indexOf(balls[i]) === -1) {
      pairs.add(j)
    }
  }
  pairs.forEach(j => {
    balls[i].connections.push(balls[j])
    balls[j].connections.push(balls[i])
  })
}

function drawBall (ctx, ball) {
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, 10, 0, 2 * Math.PI)
  ctx.arc(ball.x, ball.y, 9, 0, 2 * Math.PI, true)
  ctx.closePath()
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

function improve () {
  const sortedBalls = balls.sort((a, b) => a.connections.length - b.connections.length)
  let ball
  if (Math.random() > 0.5) {
    ball = sortedBalls[sortedBalls.length - 1]
    while (ball.connections.length > 3) {
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
      }
    }
  }
}

setInterval(improve, 1000)

document.body.onresize = draw
draw()
