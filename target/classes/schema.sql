CREATE TABLE IF NOT EXISTS brands (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT        NOT NULL,
    slug        TEXT        NOT NULL UNIQUE,
    policy      JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders_cache (
    id              BIGSERIAL PRIMARY KEY,
    brand_id        BIGINT      NOT NULL REFERENCES brands(id),
    external_order_id TEXT      NOT NULL,
    customer_email  TEXT        NOT NULL,
    data            JSONB,
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (brand_id, external_order_id)
);

CREATE TABLE IF NOT EXISTS tickets (
    id              BIGSERIAL PRIMARY KEY,
    brand_id        BIGINT      NOT NULL REFERENCES brands(id),
    customer_email  TEXT        NOT NULL,
    subject         TEXT        NOT NULL,
    body            TEXT        NOT NULL,
    category        TEXT,
    confidence      FLOAT,
    status          TEXT        NOT NULL DEFAULT 'NEW',
    order_cache_id  BIGINT      REFERENCES orders_cache(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_events (
    id          BIGSERIAL PRIMARY KEY,
    ticket_id   BIGINT      NOT NULL REFERENCES tickets(id),
    type        TEXT        NOT NULL,
    payload     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS actions (
    id          BIGSERIAL PRIMARY KEY,
    ticket_id   BIGINT      NOT NULL REFERENCES tickets(id),
    type        TEXT        NOT NULL,
    payload     JSONB,
    executed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escalations (
    id                  BIGSERIAL PRIMARY KEY,
    ticket_id           BIGINT      NOT NULL REFERENCES tickets(id),
    reason              TEXT        NOT NULL,
    context_bundle      JSONB,
    assigned_to         TEXT,
    resolved_at         TIMESTAMPTZ,
    resolved_by         TEXT,
    resolution_note     TEXT,
    resolution_action   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS processed_emails (
    id              BIGSERIAL PRIMARY KEY,
    message_id      TEXT        NOT NULL UNIQUE,
    sender          TEXT        NOT NULL,
    subject         TEXT,
    ticket_id       BIGINT      REFERENCES tickets(id),
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed brand with real policy config
INSERT INTO brands (id, name, slug, policy)
VALUES (1, 'Acme Clothing', 'acme', '{
    "returnWindowDays": 30,
    "nonReturnableCategories": ["innerwear", "cosmetics"],
    "autoCancelBeforeShipped": true,
    "maxAutoResolveOrderValue": 3000
}')
ON CONFLICT (id) DO UPDATE SET policy = EXCLUDED.policy;

-- Seed sample orders for manual testing
INSERT INTO orders_cache (brand_id, external_order_id, customer_email, data)
VALUES
  (1, 'ORD-001', 'customer@example.com', '{
      "fulfillmentStatus": "shipped",
      "trackingNumber": "TRK123456",
      "deliveredAt": null,
      "category": "shoes",
      "orderValue": 1500
  }'),
  (1, 'ORD-002', 'customer@example.com', '{
      "fulfillmentStatus": "delivered",
      "deliveredAt": "2026-09-10T10:00:00+05:30",
      "category": "shoes",
      "orderValue": 999
  }'),
  (1, 'ORD-003', 'customer@example.com', '{
      "fulfillmentStatus": "delivered",
      "deliveredAt": "2026-07-01T10:00:00+05:30",
      "category": "shoes",
      "orderValue": 999
  }'),
  (1, 'ORD-004', 'customer@example.com', '{
      "fulfillmentStatus": "processing",
      "deliveredAt": null,
      "category": "tshirt",
      "orderValue": 500
  }')
ON CONFLICT (brand_id, external_order_id) DO NOTHING;

