# lendNborrow

A BatStateU community item lending and borrowing web application. Verified students can list items, request to borrow, track returns, and view their activity. Administrators verify student accounts and view platform analytics.

## Stack

- Plain HTML, CSS, and vanilla JavaScript ES modules
- Node.js and Express REST API
- Supabase Postgres, Auth, and Storage
- Chart.js for analytics visualizations

The browser calls the Express API at `/api`; it does not communicate with Supabase directly. Credentials stay in server-side environment files.

## Reference

`docs/Guided_Website/` is the approved visual and interaction reference. It is a prototype only and must not be copied as production logic.

## Plan

The official scope, architecture, data model, and phased roadmap are in [CONTEXT.md](CONTEXT.md). Course requirements are in `docs/IT_314_Guidelines_Final_Project_2026.md`.
