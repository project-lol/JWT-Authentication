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

app.post("/api/login", (req, res) => {
  const { username, password } = req.body
  const user = users.find(
    u => u.username === username && u.password === password
  )
  if (user) {
    // Generate an access token
    const acsessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      "mySecretKey"
    )
    res.json({ username: user.username, isAdmin: user.isAdmin, acsessToken })
  } else {
    res.status(400).json("Wrong username or password!")
  }
})

app.listen(9000, () => console.log("Backend server is running!"))
