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

| | URL | Note |
|---|---|---|
| **Front-end (React SPA)** | **https://cxd0621-portfolio.onrender.com** | hosted on Render - reachable directly, no VPN needed |
| Front-end mirror | https://capstone-cxd0621.vercel.app | hosted on Vercel (identical build) |
| **Back-end (API)** | **https://capstone-api-t1k5.onrender.com** | health check: `/api/health` |

Both front ends are the same Vite build and talk to the same API, so either one shows the
whole application. The Render deployment is listed first because the `*.vercel.app` domain is
filtered by DNS in some networks: the name resolves to an unrelated IP address and the page
only loads behind a VPN. The deployment itself is fine - Vercel reports *Ready / Production* -
it is the domain that is blocked, not the application.

Quick check that the API is alive without opening the website:

```
GET https://capstone-api-t1k5.onrender.com/api/health     -> {"success":true,"status":"ok",...}
GET https://capstone-api-t1k5.onrender.com/api/projects   -> the three project documents
```

> On the free Render tier an idle service is suspended; the first request after a pause can
> take 30-60 seconds to wake up. This affects both the API and the static site.

---

## Demo accounts

The database already contains a few sample projects, two blog posts, comments and a
contact message, so every page has something to show.

| Role in the API | Email | Password | What it can do |
|---|---|---|---|
| `admin` (site owner) | `admin@portfolio.dev` | `Admin123456` | Manage projects and posts, read and delete contact messages |
| `user` (reader) | `visitor@example.com` | `Visitor123` | Read everything public and write comments |

Public registration always creates a `user`. The `role` field is only changed by the owner
in the database, so no route can promote an account to `admin`.

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

**Pagination** — `GET /projects`, `GET /blog` and `GET /contact` accept `?page=` and
`?limit=` (default 6, maximum 50) and answer with the same envelope:

```json
{ "items": [ ... ], "page": 1, "pages": 3, "total": 14, "limit": 6 }
```

### Authentication

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/users/register` | public | `username`, `email`, `password` (≥ 6 chars) | Create an account (password is hashed with bcrypt) and return a JWT |
| POST | `/users/login` | public | `email`, `password` | Verify the credentials and return a JWT |
| GET | `/users/me` | Bearer | – | Return the owner of the token (used to restore a session) |

`register` and `login` share one allowance of **10 attempts per IP per 15 minutes** and the
whole `/users` router answers with `Cache-Control: no-store`, so a browser or proxy never
keeps a token. Every user response now includes `role` (`user` or `admin`).

### Projects

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/projects` | public | – | Projects, newest first, author populated (`?page=&limit=`) |
| GET | `/projects/:id` | public | – | One project |
| POST | `/projects` | Bearer | `title`, `description`, `imageUrl?`, `repoUrl?`, `liveUrl?` | Create a project owned by the logged-in user |
| PUT | `/projects/:id` | Bearer **+ owner** | same as POST | Update a project (403 if you are not the owner) |
| DELETE | `/projects/:id` | Bearer **+ owner** | – | Delete a project (403 if you are not the owner) |

### Blog

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/blog` | public | – | Posts with `author.username` populated (`?page=&limit=`) |
| GET | `/blog/:id` | public | – | One post with its author and all comments |
| POST | `/blog` | Bearer | `title`, `content` | Publish a post |
| PUT | `/blog/:id` | Bearer **+ author** | `title?`, `content?` | Edit a post (403 if you are not the author) |
| DELETE | `/blog/:id` | Bearer **+ author** | – | Delete a post and its comments (403 if not the author) |

### Comments

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/blog/:postId/comments` | public | – | All comments of one post |
| POST | `/blog/:postId/comments` | Bearer | `body` | Add a comment as the logged-in user |
| DELETE | `/blog/:postId/comments/:commentId` | Bearer **+ comment or post author** | – | Delete a comment (403 otherwise, 404 when it does not belong to that post) |

### Contact

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/contact` | public, max 5 per IP / 15 min | `name`, `email`, `message` | Save a message from the contact form |
| GET | `/contact` | Bearer **+ admin** | – | Messages for the dashboard (`?page=&limit=`) |
| DELETE | `/contact/:id` | Bearer **+ admin** | – | Delete a message |

### Utility

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/health` | public | – | Uptime check used by the hosting platform |

