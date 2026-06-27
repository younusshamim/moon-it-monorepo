-- Custom SQL migration file, put your code below! --

-- Enable pgvector for embedding storage (INFRASTRUCTURE.md §7). Forward-looking: the vector
-- columns/tables for the AI retrieval store land with packages/ai. Requires a pgvector-capable
-- Postgres image (e.g. pgvector/pgvector) — see tooling/docker.
CREATE EXTENSION IF NOT EXISTS vector;
