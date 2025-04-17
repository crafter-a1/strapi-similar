# CMS Backend API Documentation

## Base URL
All APIs are prefixed with: `http://localhost:8080/api`

## Authentication APIs
Base path: `/auth`

### Login
- **Endpoint**: `POST /auth/login`
- **Purpose**: Authenticate user and get JWT token
- **Usage**: Login page, authentication
- **Request Body**:
  ```json
  {
    "username": "user",
    "password": "password"
  }
  ```
- **Response**: JWT token for authentication

### Register
- **Endpoint**: `POST /auth/signup`
- **Purpose**: Register new user
- **Usage**: Registration page
- **Request Body**:
  ```json
  {
    "username": "user",
    "email": "user@example.com",
    "password": "password"
  }
  ```

## Collection APIs
Base path: `/collections`

### Get All Collections
- **Endpoint**: `GET /collections`
- **Purpose**: Retrieve all collections
- **Usage**: Collections listing page, dashboard
- **Auth Required**: Yes

### Get Collection Details
- **Endpoint**: `GET /collections/details`
- **Purpose**: Get collections with components, fields, and configs
- **Usage**: Collection detail view, editing page
- **Auth Required**: Yes

### Get Collection by ID
- **Endpoint**: `GET /collections/{id}/details`
- **Purpose**: Get specific collection details
- **Usage**: Collection detail/edit page
- **Auth Required**: Yes

### Get Collection by API ID
- **Endpoint**: `GET /collections/api/{apiId}`
- **Purpose**: Get collection using API ID
- **Usage**: Frontend content rendering
- **Auth Required**: Yes

### Create Collection
- **Endpoint**: `POST /collections`
- **Purpose**: Create new collection
- **Usage**: Collection creation page
- **Auth Required**: Yes

### Update Collection
- **Endpoint**: `PUT /collections/{id}`
- **Purpose**: Update existing collection
- **Usage**: Collection edit page
- **Auth Required**: Yes

### Delete Collection
- **Endpoint**: `DELETE /collections/{id}`
- **Purpose**: Delete collection
- **Usage**: Collection management
- **Auth Required**: Yes

## Component APIs
Base path: `/components`

### Get All Components
- **Endpoint**: `GET /components`
- **Purpose**: List all components
- **Usage**: Component library, component selector
- **Auth Required**: Yes

### Get Active Components
- **Endpoint**: `GET /components/active`
- **Purpose**: Get only active components
- **Usage**: Component selector in content creation
- **Auth Required**: Yes

### Get Component by ID
- **Endpoint**: `GET /components/{id}`
- **Purpose**: Get specific component details
- **Usage**: Component detail view
- **Auth Required**: Yes

### Get Component by API ID
- **Endpoint**: `GET /components/api/{apiId}`
- **Purpose**: Get component using API ID
- **Usage**: Frontend rendering
- **Auth Required**: Yes

## Field Type APIs
Base path: `/field-types`

### Get All Field Types
- **Endpoint**: `GET /field-types`
- **Purpose**: List all field types
- **Usage**: Field type selector, configuration
- **Auth Required**: Yes

### Get Active Field Types
- **Endpoint**: `GET /field-types/active`
- **Purpose**: Get only active field types
- **Usage**: Field type selector in content creation
- **Auth Required**: Yes

## Content Entry APIs
Base path: `/content-entries`

### Get All Content Entries
- **Endpoint**: `GET /content-entries`
- **Purpose**: List all content entries
- **Usage**: Content listing page
- **Auth Required**: Yes

### Get Content Entry by ID
- **Endpoint**: `GET /content-entries/{id}`
- **Purpose**: Get specific content entry
- **Usage**: Content detail view
- **Auth Required**: Yes

### Get Entries by Collection
- **Endpoint**: `GET /content-entries/collection/{collectionId}`
- **Purpose**: Get entries for specific collection
- **Usage**: Collection content listing
- **Auth Required**: Yes

## Public APIs
Base path: `/public`

### Get Public Collections
- **Endpoint**: `GET /public/collections`
- **Purpose**: Get collections without authentication
- **Usage**: Public content rendering
- **Auth Required**: No

### Get Public Simplified Collections
- **Endpoint**: `GET /public/simplified-collections`
- **Purpose**: Get simplified collection format
- **Usage**: Public content rendering, headless CMS
- **Auth Required**: No

## Simplified Collection APIs
Base path: `/simplified-collections`

### Get All Simplified Collections
- **Endpoint**: `GET /simplified-collections`
- **Purpose**: Get collections in simplified format
- **Usage**: Content preview, simplified views
- **Auth Required**: Yes

### Get Simplified Collection by API ID
- **Endpoint**: `GET /simplified-collections/api/{apiId}`
- **Purpose**: Get specific collection in simplified format
- **Usage**: Content preview, simplified views
- **Auth Required**: Yes

## Notes
- All authenticated endpoints require JWT token in Authorization header:
  ```
  Authorization: Bearer <token>
  ```
- Error responses follow standard HTTP status codes
- API documentation available at: `/api/swagger-ui.html`