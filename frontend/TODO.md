# YSpace

## Done

### Admin dashboard
* add schedule flight functionality — done (view + form wired to backend `POST /api/admin/flights`)
* add dashboard button for admin users in home page header — done (shows only for `ROLE_ADMIN`)
* fix dash overview with real data — done (KPIs, upcoming flights, recent bookings, network metrics from `GET /api/admin/dashboard`)

### Additional admin views
* Routes — done (list + create route)
* Bookings — done (list + search)
* Passengers (users) — done (list + search)
* Spaceports — done (list)
* Spacecraft — done (list)
* Seed accounts — valid BCrypt hashes so seeded users can log in (`admin@yspace.com` / `admin123`, tourists `password123`)

## Next
* individual flight detail view (`#flight/{id}`)
* seat-level / passenger-count booking selection
* real tests (services/controllers)
