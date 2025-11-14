┌────────────────────────┐        ┌───────────────────────────┐
│      Next.js Frontend  │ <----> │      Django REST API       │
│  pages/, components/   │        │ students/, payments/, etc. │
└────────────┬───────────┘        └────────────┬────────────────┘
             │                                  │
             ▼                                  ▼
     ┌─────────────┐                     ┌──────────────────┐
     │ Offline Cache│                    │ PostgreSQL DB     │
     │ localStorage │                    │ Tables: students, │
     │ offlineQueue │                    │ payments, reports │
     └──────────────┘                    └───────────────────┘

Mermaid version:

flowchart TD

A[Next.js Frontend] -->|API Calls| B(Django REST Framework)
B --> C{PostgreSQL DB}

A --> D[localStorage Offline Queue]
D -->|Sync on reconnect| B

subgraph Backend Modules
  B --> B1[Students API]
  B --> B2[Payments API]
  B --> B3[Reports API]
  B --> B4[Notifications API]
end

subgraph Frontend Pages
  A --> A1[Students Pages]
  A --> A2[Payments Pages + Offline]
  A --> A3[Reports Pages]
  A --> A4[Notifications Center]
  A --> A5[Dashboard w/ Roles]
end
