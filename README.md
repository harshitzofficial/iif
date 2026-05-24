# Zoho Inventory E-Commerce Integration

A modular, high-performance, 4-page e-commerce web application featuring real-time synchronization with Zoho Inventory APIs. This project demonstrates a robust backend caching architecture, dynamic Zoho API proxying for product media, secure OAuth authentication, and single-page routing to eliminate UI latency.

---

## 🏗️ Architecture & Design

```mermaid
graph TD
    subgraph Frontend (React SPA)
        L[Landing Page] <--> P[Product Listing Page]
        P <--> D[Product Detail Page]
        D <--> C[Cart Page]
    end

    subgraph Backend (Express Node.js)
        R[API Router] --> zohoRoute[Products Route /api/products]
        R --> cartRoute[Cart Route /api/cart]
        zohoRoute --> zohoServ[Zoho Service]
        cartRoute --> zohoServ
        zohoServ --> Cache[(Node-Cache Memory Cache)]
    end

    subgraph External
        zohoServ <--> ZohoAPI[Zoho Inventory REST API]
        zohoServ <--> ZohoAuth[Zoho OAuth Server]
    end

    style Cache fill:#f9f,stroke:#333,stroke-width:2px
    style ZohoAPI fill:#bbf,stroke:#333,stroke-width:2px
```

### 1. Component-Based Single Page Application (SPA)
Built using **React (Vite)** and **React Router DOM**. Navigation between pages does **not** trigger a browser reload. Instead, page switches occur via client-side DOM transitions, providing a fluid, instantaneous user experience.

### 2. Caching Layer (`node-cache`)
To prevent hitting Zoho's API rate limits and minimize server response latency, the backend integrates an in-memory caching mechanism (`node-cache`).
- **Product Index (`/items`):** Capped with a 5-minute TTL. Subsequent page loads fetch instantaneously (<10ms).
- **Single Products:** Cached individually to optimize the Detail Page retrieval.

### 3. Secure Zoho Media Proxy
Browsers cannot attach Authorization headers to standard `<img>` requests. To solve this, our backend implements a **Media Proxy Endpoint (`/api/products/:id/image`)**. It fetches the binary image stream from Zoho using the OAuth Token and pipes it back safely to the browser, offering a fallback to deterministic local sample assets if no Zoho image is present.

---

## 📋 Features & Evaluation Compliance

- **4-Page Layout:** Landing Page, Product Listing, Product Detail, and a complete Cart Page.
- **Custom Field Mapping:** Maps custom fields (`Security Deposit` and `Delivery Charges`) directly from Zoho Inventory.
- **Upfront Pricing Math:** Cart total correctly calculates the grand total including `Product Price + Security Deposit + Delivery Charges`.
- **Mock Fallback:** If Zoho credentials are not configured, the system falls back gracefully to a fully mocked dataset to allow testing without an active Zoho Organization.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone & Install Dependencies
Run the following commands in your workspace root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configuration (`.env`)
Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=5000
ZOHO_CLIENT_ID=your_client_id_here
ZOHO_CLIENT_SECRET=your_client_secret_here
ZOHO_REFRESH_TOKEN=your_refresh_token_here
ZOHO_ORGANIZATION_ID=your_org_id_here
```

> **Note:** If these fields are empty or not configured, the app will run in **Mock Mode** using sample assets automatically.

### 3. Launching the App
Start both servers concurrently:

```bash
# In the backend folder
npm run dev # or node server.js

# In the frontend folder
npm run dev
```
Open your browser to the local URL (usually `http://localhost:5173`).

---

## 🔗 Backend API Reference

### 📦 Products
- **`GET /api/products`** - Fetches all formatted products with their custom fields.
- **`GET /api/products/:id`** - Returns details for a single product.
- **`GET /api/products/:id/image`** - Image proxy pipe endpoint that fetches Zoho images securely or falls back to sample placeholders.

### 🛒 Cart (In-Memory Session)
- **`GET /api/cart`** - Retrieves the current cart items and calculated pricing blocks.
- **`POST /api/cart`** - Appends a product to the cart (validates Zoho prices dynamically).
- **`PUT /api/cart/:id`** - Modifies the item count.
- **`DELETE /api/cart/:id`** - Evicts an item from the cart.
