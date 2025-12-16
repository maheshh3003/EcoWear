# EcoWear API Documentation

**Base URL:** `http://localhost:5001/api`

---

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Routes

### Register User
**POST** `/auth/signup`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer",
  "sellerInfo": {
    "brandName": "EcoFashion",
    "businessRegistration": "REG123456",
    "phone": "+1234567890",
    "address": "123 Green Street",
    "ecoCertificate": "https://example.com/cert.pdf"
  }
}
```

**Note:** `sellerInfo` is only required when `role` is "seller"

**Response:** `201 Created`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "buyer",
  "token": "jwt_token"
}
```

---

### Login
**POST** `/auth/login`

Authenticate user and get token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "buyer",
  "sellerStatus": "verified",
  "sellerBrandName": "EcoFashion",
  "token": "jwt_token"
}
```

---

### Get Profile
**GET** `/auth/profile`

Get current user's profile. **Requires Authentication**

**Response:** `200 OK`
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "buyer",
  "phone": "+1234567890",
  "address": "123 Green Street"
}
```

---

### Update Profile
**PUT** `/auth/profile`

Update current user's profile. **Requires Authentication**

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+0987654321",
  "address": "456 Eco Lane",
  "city": "Green City",
  "pincode": "12345"
}
```

**Response:** `200 OK`
```json
{
  "_id": "user_id",
  "name": "John Updated",
  "email": "john@example.com",
  "phone": "+0987654321"
}
```

---

## Products Routes

### Get All Products
**GET** `/products`

Get all products with optional filtering.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| category | string | Filter by category |
| material | string | Filter by material |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |

**Response:** `200 OK`
```json
[
  {
    "_id": "product_id",
    "name": "Bamboo Classic Tee",
    "description": "Eco-friendly bamboo t-shirt",
    "price": 799,
    "material": "bamboo",
    "category": "clothing",
    "images": ["url1", "url2"],
    "carbonFootprint": 2.1,
    "seller": "seller_id",
    "stock": 50
  }
]
```

---

### Get Product by ID
**GET** `/products/:id`

**Response:** `200 OK`
```json
{
  "_id": "product_id",
  "name": "Bamboo Classic Tee",
  "description": "Eco-friendly bamboo t-shirt",
  "price": 799,
  "seller": {
    "_id": "seller_id",
    "name": "EcoFashion",
    "email": "seller@example.com"
  }
}
```

---

### Create Product
**POST** `/products`

Create a new product. **Requires Verified Seller**

**Request Body:**
```json
{
  "name": "Bamboo Classic Tee",
  "description": "Ultra-soft bamboo fabric t-shirt",
  "price": 799,
  "material": "bamboo",
  "category": "clothing",
  "images": ["url1", "url2", "url3", "url4"],
  "carbonFootprint": 2.1,
  "stock": 50,
  "sizes": ["S", "M", "L", "XL"],
  "gender": "male",
  "age": "adult"
}
```

**Response:** `201 Created`

---

### Update Product
**PUT** `/products/:id`

Update a product. **Requires Verified Seller (owner)**

**Request Body:** Same as Create Product

**Response:** `200 OK`

---

### Delete Product
**DELETE** `/products/:id`

Delete a product. **Requires Verified Seller (owner)**

**Response:** `200 OK`
```json
{
  "message": "Product removed"
}
```

---

### Get My Products (Seller)
**GET** `/products/seller/my-products`

Get all products for the logged-in seller. **Requires Verified Seller**

**Response:** `200 OK`
```json
[
  {
    "_id": "product_id",
    "name": "Bamboo Classic Tee",
    "price": 799,
    "stock": 50,
    "sold": 10
  }
]
```

---

## Orders Routes

### Create Order
**POST** `/orders`

Create a new order. **Requires Authentication**

**Request Body:**
```json
{
  "items": [
    {
      "product": "product_id",
      "name": "Bamboo Classic Tee",
      "quantity": 2,
      "price": 799,
      "size": "M",
      "image": "image_url"
    }
  ],
  "totalAmount": 1880,
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Green Street",
    "city": "Eco City",
    "pincode": "12345",
    "phone": "+1234567890"
  },
  "paymentMethod": "card"
}
```

**Response:** `201 Created`
```json
{
  "_id": "order_id",
  "user": "user_id",
  "items": [...],
  "totalAmount": 1880,
  "status": "processing",
  "createdAt": "2024-12-16T10:00:00.000Z"
}
```

---

### Get My Orders
**GET** `/orders/my-orders`

Get all orders for the logged-in user. **Requires Authentication**

**Response:** `200 OK`
```json
[
  {
    "_id": "order_id",
    "items": [...],
    "totalAmount": 1880,
    "status": "processing",
    "createdAt": "2024-12-16T10:00:00.000Z"
  }
]
```

---

### Cancel Order
**PUT** `/orders/:id/cancel`

Cancel an order. **Requires Authentication**

**Response:** `200 OK`
```json
{
  "_id": "order_id",
  "status": "cancelled"
}
```

---

### Get All Orders (Admin)
**GET** `/orders`

Get all orders. **Requires Admin**

**Response:** `200 OK`

---

## Admin Routes

### Get All Sellers
**GET** `/admin/sellers`

Get all seller accounts. **Requires Admin**

**Response:** `200 OK`
```json
[
  {
    "_id": "user_id",
    "name": "EcoFashion",
    "email": "seller@example.com",
    "sellerInfo": {
      "status": "verified",
      "brandName": "EcoFashion",
      "ecoCertificate": "https://..."
    }
  }
]
```

---

### Get Verification Requests
**GET** `/admin/verification-requests`

Get pending seller verification requests. **Requires Admin**

**Response:** `200 OK`
```json
[
  {
    "_id": "user_id",
    "name": "New Seller",
    "email": "newseller@example.com",
    "sellerInfo": {
      "status": "pending",
      "brandName": "GreenWear",
      "ecoCertificate": "https://..."
    }
  }
]
```

---

### Verify Seller
**PUT** `/admin/verify-seller/:id`

Approve a seller's verification request. **Requires Admin**

**Response:** `200 OK`
```json
{
  "_id": "user_id",
  "sellerInfo": {
    "status": "verified",
    "verifiedBy": "admin_id",
    "verifiedAt": "2024-12-16T10:00:00.000Z"
  }
}
```

---

### Reject Seller
**PUT** `/admin/reject-seller/:id`

Reject a seller's verification request. **Requires Admin**

**Request Body:**
```json
{
  "reason": "Invalid eco-certification document"
}
```

**Response:** `200 OK`
```json
{
  "_id": "user_id",
  "sellerInfo": {
    "status": "rejected",
    "rejectionReason": "Invalid eco-certification document"
  }
}
```

---

## Blogs Routes

### Get All Blogs
**GET** `/blogs`

Get all published blogs. **Public**

**Response:** `200 OK`
```json
[
  {
    "_id": "blog_id",
    "title": "The Complete Guide to Sustainable Fashion",
    "description": "Learn about eco-friendly materials...",
    "image": "https://...",
    "category": "Materials",
    "author": "EcoWear Team",
    "link": "https://...",
    "readTime": "8 min read",
    "featured": true,
    "createdAt": "2024-12-16T10:00:00.000Z"
  }
]
```

---

### Get Featured Blogs
**GET** `/blogs/featured`

Get featured blogs. **Public**

**Response:** `200 OK`

---

### Create Blog
**POST** `/blogs`

Create a new blog. **Requires Admin**

**Request Body:**
```json
{
  "title": "New Blog Title",
  "description": "Blog description...",
  "image": "https://...",
  "category": "Materials",
  "author": "EcoWear Team",
  "link": "https://external-article.com",
  "readTime": "5 min read",
  "featured": false
}
```

**Response:** `201 Created`

---

### Update Blog
**PUT** `/blogs/:id`

Update a blog. **Requires Admin**

**Request Body:** Same as Create Blog

**Response:** `200 OK`

---

### Delete Blog
**DELETE** `/blogs/:id`

Delete a blog. **Requires Admin**

**Response:** `200 OK`
```json
{
  "message": "Blog removed"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized as admin"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Something went wrong!"
}
```

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `buyer` | Regular customer | Browse products, place orders, manage profile |
| `seller` | Product seller | All buyer permissions + manage own products |
| `admin` | Administrator | All permissions + manage users, verify sellers, manage blogs |

---

## Seller Status

| Status | Description |
|--------|-------------|
| `pending` | Awaiting admin verification |
| `verified` | Approved to sell products |
| `rejected` | Verification denied |

---

## Default Admin Credentials

```
Email: admin@gmail.com
Password: admin@gmail.com
```

---

## Sample API Calls

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin@gmail.com"}'
```

**Get Products:**
```bash
curl http://localhost:5001/api/products
```

**Create Product (with auth):**
```bash
curl -X POST http://localhost:5001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Eco Tee","price":999,"description":"..."}'
```

---

## Categories

- Materials
- Innovation
- Recycling
- Environment
- Education
- Awareness
- Lifestyle

---

## Materials

- bamboo
- recycled-cotton
- organic-cotton
- hemp
- tencel
