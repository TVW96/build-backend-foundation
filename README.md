# build-backend-foundation
The Manga Marketplace database separates catalog products, seller-owned inventory items, and marketplace listings into distinct tables. This structure ensures that general manga information, individual physical copies, and sales offers can each be managed independently while remaining connected through defined relationships. This is how the marketplace’s core domain is defined.

## Manga Marketplace Core Domain ERD
```mermaid
---
config:
  layout: elk
  theme: base
  themeVariables:
      primaryColor: "#F0F8FF" # Table background
      primaryBorderColor: "#1ca9c9" # Table borders
      primaryTextColor: "#1f2937"  # Table text
      lineColor: "#0071c5"
---
erDiagram
  direction LR

    CATALOG_PRODUCT ||--o{ INVENTORY_ITEM : "describes"
    INVENTORY_ITEM ||--o{ LISTING_ITEM : "included through"
    LISTING ||--|{ LISTING_ITEM : "contains"

    CATALOG_PRODUCT {
        uuid productId PK
        string title
        string series
        int volumeNumber
        string edition
        string isbn
        string author
        string publisher
        string language
        date publicationDate
    }

    INVENTORY_ITEM {
        uuid itemId PK
        uuid productId FK
        uuid ownerId FK
        string condition
        string conditionNotes
        string availability
        decimal acquisitionPrice
        string sellerPhotoPath
    }

    LISTING {
        uuid listingId PK
        uuid sellerId FK
        string title
        string description
        decimal price
        string status
        datetime createdAt
    }

    LISTING_ITEM {
        uuid listingItemId PK
        uuid listingId FK
        uuid itemId FK
    }
```
