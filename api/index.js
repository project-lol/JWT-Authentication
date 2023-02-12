const express = require("express")
const app = express()
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
    res.json(user)
  } else {
    res.status(400).json("Wrong username or password!")
  }
})

app.listen(9000, () => console.log("Backend server is running!"))
