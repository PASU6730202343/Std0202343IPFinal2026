# Std0202343IPFinal2026

HR employee manager. Express.js backend (in-memory data, no database) and an Expo (React Native) frontend.

## Run the backend

```bash
cd backend
npm install
npm start
```

Listens on `0.0.0.0:3034` by default (override with the `PORT` env variable).

## Run the frontend

```bash
cd frontend
npm install
npx expo start
```

### Change the API URL

Edit `frontend/config.js`, or set `EXPO_PUBLIC_API_URL` (see `frontend/.env.example`).
The URL already includes `/api`, e.g. `http://119.59.102.161:3034/api`.

## Login

- Username: `admin`
- Password: `password123`

## Endpoints (all under `/api`)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/login` | Returns `{ success, token }` on valid credentials, 401 otherwise |
| GET | `/employees` | List all employees |
| POST | `/employees` | Create employee (`name`, `position`, `salary`) |
| PUT | `/employees/:id/status` | Toggle Active / On Leave |
| DELETE | `/employees/:id` | Delete an employee |
| GET | `/employees/salary-clusters` | K-Means (k=3) salary tiers: `Tier 1..3` with centroid and count |
