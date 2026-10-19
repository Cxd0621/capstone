# Capstone Project — Full-Stack Portfolio & Blog

**Student:** Chen Xiaoding (24998101)
**Course:** Web Data Management and Application
**Project type:** Cumulative full-stack capstone (100 marks)

A complete personal portfolio website and blog, built as two separate applications:

- **`server/`** — a REST API with Node.js, Express and Mongoose, storing everything in a
  cloud-hosted **MongoDB Atlas** database. It handles projects, blog posts, comments,
  contact messages and JWT authentication.
- **`client/`** — a **React** single-page application (Vite, React Router, Context API) that
  consumes every endpoint of the API, including a protected admin dashboard.

---

## Live links

| | URL |
|---|---|
| **Front-end (React SPA)** | **https://capstone-cxd0621.vercel.app** |
| **Back-end (API)** | **https://capstone-api-t1k5.onrender.com** |

Health check of the API: `GET https://capstone-api-t1k5.onrender.com/api/health`

### Network note (please read before opening the front-end link)

The front end is hosted on **Vercel** and the API on **Render**. Both deployments are
working, but the `*.vercel.app` domain is **filtered by DNS in some networks** (including
mainland China): the name resolves to an unrelated IP address and the page will not load
unless a VPN is used. This is a property of the domain, not of the application — the
deployment itself reports **Ready / Production**.

The API on `*.onrender.com` is reachable **without a VPN**, and it can be verified directly:
opening `/api/projects` returns the three project documents.

If the front-end link cannot be opened on the reviewing machine, there are two ways to see
the full application:

1. **Run it locally** (two commands, see *Running the project locally* below) — the front end
   then talks to the live Render API, so the data is exactly the same.
2. **Deploy the front end to Render instead** — Render Static Sites are reachable without a
   VPN. The steps are in *Deployment → Alternative: front end on Render* below; it takes
   about five minutes and produces a `https://<name>.onrender.com` URL.

---

## Demo accounts

The database already contains a few sample projects, two blog posts, comments and a
contact message, so every page has something to show.

| Role | Email | Password |
|---|---|---|
| Author / admin | `admin@portfolio.dev` | `Admin123456` |
| Regular user (can comment) | `visitor@example.com` | `Visitor123` |

---

## Tech stack

| Layer | Tools |
|---|---|
| Back end | Node.js, Express 5, Mongoose 9, MongoDB Atlas, bcrypt, jsonwebtoken, helmet, cors, dotenv |
| Front end | React 19, Vite, React Router 7, Context API, CSS Modules |
| Tooling | npm, Git |

---

## Project structure

```
Capstone/
├── README.md
├── server/
│   ├── config/db.js                # MongoDB Atlas connection
│   ├── models/                     # User, Project, BlogPost, Comment, Message
│   ├── controllers/                # auth, project, blog, comment, contact
│   ├── routes/                     # /api/users, /api/projects, /api/blog, /api/contact
│   ├── middleware/
│   │   ├── auth.js                 # protect: verifies the JWT and sets req.user
│   │   ├── error.js                # central error handler (one JSON shape for every error)
│   │   └── notFound.js             # 404 for unknown routes
│   ├── utils/                      # ErrorHandler class, generateToken
│   ├── .env.example
│   └── server.js
└── client/
    ├── index.html
    ├── vercel.json                 # SPA rewrite so /blog/:id works after a refresh
    ├── .env.example
    └── src/
        ├── api/client.js           # every fetch call in one place (adds the Bearer token)
        ├── context/AuthContext.jsx # global auth state (token + user + login/logout)
        ├── components/             # Header, Footer, ProjectCard, BlogPostCard,
        │                           # ProtectedRoute, Loader, Alert
        ├── pages/                  # Home, Projects, Blog, BlogDetail, Contact,
        │                           # Login, Register, Admin, NotFound
        └── index.css
```

---

## Running the project locally

### 1. Back end

```bash
cd server
npm install
cp .env.example .env      # then edit .env
npm start                 # http://localhost:5050
```

`.env` needs three values:

```ini
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/capstone?retryWrites=true&w=majority
JWT_SECRET=a-long-random-string
PORT=5050
CLIENT_URL=http://localhost:5173
```

- `MONGO_URI` — your MongoDB Atlas connection string (the database name is `capstone`).
- `JWT_SECRET` — any long random string; it signs the login tokens.
- `CLIENT_URL` — the origin allowed by CORS (comma-separate several origins if you need to).

Check that it works: `curl http://localhost:5050/api/health`

### 2. Front end

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5050/api
npm run dev               # http://localhost:5173
```

`VITE_API_URL` is the **only** thing that ties the front end to the back end — point it at
the deployed API when you build for production:

```bash
VITE_API_URL=https://your-api.onrender.com/api npm run build
```

The build output is `client/dist/`.

---

## API endpoints

Base URL: `http://localhost:5050/api` (or your deployed URL).
“Bearer” means the request must send `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/users/register` | public | `username`, `email`, `password` (≥ 6 chars) | Create an account (password is hashed with bcrypt) and return a JWT |
| POST | `/users/login` | public | `email`, `password` | Verify the credentials and return a JWT |
| GET | `/users/me` | Bearer | – | Return the owner of the token (used to restore a session) |

