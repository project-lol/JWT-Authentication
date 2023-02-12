const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")
app.use(express.json())

const users = [
  {
    id: "1",
    username: "john",
    password: "john123",
    isAdmin: true,
  },
  {
    id: "2",
    username: "jane",
    password: "jane123",
    isAdmin: false,
  },
]

let refreshTokens = []

app.post("/api/refreshtoken", (req, res) => {
  // take the refresh token from the user
  const refreshToken = req.body.token

  // send error if there is no token or it is invalid
  if (!refreshToken) return res.status(401).json("You are not authenticated!")
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json("Refresh token is not valid!")

  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    err && console.log(err)
    refreshTokens = refreshTokens.filter(token => token !== refreshToken) // remove the token from the array

    const newAccessToken = generateAccessToken(user) // generate new access token
    const newRefreshToken = generateRefreshToken(user) // generate new refresh token

    refreshTokens.push(newRefreshToken) // add new refresh token to the array

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  })
  // if everything is ok, create new access token, refresh token and send to the user
})

const generateAccessToken = user => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "mySecretKey", {
    expiresIn: "15m",
  })
}

const generateRefreshToken = user => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "myRefreshSecretKey",
    { expiresIn: "15m" }
  )
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body
  const user = users.find(
    u => u.username === username && u.password === password
  )
  if (user) {
    // Generate an access token
    const acsessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    refreshTokens.push(refreshToken)

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      acsessToken,
      refreshToken,
    })
  } else {
    res.status(400).json("Wrong username or password!")
  }
})

const verify = (req, res, next) => {
  // 클라이언트에서 헤더에 토큰을 담아서 보내오면 그 토큰을 검증한다.
  const authHeader = req.headers.authorization
  if (authHeader) {
    const token = authHeader.split(" ")[1]

    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json("Token is not valid!")
      }
      req.user = user
      next()
    })
  } else {
    res.status(401).json("You are not authenticated!")
  }
}

app.delete("/api/users/:id", verify, (req, res) => {
  if (req.user.id === req.params.id || req.user.isAdmin) {
    res.status(200).json("User has been deleted!")
  } else {
    res.status(403).json("You are not allowed to delete this user!")
  }
})

app.listen(9000, () => console.log("Backend server is running!"))
