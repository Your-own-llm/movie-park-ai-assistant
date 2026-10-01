# Inquiry Persistence

The persistence layer stores production inquiries in SQLite.

Optional environment:
- DATABASE_PATH — SQLite file path, default ./movie-park.db

Stored data:
- inquiry ID
- created and updated timestamps
- qualification status and score
- assigned account manager
- contacted timestamp
- structured inquiry payload

The repository contract is designed so SQLite can later be replaced by Postgres, Supabase, or another database without changing the UI contract.
