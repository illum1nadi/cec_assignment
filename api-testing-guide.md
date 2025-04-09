# API Testing Guide for Proxyman

Below are all the HTTP calls you need to test every endpoint in your microservices stack. Copy‑paste each request into Proxyman (or your HTTP client) and fill in the placeholder values (`<ACCESS_TOKEN>`, `<REFRESH_TOKEN>`, `<USER_ID>`, `<OTHER_USER_ID>`, `<POST_ID>`, `<NOTIF_ID1>`, `<NOTIF_ID2>`) as you go.

---

## 1. Auth Service (port 4000)

### 1.1 Health Check  
```http
GET http://localhost:4000/health
```

### 1.2 Register  
```http
POST http://localhost:4000/auth/register
Headers:
  Content-Type: application/json

Body:
{
  "email": "alice@example.com",
  "password": "MyP@ssw0rd"
}
```

### 1.3 Login  
```http
POST http://localhost:4000/auth/login
Headers:
  Content-Type: application/json

Body:
{
  "email": "alice@example.com",
  "password": "MyP@ssw0rd"
}
```
**Response:**
```json
{
  "accessToken": "<ACCESS_TOKEN>",
  "refreshToken": "<REFRESH_TOKEN>"
}
```

### 1.4 Refresh Token  
```http
POST http://localhost:4000/auth/refresh
Headers:
  Content-Type: application/json

Body:
{
  "refreshToken": "<REFRESH_TOKEN>"
}
```
**Response:**
```json
{
  "accessToken": "<NEW_ACCESS_TOKEN>"
}
```

---

## 2. User Service (port 4001)

### 2.1 Health Check  
```http
GET http://localhost:4001/health
```

### 2.2 Create Profile  
```http
POST http://localhost:4001/users
Headers:
  Content-Type: application/json
  Authorization: Bearer <ACCESS_TOKEN>

Body:
{
  "name": "Alice",
  "bio": "Hello, I'm Alice",
  "avatarUrl": "https://example.com/alice.jpg"
}
```
**Response contains** `"userId": "<USER_ID>"`

### 2.3 View Profile  
```http
GET http://localhost:4001/users/<USER_ID>
```

### 2.4 Update Profile  
```http
PUT http://localhost:4001/users/<USER_ID>
Headers:
  Content-Type: application/json
  Authorization: Bearer <ACCESS_TOKEN>

Body:
{
  "bio": "Updated bio!",
  "avatarUrl": "https://example.com/alice-new.jpg"
}
```

### 2.5 Follow Another User  
```http
POST http://localhost:4001/users/<OTHER_USER_ID>/follow
Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```
**Response:**
```json
{ "message": "Followed" }
```

---

## 3. Post Service (port 4002)

### 3.1 Health Check  
```http
GET http://localhost:4002/health
```

### 3.2 Create Post  
```http
POST http://localhost:4002/posts
Headers:
  Content-Type: application/json
  Authorization: Bearer <ACCESS_TOKEN>

Body:
{
  "content": "Hello world!",
  "mediaUrls": ["https://example.com/image.jpg"]
}
```
**Response contains** `"_id": "<POST_ID>"`

### 3.3 Get All Posts by User  
```http
GET http://localhost:4002/posts?userId=<USER_ID>
```

### 3.4 Get Feed  
```http
GET http://localhost:4002/posts/feed
Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```

### 3.5 Like / Unlike a Post  
```http
POST http://localhost:4002/posts/<POST_ID>/like
Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```
**Response:**
```json
{ "likes": 1 }
```

### 3.6 Delete Post  
```http
DELETE http://localhost:4002/posts/<POST_ID>
Headers:
  Authorization: Bearer <ACCESS_TOKEN>
```
**Response:**
```json
{ "message": "Deleted" }
```

---

## 4. Notification Service (port 4003)

### 4.1 Health Check  
```http
GET http://localhost:4003/health
```

### 4.2 Emit a Notification  
```http
POST http://localhost:4003/notify
Headers:
  Content-Type: application/json

Body:
{
  "userId": "<USER_ID>",
  "type": "new_follower",
  "payload": { "from": "<OTHER_USER_ID>" }
}
```
**Response contains** the notification object with `"_id": "<NOTIF_ID1>"`

### 4.3 Fetch Unread Notifications  
```http
GET http://localhost:4003/notifications/<USER_ID>
```

### 4.4 Acknowledge (Mark as Read)  
```http
PUT http://localhost:4003/notifications/<USER_ID>/ack
Headers:
  Content-Type: application/json

Body:
{
  "notificationIds": ["<NOTIF_ID1>", "<NOTIF_ID2>"]
}
```
**Response:**
```json
{ "message": "Acknowledged" }
```

### 4.5 Update Notification Preferences  
```http
PUT http://localhost:4003/prefs/<USER_ID>
Headers:
  Content-Type: application/json

Body:
{
  "email": {
    "new_follower": false,
    "post_like": true,
    "comment": true
  },
  "inApp": {
    "new_follower": true,
    "post_like": true,
    "comment": false
  }
}
```
**Response:** updated preferences object

---

Use this guide to configure and run each request in Proxyman. Replace placeholder values with actual tokens and IDs as you test.
