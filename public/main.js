const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight

class Ball {
  constructor () {
    this.x = canvas.width * Math.random()
    this.y = canvas.height * Math.random()
    this.dx = 0
    this.dy = 0
    this.connections = []
  }
  update1 () {
    balls.forEach(ball => {
      if (ball !== this) {
        const dx = this.x - ball.x
        const dy = this.y - ball.y
        const d = dx * dx + dy * dy
        this.dx += dx * Math.pow(d, -1) * 5
        this.dy += dy * Math.pow(d, -1) * 5
      }
    })
    this.connections.forEach(ball => {
      const dx = this.x - ball.x
      const dy = this.y - ball.y
      // const d = Math.sqrt(dx * dx + dy * dy)
      // this.dx -= dx * 0.01
      // this.dy -= dy * 0.01
      const d = dx * dx + dy * dy
      this.dx -= dx * Math.pow(d, 0.5) * 0.0001
      this.dy -= dy * Math.pow(d, 0.5) * 0.0001
    })
    const cx = canvas.width / 2 - this.x
    const cy = canvas.height / 2 - this.y
    const c = Math.sqrt(cx * cx + cy * cy)
    this.dx += cx * c * 0.00001
    this.dy += cy * c * 0.00001
    this.dx *= 0.99
    this.dy *= 0.99
  }
  update2 () {
    this.x += this.dx
    this.y += this.dy
  }
}

const balls = []
const connections = []
for (let i = 0; i < 20; i++) {
  balls.push(new Ball())
}
for (let i = 0; i < 20; i++) {
  let pairs = new Set()
  while (pairs.size < 1) {
    let j = Math.floor(Math.random() * 20)
    if (j !== i && balls[j].connections.indexOf(balls[i]) === -1) {
      pairs.add(j)
    }
  }
  pairs.forEach(j => {
    connections.push([balls[i], balls[j]])
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
  balls.forEach(ball => ball.update1())
  balls.forEach(ball => ball.update2())
  balls.forEach(ball => drawBall(ctx, ball))
  connections.forEach(connection => drawConnection(ctx, connection[0], connection[1]))
  window.requestAnimationFrame(draw)
}

document.body.onresize = draw
draw()
