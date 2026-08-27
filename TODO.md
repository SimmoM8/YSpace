* ~~create search flights results page~~
* ~~Create cards for search flights results~~ (now dynamic)
* ~~Hook up registration~~
* ~~Hook up flights searching~~
* ~~Organise and structure JS files~~
* Create user profile page
* ~~Create my bookings page~~
* ~~Create my bookings cards~~
* ~~Hook up viewing my bookings~~
* ~~Hook up cancelling booking~~
* ~~Create flights details modal~~ (uses confirm/alert for now)
* ~~Hook up viewing flight details~~

* ~~Create a admin dashboard~~ (routes, flights, spacecraft, spaceports, bookings management)
* ~~Create spacecraft fleet page~~ (spacecraft.html)
* ~~Create destinations / spaceports page~~ (destination.html)
* ~~Admin auto-redirect after login~~


## Production sweep — outstanding items

* ~~**CRITICAL — Fix seeded login passwords in `data.sql`.**~~ Now real bcrypt hashes:
  `admin@yspace.com` = `test`; all tourists (`luna.park`, `orion.vale`, `touristN`) = `password`.
  Also fixed `routes`, `flights`, and `spacecrafts` seed columns to match the entities
  (`destination_spaceport_id`, `code`, `available_seats`, `seat_capacity`).

* ~~**CRITICAL — Seeded flight dates are in the past.**~~ Flights now depart on/after 2026-09-18
  (aligned with the frontend default search date) so the flight search returns results out-of-the-box.

* ~~**Seed application**~~ `spring.sql.init.mode` is now `always` (was `never`): the app runs the
  idempotent `data.sql` on every startup, so the corrected seed (passwords, future flights, fixed
  column names) is applied automatically. `spring.jpa.defer-datasource-initialization=true` is already
  set so it runs after Hibernate validates the schema.

* Create user profile page (already listed) — backend currently has no "current user / my profile"
  endpoint (User has address/phone/createdAt but no GET `/api/users/me` or `/auth/user/**`).

* Seat selection / seat class: `SeatNumber` model with `SeatClass` exists but the booking flow does not
  surface seat pick & class pricing. Either finish seat selection in checkout or remove unused model.

* Dead security rule: `/auth/user/**` is referenced in `SecurityConfig` but no controller maps to it.
  Remove the rule or add the intended "current user" endpoints under it.

* Frontend hardcoded search defaults: `flights.html` / `index.html` pre-fill origin "Earth Orbital Hub",
  destination "Luna Base One", and a fixed departure date (2026-09-18) rather than deriving from the
  latest data / current date.

