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
    id              BIGSERIAL PRIMARY KEY,
    ticket_id       BIGINT      NOT NULL REFERENCES tickets(id),
    reason          TEXT        NOT NULL,
    assigned_to     TEXT,
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed a dummy brand for testing so POST /tickets doesn't return 404
INSERT INTO brands (id, name, slug)
VALUES (1, 'Acme Clothing', 'acme')
ON CONFLICT (id) DO NOTHING;

