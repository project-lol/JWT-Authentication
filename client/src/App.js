import "./app.css"
import axios from "axios"
import { useState } from "react"
import jwt_decode from "jwt-decode"

function App() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [success, setSucess] = useState(false)

  const refreshToken = async () => {
    try {
      const res = await axios.post("/refresh", { token: user.refreshToken })
      setUser({
        ...user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      })
    } catch (err) {
      console.log(err)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const res = await axios.post("/login", { username, password })
      setUser(res.data)
      return res.data
    } catch (err) {
      setError(true)
    }
  }

  const axiosJWT = axios.create()

  axiosJWT.interceptors.request.use(
    async config => {
      let currentDate = new Date()
      const decodedToken = jwt_decode(user.accessToken)
      /*
      1. decodedToken.exp * 1000 : 토큰의 만료시간을 밀리초로 변환
      2. currentDate.getTime() : 현재 시간을 밀리초로 변환
      3. decodedToken.exp * 1000 < currentDate.getTime() : 토큰의 만료시간이 현재시간보다 작으면 true
      4. decodedToken.exp * 1000 > currentDate.getTime() : 토큰의 만료시간이 현재시간보다 크면 false
    */
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken()
        config.headers["authorization"] = "Bearer " + data.accessToken
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  const handleDelete = async id => {
    setError(false)
    setSucess(false)
    try {
      await axiosJWT.delete(`/users/${id}`, {
        headers: { authorization: "Bearer " + user.accessToken },
      })
      setSucess(true)
    } catch (err) {
      setError(true)
    }
  }

  return (
    <div className="container">
      {user ? (
        <div className="home">
          <span>
            Welcome to the <b>{user.isAdmin ? "admin" : "user"}</b> dashboard{" "}
            <b>{user.username}</b>.
          </span>
          <span>Delete Users:</span>
          <button className="deleteButton" onClick={() => handleDelete(1)}>
            Delete John
          </button>
          <button className="deleteButton" onClick={() => handleDelete(2)}>
            Delete Jane
          </button>
          {error && (
            <span className="error">
              You are not allowed to delete this user!
            </span>
          )}
          {success && (
            <span className="success">
              User has been deleted successfully...
            </span>
          )}
        </div>
      ) : (
        <div className="login">
          <form onSubmit={handleSubmit}>
            <span className="formTitle">Lama Login</span>
            <input
              type="text"
              placeholder="username"
              onChange={e => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="password"
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="submitButton">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
