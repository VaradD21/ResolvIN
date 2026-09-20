# Policy & Classification Engine

ResolveDesk pairs zero-shot Large Language Model (LLM) intent classification with a deterministic, rules-based Policy Engine to deliver safe and predictable automation for D2C brands.

---

## 1. Escalation Pre-Filter

Before invoking any external LLM, tickets pass through a fast local keyword pre-filter. If matches are found, the ticket bypasses LLM inference and escalates directly to human agents.

### Pre-Filter Categories
- **Legal Risk**: `lawyer`, `legal action`, `chargeback`, `consumer court`, `lawsuit`, `attorney`, `sue`, `legal notice`.
- **Profanity / Hostility**: High-sentiment profanities and abusive text.

```
Incoming Ticket Text
        │
        ▼
[ Keyword Scanner ] ──(Matches Escalation Word)──► Escalation Queue
        │
    (Clean)
        │
        ▼
[ LLM Classifier ]
```

---

## 2. LLM Classification Service

Tickets that pass the pre-filter are processed by `ClassifierService` using the configured provider (default: Google Gemini via `gemini-1.5-flash`).

### Extracted Fields
The LLM returns structured JSON containing:
1. **`category`**: One of `WISMO`, `RETURN`, `EXCHANGE`, `REFUND_STATUS`, `CANCELLATION`, or `OTHER`.
2. **`confidence`**: Float score between `0.0` and `1.0`.
3. **`extractedOrderId`**: Regex / entity-extracted order identifier (e.g. `ORD-001`).
4. **`extractedIntent`**: Brief summary phrase explaining customer intent.
5. **`reasoning`**: Chain-of-thought explanation for classification.

---

## 3. Deterministic Policy Evaluator

The `PolicyEvaluator` (`PolicyEvaluator.java`) is a deterministic rule engine that takes the ticket, the linked order from `OrderCache`, and the brand's `policy` configuration.

### Evaluation Rules Matrix

| Category | Conditions for Auto-Resolution | Action Executed | Escalation Reason If Ineligible |
| :--- | :--- | :--- | :--- |
| **WISMO** | Order exists in cache & has fulfillment status / tracking. | `REPLY_ONLY` | Order not found in cache or missing tracking information. |
| **RETURN** | Delivered within brand `returnWindowDays` (e.g. 30 days), product category not in `nonReturnableCategories`, order value &le; `maxAutoResolveOrderValue`. | `REFUND` or return label generation | Delivered outside return window, excluded category (e.g. innerwear/cosmetics), or high order value. |
| **EXCHANGE** | Delivered within brand window, product category eligible for exchange, value within threshold. | `EXCHANGE` | Return window expired, non-exchangeable item, or order value above ceiling. |
| **CANCELLATION** | Order fulfillment status is `processing` or `unfulfilled` (not yet `shipped`). | `CANCEL` | Order has already shipped or been delivered. |
| **REFUND_STATUS** | Refund processed or initiated in payment gateway. | `REPLY_ONLY` | Ambiguous payment gateway status. |
| **OTHER** | Uncategorized inquiry. | `NONE` | Always escalated for human triage. |

---

## 4. Resolution Actions & Auto-Replies

When a policy evaluates as `eligible == true`, the system executes the corresponding action and records an automated response in the event log:

- **`REFUND`**:
  > *"Your refund has been initiated and will reflect in 3-5 business days."*
- **`EXCHANGE`**:
  > *"Your exchange request has been approved. A return pickup will be scheduled."*
- **`CANCEL`**:
  > *"Your order has been successfully canceled and refunded."*
- **`REPLY_ONLY` (WISMO)**:
  > *"Your order status is: shipped (Tracking: TRK123456)"*

When `eligible == false`, the ticket is marked `ESCALATED`, an `Escalation` record is created, and the complete evaluation reasoning is saved in the `contextBundle`.