### Projects

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/projects` | public | – | All projects, newest first, author populated |
| GET | `/projects/:id` | public | – | One project |
| POST | `/projects` | Bearer | `title`, `description`, `imageUrl?`, `repoUrl?`, `liveUrl?` | Create a project owned by the logged-in user |
| PUT | `/projects/:id` | Bearer | same as POST | Update a project |
| DELETE | `/projects/:id` | Bearer | – | Delete a project |

### Blog

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/blog` | public | – | All posts with `author.username` populated |
| GET | `/blog/:id` | public | – | One post with its author and all comments |
| POST | `/blog` | Bearer | `title`, `content` | Publish a post |
| PUT | `/blog/:id` | Bearer **+ author** | `title?`, `content?` | Edit a post (403 if you are not the author) |
| DELETE | `/blog/:id` | Bearer **+ author** | – | Delete a post and its comments (403 if not the author) |

### Comments

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/blog/:postId/comments` | public | – | All comments of one post |
| POST | `/blog/:postId/comments` | Bearer | `body` | Add a comment as the logged-in user |

### Contact

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/contact` | public | `name`, `email`, `message` | Save a message from the contact form |
| GET | `/contact` | Bearer | – | List the messages (admin dashboard) |
| DELETE | `/contact/:id` | Bearer | – | Delete a message |

### Utility

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/health` | public | – | Uptime check used by the hosting platform |

**Error format** — every failure returns the same JSON shape:

```json
{ "success": false, "status": 401, "message": "Not authorized, no token provided" }
```

---

## Front-end routes

| Route | Page | Data source |
|---|---|---|
| `/` | Home | `GET /projects`, `GET /blog` |
| `/projects` | Projects gallery | `GET /projects` |
| `/blog` | Blog list | `GET /blog` |
| `/blog/:id` | Post detail + comments | `GET /blog/:id`, `POST /blog/:id/comments` |
| `/contact` | Contact form | `POST /contact` |
| `/login` | Login | `POST /users/login` |
| `/register` | Register | `POST /users/register` |
| `/admin` | Admin dashboard (**protected**) | projects + posts CRUD, `GET /contact` |

`/admin` is wrapped in `<ProtectedRoute>`: while the saved token is being checked it shows a
loader, and if there is no valid session it redirects to `/login` and remembers the page to
return to. The header is auth-aware — it shows *Login / Register* or *Dashboard / Logout*
and the logged-in username.

---

## How the requirements are covered

**Back end**

- MVC folders (`models`, `controllers`, `routes`) plus `middleware` and `utils`.
- Five Mongoose schemas with validation: `User`, `Project`, `BlogPost`, `Comment`, `Message`.
- Passwords are hashed with bcrypt in a `pre('save')` hook and never returned by a query
  (`select: false`); login compares with `bcrypt.compare`.
- JWT signed with `JWT_SECRET`, valid for 30 days; the `protect` middleware verifies it and
  loads `req.user`.
- Blog update / delete check that `req.user._id` is the post author (403 otherwise).
- `populate()` is used for `Project.user`, `BlogPost.author`, `Comment.author` and the
  comments of a post.
- Central error handler (CastError → 400, ValidationError → 400, duplicate key → 400,
  everything else → 500) and a 404 handler.
- `helmet` for secure headers, `cors` for the React origin, `dotenv` for secrets.

**Front end**

- Component-based architecture with reusable `Header`, `Footer`, `ProjectCard`,
  `BlogPostCard`, `Loader`, `Alert` and `ProtectedRoute`.
- CSS Modules for scoped, responsive styling (grid layouts, mobile breakpoints).
- `useState` for forms, loading and error state; `useEffect` for fetching.
- Context API (`AuthContext`) keeps the token, the user and `login` / `register` / `logout`
  and restores the session from `localStorage` on refresh.
- Admin dashboard sends `Authorization: Bearer <token>` on every write and supports full
  create / edit / delete for both projects and blog posts, plus a read-only messages panel.

---

## Deployment

**Back end → Render**

1. New → Web Service → connect the repository, root directory `server`.
2. Build command `npm install`, start command `npm start`.
3. Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL).
4. Render provides `https://<name>.onrender.com` — check `/api/health`.
5. In MongoDB Atlas → Network Access, allow `0.0.0.0/0` so Render can connect.

**Front end → Vercel**

1. Import the repository, root directory `client`, framework preset **Vite**.
2. Environment variable `VITE_API_URL=https://capstone-api-t1k5.onrender.com/api`.
3. Deploy. `vercel.json` already rewrites every path to `index.html` so `/blog/:id` survives a
   page refresh.
4. Set the back end's `CLIENT_URL` to the front-end URL and redeploy the API so CORS matches.

**Alternative: front end on Render** (use this if `*.vercel.app` is blocked on the reviewing
machine — `*.onrender.com` is not)

1. Render → **New +** → **Static Site** → pick the same repository.
2. Root Directory `client`, Build Command `npm install && npm run build`,
   Publish Directory `dist`.
3. Environment variable `VITE_API_URL=https://capstone-api-t1k5.onrender.com/api`.
4. Create the site; the URL will be `https://<name>.onrender.com`.
5. Update the API's `CLIENT_URL` to that URL and let it redeploy.

Because Vite inlines `VITE_API_URL` at **build time**, any change to that value requires a
new deployment (a page refresh alone is not enough).

**Checklist after deploying:** open `/projects` and `/blog` (data arrives from the deployed
API), log in with the demo account, create and delete a post from `/admin`, and post a
comment on a blog detail page.
