# Data Model (logical diagram)

```mermaid
erDiagram
  USERS ||--o{ TASKS : assigned_to
  PROJECTS ||--o{ TASKS : includes
  PROJECTS ||--o{ CAMPAIGNS : includes
  CAMPAIGNS ||--o{ CONTENTS : includes
  CONTENTS o|--o{ TASKS : requires
  CONTENTS ||--o{ APPROVALS : reviewed_in
  USERS ||--o{ APPROVALS : reviews
  USERS ||--o{ ACTIVITY_LOGS : acts
```

Keys: `users.id`, `projects.id`, `campaigns.projectId`, `contents.campaignId`, `tasks.projectId`, `tasks.contentId` (optional), `tasks.assigneeId`, `approvals.contentId`, `approvals.reviewerId`. JSON collections maintain ID references with application checks instead of DB foreign keys.
