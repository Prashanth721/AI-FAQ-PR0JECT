# AI FAQ Assistant

An AI-powered FAQ and customer support automation REST API. Built with
Node.js, Express, MongoDB (Mongoose), JWT authentication, and Google
Gemini for AI-generated FAQ content.

## 1. Requirements

- Node.js v18+
- MongoDB running locally, OR a free MongoDB Atlas cluster
- A free Gemini API key from https://aistudio.google.com

## 2. Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.

## 3. Run it

```bash
npm run dev
```

## 4. Test the API

Import `AI_FAQ_Assistant_API.postman_collection.json` into Postman
(File → Import), or test manually — see the routes below.

After logging in, copy the `token` from the response and paste it into
the collection's `token` variable (or manually add header
`Authorization: Bearer <token>` for private routes).

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /api/auth/register | Public | Create an account |
| POST | /api/auth/login | Public | Log in, get a JWT token |
| GET | /api/faqs | Public | List all FAQs |
| GET | /api/faqs/search?q=... | Public | Search FAQs by keyword |
| POST | /api/faqs | Private | Create a new FAQ |
| PUT | /api/faqs/:id | Private (owner/admin) | Update an FAQ |
| DELETE | /api/faqs/:id | Private (owner/admin) | Delete an FAQ |
| POST | /api/ai/generate-faq | Private | Gemini generates a draft FAQ from a topic |
| POST | /api/ai/ask | Public | Ask a question, answered from existing FAQs |

## 5. Project structure

```
src/
  server.js                          # entry point
  app.js                             # Express app + route mounting
  config/db.js                       # MongoDB connection
  controllers/authController.js      # register/login logic
  controllers/faqController.js       # FAQ CRUD + search logic
  controllers/aiController.js        # Gemini-powered route logic
  middleware/authMiddleware.js       # JWT route protection
  middleware/errorMiddleware.js      # centralized error handling
  middleware/validationMiddleware.js # request body validation
  models/User.js                     # User schema (password hashing)
  models/FAQ.js                      # FAQ schema
  routes/authRoutes.js
  routes/faqRoutes.js
  routes/aiRoutes.js
  services/geminiService.js          # Gemini API calls
  utils/helpers.js                   # token generation, response shaping
```

## 6. Roles

- **Admin** – full access to everything
- **Content Creator** – create/edit/delete own FAQs, use AI generation
- **Authenticated User** – view/search FAQs, use AI ask
- **Public User** – view/search FAQs only (no login needed)
