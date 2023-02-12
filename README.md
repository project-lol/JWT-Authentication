# JWT Authentication Project

> JWT를 더 깊이 이해하기 위한 프로젝트입니다. 그전까지는 클라이언트 입장에서만 JWT를 사용해봤었는데, 이번 프로젝트를 통해 서버에서 JWT를 사용하는 방법을 알게 되었습니다.

## What I Learned

- session cookie와 JWT의 차이점
- 서버에서 토큰을 생성하는 방법
- 클라이언트에서 보낸 토큰을 서버가 인증하는 방법
- refresh token을 이용한 토큰 재발급
- 클라이언트 package.json에 proxy 설정하기
- 클라이언트에서 자동으로 refresh token을 보내는 방법

<br>

### Session Cookie

- Session Cookie는 서버에서 클라이언트에게 발급하는 쿠키로, 클라이언트가 서버에 요청을 보낼 때마다 서버는 쿠키를 함께 보내준다.
- 세션은 서버에 저장되는 정보이다. 유저가 로그인 할 때마다 서버는 유저의 정보를 세션에 저장한다. 이 방식의 문제점은 서버에 저장되는 정보가 많아지면 서버의 부하가 커진다.
- 또한 이런 방식은 stateless한 서버를 구축하기 어렵다. 서버는 클라이언트의 요청을 처리하기 위해 클라이언트의 상태를 알아야하는데, 이 상태를 저장하기 위해 서버에 저장되는 정보가 필요하다. 이런 방식은 서버의 부하가 커지고, 서버를 확장하기 어렵다.

<br>

### JWT

- JWT는 JSON Web Token의 약자로, JSON을 이용해 토큰을 생성하는 방식이다. 이것은 처음에 어디에도 저장되지 않는다. 유저가 로그인을 했을 때, 서버는 유저의 정보를 토큰에 담아서 클라이언트에게 보내준다.
- 그리고 클라이언트는 헤더에 토큰을 담아서 서버에 요청을 보낸다. 서버는 토큰을 검증하고, 토큰에 담긴 정보를 통해 클라이언트를 식별한다.
- JWT는 3가지 파트로 이루어져있는데, 헤더, 페이로드, 서명으로 이루어져있다. 헤더는 토큰의 타입과 해싱 알고리즘을 담고있다. 페이로드는 토큰에 담길 정보를 담고있다. 서명은 헤더와 페이로드를 합쳐서 비밀키로 해싱한 것이다. 서명은 토큰이 변조되지 않았는지 검증하기 위해 사용된다.

<br>

### 서버에서 토큰을 생성하는 방법

- 이전까지는 서버에서 어떻게 토큰을 생성하는지에 대해서 무지했다. 하지만, 이번 프로젝트를 통해 서버에서 토큰을 생성하는 방법을 알게되었다. 서버에서 토큰을 생성하는 방법은 다음과 같다.

```js
const jwt = require('jsonwebtoken');
...
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
```

- 위 코드는 서버에서 토큰을 생성하는 코드이다. `jwt.sign()`을 통해 토큰을 생성한다. 첫번째 인자로는 토큰에 담길 정보를 넣고, 두번째 인자로는 비밀키를 넣는다. 이 비밀키는 서버에서만 알고있어야한다. 클라이언트가 이 비밀키를 알고있다면, 토큰을 변조할 수 있기 때문이다.
- `jwt.sign()`을 통해 토큰을 생성하면, 토큰이 생성된다. 이 토큰은 클라이언트에게 보내줘야한다. 클라이언트는 이 토큰을 헤더에 담아서 서버에 요청을 보낸다.
- 위 코드에선 유저가 로그인을 하면 username과 password가 존재하는지 확인한다. 존재한다면, 토큰을 생성하고, 클라이언트에게 보내준다.

<br>

### 클라이언트에서 보낸 토큰을 서버가 인증하는 방법

- 이번 프로젝트를 통해 클라이언트에서 보낸 토큰을 서버가 인증하는 방법을 알게되었다.
- 먼저 클라이언트는 요청을 보낼 때 헤더에 토큰을 담아서 보낸다. 이때 Bearer를 입력해주어야 한다.
- 서버는 클라이언트가 보낸 토큰을 검증한다. 검증하는 방법은 다음과 같다.

```js
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
```

- 위 코드는 클라이언트가 보낸 토큰을 검증하는 코드이다. `jwt.verify()`를 통해 토큰을 검증한다. 첫번째 인자로는 토큰을 넣고, 두번째 인자로는 비밀키를 넣는다.
- `jwt.verify()`를 통해 토큰을 검증하면, 토큰에 담긴 정보를 `req.user`에 담아서 다음 미들웨어로 넘겨준다.

<br>

### 토큰을 담을 떄 Bearer를 명시해주는 이유

- Bearer 키워드는 인증의 종류를 명시하는 것이다. Bearer를 명시해줌으로써, Bearer Token authentication이라는 인증 방식을 사용한다는 것을 알 수 있다.

<br>

### Refresh Token

- Refresh Token은 Access Token이 만료되었을 때, 새로운 Access Token을 발급받기 위해 사용하는 토큰이다.
- 처음에 accessToken을 보낼 때, refreshToken도 같이 보내준다. 그리고, accessToken이 만료되면, 클라이언트는 refresh api로 body에 refreshToken을 담아서 보낸다. 서버는 refreshToken을 검증하고, 새로운 accessToken을 발급해준다. 새로운 accessToken을 발급할 때, 새로운 refreshToken도 발급해준다.
- 이전에 사용했던 refresh token은 인증을하고나면, 서버에서는 삭제해준다. 때문에, 한번 사용한 refresh token은 다시 사용할 수 없다.
- refresh token을 사용하는 방법은 아래와 같다.

```js
const generateRefreshToken = user => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    "myRefreshSecretKey",
    { expiresIn: "15m" }
  )
}
```

- 먼저 refresh token을 생성하는 함수를 만든다. `jwt.sign()`을 통해 refresh token을 생성한다. 첫번째 인자로는 토큰에 담길 정보를 넣고, 두번째 인자로는 비밀키를 넣는다. 세번째 인자로는 토큰의 유효기간을 넣는다.

```js
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
```

- 처음 로그인을 할 때, accessToken과 refreshToken을 생성한다. refreshToken은 refreshTokens 배열에 담아둔다. refreshToken을 배열에 담든, db에 담든 상관없다.

```js
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
```

- 유저가 refreshtoken api를 호출하면, 유저가 보낸 refreshToken을 검증한다. 검증이 끝나면, 새로운 accessToken과 refreshToken을 발급해준다. 새로운 refreshToken은 refreshTokens 배열에 담아둔다.

<br>

### 클라이언트 package.json에 명시된 proxy

- package.json에 명시된 proxy는 axios를 사용할 때, url을 생략할 수 있게 해준다. 예를 들어, `http://localhost:3001/api/users`를 `api/users`로 사용할 수 있다.

```js
{
  "name": "my-app",
  "version": "1.0.0",
  ...
  "proxy": "http://localhost:3001"
}

```

<br>

### 클라이언트에서 자동으로 refreshToken을 호출하는 방법

- 클라이언트에서 자동으로 refreshToken을 호출하는 방법은 axios의 interceptor를 사용하는 것이다. interceptor는 axios를 사용할 때, 요청을 보내기 전에, 요청을 보낸 후에, 요청을 보내기 전에, 요청을 보낸 후에, 특정 작업을 할 수 있다. interceptor를 사용하면, accessToken이 만료되었을 때, refreshToken을 호출해서, 새로운 accessToken을 발급받을 수 있다.

```js
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
```
