# CreatorFlow — Project Overview

**Course:** Node.js Backend Programming — Final Project

## Purpose
CreatorFlow is a REST API for creative teams to track campaign tasks, content preparation, editorial review and publishing schedules. It demonstrates Express.js routing, basic HTTP middleware, complete task CRUD, JSON persistence and Postman tests, with additional optional modules.

## Scenario
A small agency plans Instagram posts and Reels for several clients. Each client is represented by a project, each editorial period by a campaign and each deliverable by a content record. Tasks are assigned to team members. Content can be drafted, produced, reviewed, approved, scheduled and marked published. Editors can request revisions with a comment, preserving approval history.

## Main requirements
1. Create, list, view, update, delete tasks.
2. Assign tasks to users; manage status and priority.
3. Track projects, campaigns and content.
4. Log HTTP request timestamp, method and route.
5. Validate input, filter/search/paginate, produce reports.
6. Test endpoints in Postman; provide README and evidence screenshots.

## Technologies and modules
Node.js 18+, Express 4, JSON files, Postman and Node test runner. Modules: tasks, projects, campaigns, contents, approvals, reports, users and activity log.

## Deliverables
GitHub repository with `package.json`, all source code, `README.md`, project overview, Postman collection and **user-captured** CRUD test screenshots. Screenshots must be captured after running successful requests; this repository does not falsely present screenshots as executed tests.
