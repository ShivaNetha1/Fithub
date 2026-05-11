# REST API

All API routes require an authenticated Supabase session unless noted.

Responses use:

```json
{ "data": {} }
```

Errors use:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

## Health

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | App and environment readiness |

## Dashboard

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/dashboard?gym_id=uuid` | Dashboard counts, revenue, attendance |

## Membership Plans

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/membership-plans?gym_id=uuid` | List plans |
| `POST` | `/api/membership-plans` | Create plan |
| `PATCH` | `/api/membership-plans/[id]` | Update plan |
| `DELETE` | `/api/membership-plans/[id]?gym_id=uuid` | Delete/deactivate plan |

## Members

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/members?gym_id=uuid` | List members |
| `GET` | `/api/members/[id]?gym_id=uuid` | Get member |
| `POST` | `/api/members` | Create member |
| `PATCH` | `/api/members/[id]` | Update member |
| `DELETE` | `/api/members/[id]?gym_id=uuid` | Delete member |

## Subscriptions

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/subscriptions?gym_id=uuid` | List subscriptions |
| `POST` | `/api/subscriptions` | Create subscription/renewal |

## Payments

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/payments?gym_id=uuid` | List payments |
| `POST` | `/api/payments` | Record payment |

## Attendance

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/attendance?gym_id=uuid&date=YYYY-MM-DD` | List attendance |
| `POST` | `/api/attendance` | Upsert attendance record |

## Analytics

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/analytics?gym_id=uuid` | Membership, revenue, attendance analytics |

## Gyms

| Method | Path | Purpose |
| --- | --- | --- |
| `PATCH` | `/api/gyms/[id]` | Update gym settings |
