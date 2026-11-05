# lendNborrow — Project Overview

> Compiled from what's been shared so far. Anything not listed here hasn't been discussed yet.

## Summary

lendNborrow is a web-based platform that lets users lend and borrow items within their community. Users list items such as books, tools, and equipment; other users browse what's available and send borrowing requests. The goal is to make resource sharing more convenient, accessible, and organized.

**Naming note:** the project appears as both "lendNborrow" and "linkNborrow" in different places. Pick one and use it consistently in the app, docs, and presentation.

## Course Context

- **Course:** IT 314 — Web System and Technologies (WST), final project
- **Deliverable:** Website
- **Due:** December 1–5, 2026
- **Group size:** 3 members

## Team

- Emanuel Cruzat
- Mikayla Banaag
- Lance Pria

This is a collaborative project: all three members work on every part and get to experience the full stack, with no fixed per-person roles.

## Objectives

1. Provide a platform where users can list items they are willing to lend.
2. Let users easily browse and search for available items.
3. Enable users to send and manage borrowing requests.
4. Help users organize and keep track of borrowed and returned items.
5. Encourage resource sharing within the community.

## Core Features (from the objectives)

- Create and manage item listings
- Browse and search available items
- Send borrow requests
- Owner approves or rejects requests
- Track borrow and return status
- Responsive UI

## Business Analytics Integration

The analytics layer is meant to show insights from borrowing activity. Ideas so far:

- **Trending items:** which items are borrowed the most.
- **Credit scores by department:** which departments have the highest credit scores.
- **Compensation payers:** the average number of users who pay compensation.

What these imply for the system (not yet decided):

- Users need a **department** field on their profile.
- Users need a **credit score**, which means defining how it is earned and lost (for example, on-time returns raise it, late or damaged returns lower it).
- The system needs a record of **compensation payments**, including what triggers one (for example, lost, damaged, or late items).
- Borrow requests need to be logged with enough detail (item, borrower, department, dates, status) to power the trending and department reports.

## Timeline Notes

- A detailed, realistic project timeline was requested on Oct 2, 2026.
- Midterm exams ran Oct 19–23, 2026, and were factored into the schedule.
- Final deadline window is Dec 1–5, 2026.

## Stack Decisions

Five stack decisions were open as of the last discussion:

1. Database
2. Authentication
3. Image storage
4. Hosting
5. Charts

Constraint: the group wanted beginner-friendly picks, since not every member is technical.

**Status:** I have no record of final choices being made. Fill in below once decided.

| Decision      | Choice |
| ------------- | ------ |
| Database      | TBD    |
| Auth          | TBD    |
| Image storage | TBD    |
| Hosting       | TBD    |
| Charts        | TBD    |

## Design Work

- On Nov 2, 2026, a website wireframe was requested, to be built in Claude Design from the group's **Flow A / Flow B** end-user flowchart plus the project objectives.
- I don't have the contents of the flowchart, so the flows themselves aren't documented here.

## Open Items

- Finalize and record the five stack decisions
- Settle the project name (lendNborrow vs linkNborrow)
- Document Flow A / Flow B in text form so it lives alongside this file
- Confirm the wireframe status
- Define the data model (users, items, borrow requests, return status), since none has been shared yet
- Define how the credit score is computed and what triggers compensation
- Decide how the analytics will be displayed (the Charts decision above ties into this)
