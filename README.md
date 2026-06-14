# AsrModa

Integrated Uzbek-first fashion commerce, CRM, ERP and WMS platform.

## Local development

```bash
copy .env.example .env
npm install
docker compose up -d db
npm run dev
```

Frontend: `http://localhost:5173`  
API: `http://localhost:4000/api/health`

## Demo staff accounts

All demo accounts use the password `AsrModa2026!`.

| Role | Email | Access |
| --- | --- | --- |
| Administrator | `admin@asrmoda.uz` | All modules, products and users |
| Sales | `sales@asrmoda.uz` | Dashboard, orders, CRM, products and support |
| Warehouse | `warehouse@asrmoda.uz` | Dashboard, orders, products and WMS |
| Finance | `finance@asrmoda.uz` | Dashboard and ERP/finance |

The storefront includes product search and details, favorites, cart, checkout,
order tracking and a support center. The business workspace includes role-based
CRM, ERP, WMS, product management, support tickets and user administration.

## Image locations

- Hero background: `client/public/assets/hero/hero-background.png`
- Transparent hero people layer: `client/public/assets/hero/hero-people.png`
- Product photography: `client/public/assets/products/<SKU>.png`

The hero people file should be a transparent PNG containing only the models,
with their feet aligned to the bottom of the canvas. Keep the filename
`hero-people.png`; replacing that file updates the website without code changes.

New product images can use any public path. Enter that path in the product
editor's **Rasm manzili** field, for example
`/assets/products/AM-W-101.png`.

## Docker

```bash
docker compose up --build
```

Open `http://localhost:8080`.

Before production, set secure values in `.env`, place the service behind HTTPS, and rotate the demo password.
