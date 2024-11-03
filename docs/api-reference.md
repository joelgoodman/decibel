# API Reference

## Authentication

### Sign In
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "Magic link sent successfully"
}
```

### Verify Session
```http
GET /api/auth/verify?token=xxx

Response: 200 OK
{
  "user": {
    "id": "string",
    "email": "string",
    "role": "string"
  }
}
```

## Content Management

### Create Post
```http
POST /api/posts
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  "status": "draft|published|scheduled",
  "publishAt": "string?",
  "categoryIds": "string[]",
  "tagIds": "string[]"
}

Response: 201 Created
{
  "id": "string",
  "title": "string",
  ...
}
```

### Update Post
```http
PUT /api/posts/:id
Content-Type: application/json

{
  "title": "string",
  "content": "string",
  ...
}

Response: 200 OK
{
  "id": "string",
  "title": "string",
  ...
}
```

## Email Templates

### Create Template
```http
POST /api/admin/email/templates
Content-Type: application/json

{
  "name": "string",
  "subject": "string",
  "content": "string",
  "variables": "string[]"
}

Response: 201 Created
{
  "id": "string",
  "name": "string",
  ...
}
```

### Preview Template
```http
POST /api/admin/email/templates/:id/preview
Content-Type: application/json

{
  "variables": {
    "name": "John",
    "content": "Welcome!"
  }
}

Response: 200 OK
{
  "html": "string"
}
```

## Menu Management

### Create Menu
```http
POST /api/admin/menus
Content-Type: application/json

{
  "name": "string",
  "location": "header|footer|sidebar",
  "items": [
    {
      "label": "string",
      "type": "link|page|category|custom",
      "url": "string?",
      ...
    }
  ]
}

Response: 201 Created
{
  "id": "string",
  "name": "string",
  ...
}
```

### Update Menu Items
```http
PUT /api/admin/menus/:id/items
Content-Type: application/json

{
  "items": [
    {
      "id": "string",
      "label": "string",
      ...
    }
  ]
}

Response: 200 OK
{
  "id": "string",
  "items": [...],
  ...
}
```