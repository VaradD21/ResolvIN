# REST API Reference

The ResolveDesk backend exposes RESTful HTTP endpoints communicating via JSON.

- **Default Base URL**: `http://localhost:8080`
- **Authentication**: None currently (intended for internal operations / webhooks).

---

## 1. Tickets

### Create Ticket
Creates a new support ticket and initiates the asynchronous classification and evaluation pipeline.

- **Method**: `POST`
- **Path**: `/tickets`
- **Request Body**:
```json
{
  "customerEmail": "customer@example.com",
  "subject": "Where is my order ORD-001?",
  "body": "Hi, I ordered shoes 5 days ago and need tracking info.",
  "brandId": 1
}
```

- **Validation**:
  - `customerEmail`: Required, valid email format.
  - `subject`: Required, non-blank.
  - `body`: Required, non-blank.
  - `brandId`: Required, must correspond to an existing brand.

- **Response (`201 Created`)**:
```json
{
  "id": 12,
  "customerEmail": "customer@example.com",
  "subject": "Where is my order ORD-001?",
  "body": "Hi, I ordered shoes 5 days ago and need tracking info.",
  "brandId": 1,
  "status": "NEW",
  "category": null,
  "confidence": null,
  "createdAt": "2026-09-20T18:15:22.124Z",
  "events": []
}
```

---

### List Tickets
Retrieves all recorded tickets ordered by creation time descending.

- **Method**: `GET`
- **Path**: `/tickets`
- **Response (`200 OK`)**:
```json
[
  {
    "id": 12,
    "customerEmail": "customer@example.com",
    "subject": "Where is my order ORD-001?",
    "body": "Hi, I ordered shoes 5 days ago and need tracking info.",
    "brandId": 1,
    "status": "AUTO_RESOLVED",
    "category": "WISMO",
    "confidence": 0.95,
    "createdAt": "2026-09-20T18:15:22.124Z",
    "events": [
      {
        "id": 48,
        "type": "replied",
        "payload": {
          "message": "Your order status is: shipped (Tracking: TRK123456)"
        },
        "createdAt": "2026-09-20T18:15:23.010Z"
      }
    ]
  }
]
```

---

### Get Ticket by ID
Retrieves full details for a specific ticket, including its event timeline audit log.

- **Method**: `GET`
- **Path**: `/tickets/{id}`
- **Response (`200 OK`)**:
```json
{
  "id": 12,
  "customerEmail": "customer@example.com",
  "subject": "Where is my order ORD-001?",
  "body": "Hi, I ordered shoes 5 days ago and need tracking info.",
  "brandId": 1,
  "status": "AUTO_RESOLVED",
  "category": "WISMO",
  "confidence": 0.95,
  "createdAt": "2026-09-20T18:15:22.124Z",
  "events": [
    {
      "id": 48,
      "type": "replied",
      "payload": {
        "message": "Your order status is: shipped (Tracking: TRK123456)"
      },
      "createdAt": "2026-09-20T18:15:23.010Z"
    },
    {
      "id": 47,
      "type": "action_taken",
      "payload": {
        "action": "REPLY_ONLY",
        "reason": "Order found in cache with tracking"
      },
      "createdAt": "2026-09-20T18:15:22.890Z"
    },
    {
      "id": 46,
      "type": "policy_checked",
      "payload": {
        "eligible": true,
        "action": "REPLY_ONLY",
        "reason": "Order ORD-001 has active fulfillment tracking."
      },
      "createdAt": "2026-09-20T18:15:22.750Z"
    },
    {
      "id": 45,
      "type": "ticket_classified",
      "payload": {
        "category": "WISMO",
        "confidence": 0.95,
        "extractedOrderId": "ORD-001",
        "extractedIntent": "Tracking inquiry"
      },
      "createdAt": "2026-09-20T18:15:22.500Z"
    }
  ]
}
```

- **Error (`404 Not Found`)**: If the ticket ID does not exist.

---

## 2. Brands

### List Brands
Retrieves all registered brands and their policy configuration JSON.

- **Method**: `GET`
- **Path**: `/brands`
- **Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "name": "Acme Clothing",
    "slug": "acme",
    "policy": {
      "returnWindowDays": 30,
      "nonReturnableCategories": ["innerwear", "cosmetics"],
      "autoCancelBeforeShipped": true,
      "maxAutoResolveOrderValue": 3000
    },
    "createdAt": "2026-09-20T10:00:00Z"
  }
]
```

---

## 3. Escalations

### List Unresolved Escalations
Retrieves all unresolved escalations that require human judgment, including the complete context bundle.

- **Method**: `GET`
- **Path**: `/escalations`
- **Response (`200 OK`)**:
```json
[
  {
    "id": 3,
    "ticketId": 9,
    "reason": "Order value of 4500 exceeds auto-resolution limit of 3000",
    "subject": "Return request for leather jacket",
    "customerEmail": "buyer@domain.com",
    "contextBundle": {
      "subject": "Return request for leather jacket",
      "body": "I would like to return order ORD-990.",
      "classification": {
        "category": "RETURN",
        "confidence": 0.92,
        "extractedOrderId": "ORD-990",
        "extractedIntent": "return jacket"
      },
      "decision": {
        "eligible": false,
        "action": "NONE",
        "reason": "Order value of 4500 exceeds auto-resolution limit of 3000"
      }
    },
    "createdAt": "2026-09-20T17:40:00Z"
  }
]
```

---

## Error Handling

Standard error responses follow this JSON structure:

```json
{
  "error": "Descriptive error message"
}
```

| HTTP Status | Reason |
| :--- | :--- |
| `400 Bad Request` | Missing or invalid request parameters (e.g. invalid email). |
| `404 Not Found` | Entity not found (e.g. brand ID or ticket ID). |
| `405 Method Not Allowed` | Calling an unmapped HTTP method on a route. |
| `500 Internal Server Error` | Unhandled server exception (logged with stack trace in server console). |
