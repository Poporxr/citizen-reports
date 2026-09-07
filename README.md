# Citizen Report — Expo UI

UI only. No Firebase, auth, APIs, storage, notifications or geolocation.
All actions are placeholder functions and all content is mock data.

## Run

```bash
cd mobile
npm install
npx expo start
```

## Structure

```
app/
  _layout.tsx              Stack (login, tabs, create, details)
  index.tsx                Login screen
  (tabs)/_layout.tsx       Bottom navigation w/ raised report button
  (tabs)/home.tsx          Home
  (tabs)/explore.tsx       Explore
  (tabs)/my-reports.tsx    My Reports
  (tabs)/profile.tsx       Profile
  create.tsx               Create Incident (no bottom nav)
  incident/[id].tsx        Incident Details
components/                IncidentCard, CategoryChip, PrimaryButton,
                           EmptyState, FormInput, SectionHeader
data/incidents.ts          Mock incidents + categories
theme.ts                   Colors, spacing, radii, type scale
```