**Error format** — every failure returns the same JSON shape:

```json
{ "success": false, "status": 401, "message": "Not authorized, no token provided" }
```

Body parsing errors use the same shape: **400** `Send valid JSON.` for broken JSON and
**413** `The request body is too large.` when the body is over 32 KB. Both rate limiters
answer **429** with a JSON message and `RateLimit-*` / `Retry-After` headers.

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
| `/admin` | Admin dashboard (**protected + admin only**) | projects + posts CRUD, messages |

`/admin` is wrapped in `<ProtectedRoute>`: while the saved token is being checked it shows a
loader, and if there is no valid session it redirects to `/login` and remembers the page to
return to. Inside the page a second check looks at `role`: a normal reader sees an
explanatory message and no write requests are sent, while the `admin` gets the tabs. The
header only shows the *Dashboard* link for an admin, and *Login / Register* / *Logout* plus
the username otherwise.

`/projects` and `/blog` load six projects / four posts at a time and offer **Load more** until
`page === pages`. A comment shows a **Delete** link to its author and to the post author; the
same rule is computed in the browser, so the button never appears for somebody the API would
refuse.

The header also has a theme button. `ThemeProvider` keeps `light` / `dark` in React Context,
writes `<html data-theme="...">`, and the CSS variables do the rest, so every page follows
without passing props. The choice is remembered in `localStorage`.

---

## How the requirements are covered

**Back end**

- MVC folders (`models`, `controllers`, `routes`) plus `middleware` and `utils`.
- Five Mongoose schemas with validation: `User`, `Project`, `BlogPost`, `Comment`, `Message`.
- Passwords are hashed with bcrypt in a `pre('save')` hook and never returned by a query
  (`select: false`); login compares with `bcrypt.compare`.
- JWT signed with `JWT_SECRET`, valid for 30 days; the `protect` middleware verifies it and
  loads `req.user`.
- Blog and project update / delete check that `req.user._id` owns the record (403 otherwise);
  comments can be removed by the comment author or the post author.
- Two roles (`user`, `admin`) with an `adminOnly` middleware: the contact inbox and content
  management are the owner's, while any registered reader may comment.
- `populate()` is used for `Project.user`, `BlogPost.author`, `Comment.author` and the
  comments of a post.
- List endpoints are paginated with a shared `utils/pageOptions.js` helper (`?page=&limit=`,
  maximum 50) and return `items` plus `page` / `pages` / `total`.
- Central error handler (CastError → 400, ValidationError → 400, duplicate key → 400,
  everything else → 500) and a 404 handler.
- `helmet` for secure headers, `cors` restricted to `CLIENT_URL`, `dotenv` for secrets.
- `express.json({ limit: '32kb' })` so an oversized body is rejected with 413 before any
  controller runs.
- `express-rate-limit` in memory: 10 account attempts and 5 contact messages per IP per
  15 minutes, both answering 429.
- `trust proxy` is on by default for hosting platforms, so `req.ip` is the visitor and not
  the Render proxy; `TRUST_PROXY=0` disables it for a direct local connection.
- `/api/users` responses are `Cache-Control: no-store`.

**Front end**

- Component-based architecture with reusable `Header`, `Footer`, `ProjectCard`,
  `BlogPostCard`, `Loader`, `Alert` and `ProtectedRoute`.
- CSS Modules for scoped, responsive styling (grid layouts, mobile breakpoints).
- `useState` for forms, loading and error state; `useEffect` for fetching.
- Context API (`AuthContext`) keeps the token, the user and `login` / `register` / `logout`
  and restores the session from `localStorage` on refresh.
- A second context (`ThemeContext`) owns the colour theme for the whole app; the header button
  and the page styles both read it with `useContext`.
- Admin dashboard sends `Authorization: Bearer <token>` on every write and supports full
  create / edit / delete for both projects and blog posts, plus a read-only messages panel
  and a comment **Delete** action on the blog detail page.

---

## Deployment

**Back end → Render**

1. New → Web Service → connect the repository, root directory `server`.
2. Build command `npm install`, start command `npm start`.
3. Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your front-end URL; a
   comma separated list also works) and `TRUST_PROXY=1` so the rate limits see the real IP.
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
