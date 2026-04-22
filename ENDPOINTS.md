# Blogging Platform API Endpoints

This document describes all available REST API endpoints for the Blogging Platform, including request/response formats for frontend integration.

## Base URL

```
http://localhost:8080
```

---

## Table of Contents

1. [User Management](#1-user-management)
2. [Post Management](#2-post-management)
3. [Comment Management](#3-comment-management)
4. [Performance Metrics](#4-performance-metrics)

---

## Response Wrapper Format

All successful responses are wrapped in a generic response format:

```json
{
  "status": "success",
  "message": "Description of the operation result",
  "data": { ... }
}
```

### Error Response Format

```json
{
  "errorStatus": "error",
  "errorMessage": "Description of the error",
  "errorCode": 400,
  "timestamp": "2026-01-27T10:30:00.000"
}
```

---

## 1. User Management

Base path: `/api/v1/users`

### 1.1 Register User

Creates a new user account.

**Endpoint:** `POST /api/v1/users/register`

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

| Field      | Type   | Required | Validation                                      |
|------------|--------|----------|-------------------------------------------------|
| `username` | string | Yes      | 3-36 characters                                 |
| `email`    | string | Yes      | Valid email format                              |
| `password` | string | Yes      | 6-50 characters                                 |

**Response:** `201 Created`

```json
{
  "status": "success",
  "message": "User registration successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data or user already exists

---

### 1.2 Sign In User

Authenticates a user with email and password.

**Endpoint:** `POST /api/v1/users/sign-in`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

| Field      | Type   | Required | Validation          |
|------------|--------|----------|---------------------|
| `email`    | string | Yes      | Valid email format  |
| `password` | string | Yes      | 6-50 characters     |

**Response:** `200 OK`

```json
{
  "status": "success",
  "message": "User sign in successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User not found

---

## 2. Post Management

Base path: `/api/v1/posts`

### 2.1 Create Post

Creates a new blog post.

**Endpoint:** `POST /api/v1/posts`

**Request Body:**

```json
{
  "title": "My First Blog Post",
  "body": "This is the content of my blog post...",
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "tags": ["technology", "programming", "spring"]
}
```

| Field      | Type     | Required | Validation                |
|------------|----------|----------|---------------------------|
| `title`    | string   | Yes      | Cannot be blank           |
| `body`     | string   | Yes      | Cannot be blank           |
| `authorId` | string   | Yes      | Valid user ID             |
| `tags`     | string[] | No       | Array of tag names        |

**Response:** `201 Created`

```json
{
  "status": "success",
  "message": "Post created successfully",
  "data": {
    "id": 1,
    "title": "My First Blog Post",
    "body": "This is the content of my blog post...",
    "author": "johndoe",
    "authorId": "550e8400-e29b-41d4-a716-446655440000",
    "tags": ["technology", "programming", "spring"],
    "postedAt": "2026-01-27T10:30:00",
    "lastUpdated": "2026-01-27T10:30:00",
    "totalComments": 0
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Author not found

---

### 2.2 Get All Posts (Paginated)

Retrieves a paginated list of blog posts with optional filtering.

**Endpoint:** `GET /api/v1/posts`

**Query Parameters:**

| Parameter | Type     | Default       | Description                                      |
|-----------|----------|---------------|--------------------------------------------------|
| `page`    | int      | 0             | Page number (0-indexed)                          |
| `size`    | int      | 10            | Page size (max 50)                               |
| `sort`    | string   | lastUpdated   | Sort field: `id`, `createdAt`, `lastUpdated`, `title` |
| `order`   | string   | DESC          | Sort order: `ASC` or `DESC`                      |
| `author`  | string   | -             | Filter by author name                            |
| `tags`    | string[] | -             | Filter by tag names                              |
| `search`  | string   | -             | Search in title and content                      |

**Example Request:**

```
GET /api/v1/posts?page=0&size=10&sort=lastUpdated&order=DESC&tags=technology&tags=spring&search=java
```

**Response:** `200 OK`

```json
{
  "status": "success",
  "message": "Posts retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "title": "My First Blog Post",
        "body": "This is the content of my blog post...",
        "author": "johndoe",
        "authorId": "550e8400-e29b-41d4-a716-446655440000",
        "tags": ["technology", "programming", "spring"],
        "postedAt": "2026-01-27T10:30:00",
        "lastUpdated": "2026-01-27T10:30:00",
        "totalComments": 5
      }
    ],
    "page": 0,
    "size": 10,
    "sort": "lastUpdated",
    "totalElements": 100
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid pagination or sort parameters

---

### 2.3 Get Post by ID

Retrieves a single blog post by its ID.

**Endpoint:** `GET /api/v1/posts/{postId}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `postId`  | long | Post ID     |

**Response:** `200 OK`

```json
{
  "status": "success",
  "message": "Post retrieved successfully",
  "data": {
    "id": 1,
    "title": "My First Blog Post",
    "body": "This is the content of my blog post...",
    "author": "johndoe",
    "authorId": "550e8400-e29b-41d4-a716-446655440000",
    "tags": ["technology", "programming", "spring"],
    "postedAt": "2026-01-27T10:30:00",
    "lastUpdated": "2026-01-27T10:30:00",
    "totalComments": 5
  }
}
```

**Error Responses:**
- `404 Not Found` - Post not found

---

### 2.4 Update Post

Updates an existing blog post. Only the author can update their post.

**Endpoint:** `PUT /api/v1/posts/{postId}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `postId`  | long | Post ID     |

**Request Body:**

```json
{
  "title": "Updated Blog Post Title",
  "body": "Updated content of my blog post...",
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "tags": ["technology", "java", "spring-boot"]
}
```

| Field      | Type     | Required | Validation                    |
|------------|----------|----------|-------------------------------|
| `title`    | string   | No       | New title (optional)          |
| `body`     | string   | No       | New content (optional)        |
| `authorId` | string   | Yes      | Must match original author    |
| `tags`     | string[] | No       | New tags (replaces existing)  |

**Response:** `200 OK`

```json
{
  "status": "success",
  "message": "Post updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Blog Post Title",
    "body": "Updated content of my blog post...",
    "author": "johndoe",
    "authorId": "550e8400-e29b-41d4-a716-446655440000",
    "tags": ["technology", "java", "spring-boot"],
    "postedAt": "2026-01-27T10:30:00",
    "lastUpdated": "2026-01-27T11:00:00",
    "totalComments": 5
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `403 Forbidden` - Not authorized to update this post
- `404 Not Found` - Post not found

---

### 2.5 Delete Post

Deletes a blog post. Only the author can delete their post.

**Endpoint:** `DELETE /api/v1/posts/{postId}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `postId`  | long | Post ID     |

**Request Body:**

```json
{
  "authorId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field      | Type   | Required | Description                  |
|------------|--------|----------|------------------------------|
| `authorId` | string | Yes      | Must match original author   |

**Response:** `204 No Content`

```json
{
  "status": "success",
  "message": "Post deleted successfully."
}
```

**Error Responses:**
- `403 Forbidden` - Not authorized to delete this post
- `404 Not Found` - Post not found

---

## 3. Comment Management

Base path: `/api/v1/comments`

> **Note:** Comments are stored in MongoDB.

### 3.1 Add Comment to Post

Creates a new comment on a blog post.

**Endpoint:** `POST /api/v1/comments`

**Request Body:**

```json
{
  "postId": 1,
  "commentContent": "Great article! Thanks for sharing.",
  "authorId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field           | Type   | Required | Validation                |
|-----------------|--------|----------|---------------------------|
| `postId`        | long   | Yes      | Must be greater than 0    |
| `commentContent`| string | Yes      | Cannot be blank           |
| `authorId`      | string | Yes      | Valid user ID             |

**Response:** `201 Created`

```json
{
  "status": "success",
  "message": "Comment added to post successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "postId": 1,
    "author": "johndoe",
    "content": "Great article! Thanks for sharing.",
    "createdAt": "2026-01-27T10:30:00"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Post or user not found

---

### 3.2 Get All Comments for Post

Retrieves all comments associated with a specific blog post.

**Endpoint:** `GET /api/v1/comments/post/{postId}`

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `postId`  | long | Post ID     |

**Response:** `200 OK`

```json
{
  "status": "success",
  "message": "Comments for post retrieved successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "postId": 1,
      "author": "johndoe",
      "content": "Great article! Thanks for sharing.",
      "createdAt": "2026-01-27T10:30:00"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "postId": 1,
      "author": "janedoe",
      "content": "Very informative post!",
      "createdAt": "2026-01-27T11:00:00"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found` - Post not found

---

### 3.3 Get Comment by ID

Retrieves a single comment by its MongoDB ObjectId.

**Endpoint:** `GET /api/v1/comments/{commentId}`

**Path Parameters:**

| Parameter   | Type   | Description           |
|-------------|--------|-----------------------|
| `commentId` | string | MongoDB ObjectId      |

**Response:** `200 OK`

```json
{
  "status": "success",
  "message": "Comment retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "postId": 1,
    "author": "johndoe",
    "content": "Great article! Thanks for sharing.",
    "createdAt": "2026-01-27T10:30:00"
  }
}
```

**Error Responses:**
- `404 Not Found` - Comment not found

---

### 3.4 Delete Comment

Deletes a comment. Only the comment author can delete their comment.

**Endpoint:** `DELETE /api/v1/comments/{commentId}`

**Path Parameters:**

| Parameter   | Type   | Description           |
|-------------|--------|-----------------------|
| `commentId` | string | MongoDB ObjectId      |

**Request Body:**

```json
{
  "authorId": "550e8400-e29b-41d4-a716-446655440000"
}
```

| Field      | Type   | Required | Description                  |
|------------|--------|----------|------------------------------|
| `authorId` | string | Yes      | Must match comment author    |

**Response:** `204 No Content`

```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

**Error Responses:**
- `403 Forbidden` - Not authorized to delete this comment
- `404 Not Found` - Comment not found

---

## 4. Performance Metrics

Base path: `/api/metrics/performance`

### 4.1 Get All Metrics

Retrieves performance statistics for all monitored methods.

**Endpoint:** `GET /api/metrics/performance`

**Response:** `200 OK`

```json
{
  "SERVICE::createPost": {
    "callCount": 150,
    "averageExecutionTimeMs": 45.5,
    "maxExecutionTimeMs": 120,
    "minExecutionTimeMs": 10,
    "failureCount": 2,
    "failureRate": 1.33
  },
  "REPOSITORY::findById": {
    "callCount": 500,
    "averageExecutionTimeMs": 5.2,
    "maxExecutionTimeMs": 25,
    "minExecutionTimeMs": 1,
    "failureCount": 0,
    "failureRate": 0.0
  }
}
```

---

### 4.2 Get Metrics for Specific Method

Retrieves detailed performance metrics for a specific method.

**Endpoint:** `GET /api/metrics/performance/{layer}/{methodName}`

**Path Parameters:**

| Parameter    | Type   | Description                          |
|--------------|--------|--------------------------------------|
| `layer`      | string | Layer name: `SERVICE` or `REPOSITORY`|
| `methodName` | string | Method name                          |

**Example Request:**

```
GET /api/metrics/performance/SERVICE/createPost
```

**Response:** `200 OK`

```json
{
  "methodName": "SERVICE::createPost",
  "callCount": 150,
  "averageExecutionTimeMs": 45.5,
  "maxExecutionTimeMs": 120,
  "minExecutionTimeMs": 10,
  "failureCount": 2,
  "failureRate": 1.33
}
```

---

### 4.3 Get Metrics Summary

Retrieves aggregated statistics across all methods.

**Endpoint:** `GET /api/metrics/performance/summary`

**Response:** `200 OK`

```json
{
  "totalMethodsMonitored": 25,
  "totalCalls": 5000,
  "averageExecutionTimeMs": 15.5,
  "overallFailureRate": 0.5
}
```

---

### 4.4 Get Slow Methods

Retrieves methods with average execution time exceeding the threshold.

**Endpoint:** `GET /api/metrics/performance/slow`

**Query Parameters:**

| Parameter     | Type | Default | Description                |
|---------------|------|---------|----------------------------|
| `thresholdMs` | long | 1000    | Threshold in milliseconds  |

**Example Request:**

```
GET /api/metrics/performance/slow?thresholdMs=500
```

**Response:** `200 OK`

```json
{
  "threshold": 500,
  "slowMethods": [
    {
      "methodName": "SERVICE::processLargeFile",
      "averageExecutionTimeMs": 1500
    }
  ]
}
```

---

### 4.5 Get Top Slowest Methods

Retrieves the top N methods with the highest average execution times.

**Endpoint:** `GET /api/metrics/performance/top`

**Query Parameters:**

| Parameter | Type | Default | Description               |
|-----------|------|---------|---------------------------|
| `limit`   | int  | 10      | Number of methods to return|

**Example Request:**

```
GET /api/metrics/performance/top?limit=5
```

**Response:** `200 OK`

```json
{
  "limit": 5,
  "topMethods": [
    {
      "methodName": "SERVICE::processLargeFile",
      "averageExecutionTimeMs": 1500
    },
    {
      "methodName": "REPOSITORY::findAllWithPagination",
      "averageExecutionTimeMs": 250
    }
  ]
}
```

---

### 4.6 Get Metrics by Layer

Retrieves performance metrics for all methods in a specific layer.

**Endpoint:** `GET /api/metrics/performance/layer/{layer}`

**Path Parameters:**

| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `layer`   | string | Layer name: `SERVICE` or `REPOSITORY`|

**Example Request:**

```
GET /api/metrics/performance/layer/SERVICE
```

**Response:** `200 OK`

```json
{
  "layer": "SERVICE",
  "methods": {
    "createPost": {
      "callCount": 150,
      "averageExecutionTimeMs": 45.5
    },
    "updatePost": {
      "callCount": 75,
      "averageExecutionTimeMs": 35.2
    }
  }
}
```

---

### 4.7 Get Failure Statistics

Retrieves methods with their failure counts and rates.

**Endpoint:** `GET /api/metrics/performance/failures`

**Response:** `200 OK`

```json
{
  "methodsWithFailures": [
    {
      "methodName": "SERVICE::createPost",
      "failureCount": 2,
      "failureRate": 1.33
    }
  ],
  "totalFailures": 5
}
```

---

### 4.8 Export Performance Metrics

Export performance metrics to log

**Endpoint:** `POST /api/metrics/performance/export-log`

**Response:** `200 OK`

```json
{
  "status": "success",
  "message": "Metrics exported to application log"
}
```

---

### 4.9 Reset All Metrics

Clears all performance metrics data.

**Endpoint:** `DELETE /api/metrics/performance/reset`

**Response:** `200 OK`

```json
{
  "status": "success",
  "message": "All performance metrics have been reset"
}
```

---

## HTTP Status Codes Reference

| Code | Description                                        |
|------|----------------------------------------------------|
| 200  | OK - Request successful                            |
| 201  | Created - Resource successfully created            |
| 204  | No Content - Request successful, no content returned|
| 400  | Bad Request - Invalid input data                   |
| 401  | Unauthorized - Authentication failed               |
| 403  | Forbidden - Not authorized to perform action       |
| 404  | Not Found - Resource not found                     |
| 500  | Internal Server Error - Server error occurred      |

---

## Content Type

All requests and responses use:

```
Content-Type: application/json
```

---

## CORS

Cross-Origin Resource Sharing (CORS) is configured for the application. Check the application configuration for allowed origins.

---
