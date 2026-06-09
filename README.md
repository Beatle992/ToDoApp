# ToDoApp

A full-stack Todo application built with React, ASP.NET Core, PostgreSQL and Docker.

## Features

* Create todos
* Mark todos as completed
* Delete todos
* Organize todos in groups
* Automatic Completed group
* Dark theme UI
* PostgreSQL database storage
* REST API backend
* Docker deployment
* Tailscale remote access support

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* ASP.NET Core 8
* Entity Framework Core
* PostgreSQL
* REST API

### Infrastructure

* Docker
* Docker Compose (planned)
* Tailscale

## Project Structure

```text
TodoAppApi/
├── Controllers/
├── Data/
├── Models/
├── Services/
├── Migrations/
├── Program.cs
├── appsettings.json
│
└── TodoAppFrontend/
    ├── src/
    ├── public/
    ├── package.json
    └── vite.config.js
```

## Database Model

### Todo

| Field     | Type     |
| --------- | -------- |
| Id        | int      |
| Title     | string   |
| Completed | bool     |
| Priority  | int      |
| CreatedAt | DateTime |

Current PostgreSQL table:

```sql
todos
├── id
├── title
├── completed
├── priority
├── created_at
└── UserId
```

## Running the Backend

```bash
cd TodoAppApi

dotnet restore
dotnet run
```

API endpoint:

```text
http://localhost:5000/api/todos
```

## Running the Frontend

```bash
cd TodoAppFrontend

npm install
npm run dev -- --host
```

Frontend:

```text
http://localhost:5173
```

## Docker

Start PostgreSQL:

```bash
docker start todo-db
```

Start API:

```bash
docker start todoapi
```

Check containers:

```bash
docker ps
```

## API Endpoints

### Get all todos

```http
GET /api/todos
```

### Get todo by id

```http
GET /api/todos/{id}
```

### Create todo

```http
POST /api/todos
```

Example:

```json
{
  "title": "Buy milk",
  "completed": false,
  "priority": 1
}
```

### Update todo

```http
PUT /api/todos/{id}
```

### Delete todo

```http
DELETE /api/todos/{id}
```

## Roadmap

* [x] PostgreSQL integration
* [x] ASP.NET Core API
* [x] React frontend
* [x] Docker deployment
* [x] Dark theme
* [x] Todo groups
* [x] Completed section
* [ ] Group persistence in database
* [ ] User authentication
* [ ] Multi-user support
* [ ] Docker Compose setup
* [ ] Mobile responsive UI
* [ ] Drag & drop tasks
* [ ] Notifications

## Author

Created by Leo as a learning project for full-stack development with .NET, PostgreSQL and React.
