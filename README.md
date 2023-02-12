# JWT Authentication Project

> JWT를 더 깊이 이해하기 위한 프로젝트입니다

## What I Learned

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
