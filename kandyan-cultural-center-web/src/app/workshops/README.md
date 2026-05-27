# Workshops Module

## New Features Added

- Full workshop detail pages for each workshop category.
- Clickable workshop cards that navigate from the workshop list to `/workshops/[id]`.
- Rich workshop details including:
  - Workshop description
  - Craftsman information
  - Location
  - What to expect/highlights
  - Schedule overview with available dates and times
- Improved booking panel with:
  - Calendar-style scheduled date selection
  - Time slot selection
  - Customer booking fields: full name, email, phone, and number of guests
  - Booking summary display
  - Submission confirmation message

## Files Updated

- `src/app/workshops/data.ts`
  - Added richer workshop metadata: location, highlights, craftsman details.
- `src/app/workshops/components/WorkshopCard.tsx`
  - Added card navigation and new workshop preview details.
- `src/app/workshops/[id]/page.tsx`
  - Added full detail page layout and server-safe route param handling.
- `src/app/workshops/components/BookingPanel.tsx`
  - Added booking form fields, calendar date selection, and confirmation flow.

## Usage

- Open the workshops landing page at `/workshops`.
- Click any workshop card to view its full details.
- Choose a scheduled date, pick a time, fill in contact and guest details, and submit the booking.

## Notes

- The current booking submission is simulated in the UI and does not yet persist to a backend.
- If you want, I can also connect this form to an API route or database for real booking storage.
