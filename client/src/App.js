import "./app.css"
import axios from "axios"
import { useState } from "react"
import jwt_decode from "jwt-decode"

function App() {
  return (
    <div className="container">
      <div className="home">
        <span>Delete Users:</span>
        <button className="deleteButton">Delete John</button>
        <button className="deleteButton">Delete Jane</button>
        {/* {error && (
          <span className="error">
            You are not allowed to delete this user!
          </span>
        )}
        {success && (
          <span className="success">User has been deleted successfully...</span>
        )} */}
      </div>
      {/* <div className="login">
        <form>
          <span className="formTitle">Lama Login</span>
          <input type="text" placeholder="username" />
          <input type="password" placeholder="password" />
          <button type="submit" className="submitButton">
            Login
          </button>
        </form>
      </div> */}
    </div>
  )
}
