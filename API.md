# API Documentation

## Authentication

All API endpoints require authentication unless specified otherwise.

### Headers

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

## Endpoints

### Podcasts

#### Create Series

```http
POST /api/podcasts/series
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "slug": "string",
  "artwork": "string?",
  "author": "string",
  "language": "string",
  "explicit": "boolean"
}

Response: 201 Created
{
  "id": "string",
  "title": "string",
  ...
}
```

#### Create Episode

```http
POST /api/podcasts/episodes
Content-Type: application/json

{
  "title": "string",
  "description": "string",
  "audioUrl": "string",
  "seriesId": "string",
  "explicit": "boolean"
}

Response: 201 Created
{
  "id": "string",
  "title": "string",
  ...
}
```

### Content Management

#### Create Post

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

### User Management

#### Update Profile

```http
PUT /api/user/profile
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "email": "string"
}

Response: 200 OK
{
  "id": "string",
  "firstName": "string",
  ...
}
```

See individual endpoint documentation for complete details.