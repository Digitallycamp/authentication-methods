```batch
session-base-auth/
├── src/
│ ├── app.js # Express application setup & middleware pipelines
│ ├── server.js # Server initialization (HTTP & Database boot)
│ │
│ ├── common/ # Shared global resources (Domain-agnostic)
│ │ ├── db/
│ │ │ └── mongo.js # Database connection instance (e.g., Mongoose Client)
│ │ ├── middleware/
│ │ │ ├── auth.guard.js # JWT / Session authentication verifier middleware
│ │ │ └── error.log.js # Global centralized error handling interceptor
│ │ └── utils/
│ │ ├── email.util.js # Low-level email transporter config (Nodemailer/SendGrid)
│ │ └── cron.util.js # Background task scheduler engine (Node-cron/Agenda)
│ │
│ └── module/ # Domain-Driven Feature Modules
│ ├── auth/ # Authentication mechanics domain
│ │ ├── auth.controller.js
│ │ ├── auth.repository.js
│ │ ├── auth.routes.js
│ │ └── auth.services.js
│ │
│ ├── user/ # Identity domain (Owns schema, profiles, & account updates)
│ │ ├── user.controller.js
│ │ ├── user.model.js # Master Schema (Auth states + nested Profile object)
│ │ ├── user.repository.js # Direct database access queries for users
│ │ ├── user.routes.js # User/Profile endpoint definitions
│ │ └── user.services.js # Identity business logic & cross-module interface
│ │
│ └── note/ # Notes & Scheduling domain
│ ├── note.controller.js
│ ├── note.model.js # Tracks note payload, owner userId, & scheduledAt timestamp
│ ├── note.repository.js # Direct database queries for notes (e.g., fetch pending cron jobs)
│ ├── note.routes.js # Note creation, update, and scheduling endpoints
│ └── note.services.js # Note creation validation & scheduler orchestration
│
├── .env # Application environment variables
├── .gitignore
├── package.json
└── README.md
```

## 📄 User Module Component Documentation

### 🛣️ 1. `user.routes.js` (The Gatekeeper)

This file defines the HTTP endpoints related to users and profiles. It is strictly responsible for routing requests, applying authentication or authorization guards, and forwarding the request to the controller.

- **Responsibilities:**
- Maps URLs to specific controller methods (e.g., `GET /api/users/me` $\rightarrow$ `userController.getProfile`).
- Enforces the authentication guard middleware (`auth.guard.js`) to ensure anonymous requests are blocked.
- Handles request payload validation before passing the data deeper into the application.

- **Scale Tip:** Never put business logic or data manipulation code in this file. It should only read like an index table for your HTTP endpoints.

### ⚙️ 2. `user.services.js` (The Brains)

This layer contains the core **business logic** of the user domain. It coordinates actions, handles data transformations, triggers other modules (like calling the `email.util` when a user profile updates), and enforces domain-specific business rules.

- **Responsibilities:**
- Orchestrates user operations (e.g., calculating profile completion rates or formatting address fields).
- Validates business rules (e.g., _"Is this user account suspended? If yes, throw a 403 error"_).
- Serves as the safe public API interface for **other modules** (like `auth` or `note`) to securely request user data.

- **Scale Tip:** This layer should never know _how_ the database works. It shouldn't know if you are using MongoDB, PostgreSQL, or an external API; it simply calls the repository layer to get or save data.

### 📦 3. `user.repository.js` (The Data Vault)

The repository layer encapsulates all direct **database access code**. It isolates your database library (Mongoose/Prisma) from the rest of the application. If you ever need to change your database queries, optimize indexes, or swap databases entirely, this is the _only_ file you will ever touch in the user module.

- **Responsibilities:**
- Performs atomic database operations using the model (`User.findById`, `User.updateOne`, etc.).
- Handles complex query mechanics, such as data projection (e.g., hiding the `password` hash field by default when pulling profiles).
- Aggregates database optimization patterns like selective indexing or pagination parameters.

- **Scale Tip:** Methods here should be highly specialized and simple, named after data intent (e.g., `findUserByEmail`, `updateProfileData`, `createNewUser`).

---

## 🔄 Execution Flow Example

To see how these layers seamlessly handle a request together without locking up your data flow:

$$\text{HTTP Request} \longrightarrow \text{user.routes} \longrightarrow \text{user.controller} \longrightarrow \text{user.services} \longrightarrow \text{user.repository} \longrightarrow \text{Database}$$

1. **`user.routes`** intercept a `PATCH /api/users/profile` request, verifies the user's login session token, and triggers the controller.
2. The controller extracts the profile payload from the request body and passes it to **`user.services`**.
3. **`user.services`** checks if the phone number format is valid and cleans up the input. It then calls **`user.repository`**.
4. **`user.repository`** executes the actual database command against `user.model.js` to update the document and passes the fresh records back up the chain.
