# lendNborrow

A BatStateU community item lending and borrowing web application. Verified students can list items, request to borrow, track returns, and view their activity. Administrators verify student accounts and view platform analytics.

## Stack

- Plain HTML, CSS, and vanilla JavaScript ES modules
- Node.js and Express REST API
- Supabase Postgres, Auth, and Storage
- Chart.js for analytics visualizations

The browser calls the Express API at `/api`; it does not communicate with Supabase directly. Credentials stay in server-side environment files.

## MVP

- Email/password registration and login
- Student profile and admin verification
- Create and manage listings
- Browse and search items
- Request, approve/reject, pick up, and return items
- Basic student dashboard and one admin analytics dashboard
- Responsive QA and deployment

Messages, notifications, appeals, Google sign-in, ratings, return photos, compensation, and automated credit rules are Phase 6 stretch features. One Express application serves both student and administrator pages; there is no separate admin application.

## Reference

`docs/Guided_Website/` is the approved visual and interaction reference. It is a prototype only and must not be copied as production logic.

## Plan

The official scope, architecture, data model, and phased roadmap are in [CONTEXT.md](CONTEXT.md). Course requirements are in `docs/IT_314_Guidelines_Final_Project_2026.md`.


## COMMENTS --

November 9 - 1:44 am

Idk if nasundan ko properly yung plans natin for development pero I started with fixing the placeholder navigation button tsaka sa landing page para may first part done us
