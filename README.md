# Business-compliance-reminder
# BusinessDocument Expiry

A bespoke compliance and document renewal tracker designed for small organizations. This platform ensures critical permits, insurance policies, and vendor agreements are actively managed without relying on a cold, corporate interface.

**Core Features**
* **Prioritized Renewal Register:** Automatically ranks documents by upcoming expiry dates.
* **Historical Audit Trail:** Maintains a permanent ledger of all completed renewals.
* **Executive Aesthetic:** Designed with a warm, vintage-luxury UI (deep reds, copper, and parchment creams) to provide a cozy, focused user experience.

**Technical Stack**
* **Database:** MongoDB (Mongoose models: `Document`, `RenewalHistory`)
* **Backend:** Node.js & Express REST API with strict `express-validator` checks and atomic renewal transactions
* **Frontend:** React (Vite) + React Router v7 + Axios + Context API + Custom Luxury Design System

---

## Architecture & Project Structure

```
Business-compliance-reminder/
├── config/
│   └── db.js                      # MongoDB connection (mongoose.connect)
├── controllers/
│   └── documentController.js      # CRUD, prioritized sorting, atomic renewal transaction
├── middleware/
│   ├── errorHandler.js            # Validation error catcher, 404, Mongoose formatters
│   └── validators.js              # Strict express-validator rules for strings & dates
├── models/
│   ├── Document.js                # Document schema (title, owner, expiryDate, status, documentType)
│   ├── RenewalHistory.js          # RenewalHistory schema (documentId, previousExpiryDate, newExpiryDate, renewalDate, completedBy)
│   └── index.js                   # Unified exports
├── routes/
│   └── documentRoutes.js          # Document & renewal API routes
├── server.js                      # Express application entrypoint
├── client/                        # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # ErrorBoundary, AlertBanner, LoadingSpinner
│   │   │   ├── documents/         # DocumentForm, RenewalForm
│   │   │   └── layout/            # Navbar, StatusBadge
│   │   ├── context/               # AppContext (centralized state management & actions)
│   │   ├── services/              # api.js (Axios API client with interceptors)
│   │   ├── styles/                # luxury.css (Vintage luxury design tokens & responsive styles)
│   │   └── views/                 # Dashboard, DocumentRegister, DocumentDetail, RenewalHistoryLog
│   └── vite.config.js             # Dev proxy forwarding /api requests to Express
```

---

## Color Palette & Aesthetic

* **Primary Actions & Urgent Alerts:** Deep Copper / Red (`#9A3F3F`)
* **Secondary Accents & Borders:** Muted Rose / Copper (`#C1856D`)
* **Cards & Containers:** Warm Parchment (`#E6CFA9`)
* **Main Background:** Cream / Warm White (`#FBF9D1`)
* **Typography:** *Playfair Display* (Headings), *EB Garamond* (Body), *Lato* (UI & Data Tables)

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/documents` | All documents sorted closest-to-expiry first (`?status=` optional) |
| `GET` | `/api/documents/:id` | Single document details |
| `POST` | `/api/documents` | Create document with strict validation |
| `PUT` | `/api/documents/:id` | Update document fields |
| `DELETE` | `/api/documents/:id` | Delete document & cascade-clean history |
| `POST` | `/api/documents/:id/renew` | Atomic renewal: updates expiry + inserts `RenewalHistory` |
| `GET` | `/api/documents/:id/history` | Full audit trail for a document, newest first |
| `GET` | `/api/health` | Health & DB connection status check |

---

## Getting Started

### 1. Backend Setup
1. Configure your `.env` in the root directory (refer to `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/business_compliance
   ```
2. Start the Express API server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Move to the client folder and start Vite:
   ```bash
   cd client
   npm run dev
   ```
2. Open [http://localhost:5173](http://localhost:5173) in your browser.
