# build-backend-foundation
Project has three phases: 
1) Build the domain and database foundation
2) Implement the local REST API
3) Build the Supabase backend deployment

## Phase 1
### Manga Marketplace Core Domain ERD
This ERD reflects all entities and relationships defined by the Prisma schema and migrations in this phase. Nullable columns are marked in the attribute descriptions.

```mermaid
erDiagram
    direction LR

    AUTH_USERS ||--o| PROFILES : "has"
    AUTH_USERS ||--o{ USER_ROLES : "receives"
    PROFILES ||--o{ INVENTORY_ITEMS : "owns"
    PROFILES ||--o{ LISTINGS : "sells"
    PROFILES ||--o{ MEDIA_ASSETS : "uploads"
    CATALOG_PRODUCTS ||--o{ INVENTORY_ITEMS : "describes"
    INVENTORY_ITEMS ||--o{ LISTING_ITEMS : "included through"
    LISTINGS ||--o{ LISTING_ITEMS : "contains"
    CATALOG_PRODUCTS o|--o{ MEDIA_ASSETS : "may illustrate"
    INVENTORY_ITEMS o|--o{ MEDIA_ASSETS : "may illustrate"
    LISTINGS o|--o{ MEDIA_ASSETS : "may illustrate"

    AUTH_USERS {
        uuid auth_user_id PK
        string email UK
        string password_hash
        datetime created_at
        datetime updated_at
    }

    PROFILES {
        uuid profile_id PK
        uuid auth_user_id FK, UK
        string username UK
        string display_name "nullable"
        string bio "nullable"
        string avatar_path "nullable"
        datetime created_at
        datetime updated_at
    }

    USER_ROLES {
        uuid user_role_id PK
        uuid auth_user_id FK
        UserRoleType role
        uuid assigned_by_auth_user_id "nullable"
        datetime created_at
    }

    CATALOG_PRODUCTS {
        uuid product_id PK
        string title
        string series "nullable"
        int volume_number "nullable"
        string edition "nullable"
        string isbn UK "nullable"
        string author "nullable"
        string publisher "nullable"
        string language "nullable"
        date publication_date "nullable"
        datetime created_at
        datetime updated_at
    }

    INVENTORY_ITEMS {
        uuid item_id PK
        uuid product_id FK
        uuid owner_id FK
        string condition
        string condition_notes "nullable"
        InventoryStatus availability
        decimal acquisition_price "nullable, CHECK >= 0"
        datetime created_at
        datetime updated_at
    }

    LISTINGS {
        uuid listing_id PK
        uuid seller_id FK
        string title
        string description "nullable"
        decimal price "CHECK > 0"
        ListingType listing_type
        ListingStatus status
        datetime created_at
        datetime updated_at
    }

    LISTING_ITEMS {
        uuid listing_item_id PK
        uuid listing_id FK
        uuid item_id FK
    }

    MEDIA_ASSETS {
        uuid media_asset_id PK
        uuid owner_id FK
        string bucket
        string object_path
        string original_file_name
        string mime_type
        int file_size
        string alt_text "nullable"
        uuid product_id FK "nullable"
        uuid item_id FK "nullable"
        uuid listing_id FK "nullable"
        datetime created_at
        datetime updated_at
    }
```

Enum values:

- `UserRoleType`: `USER`, `DEVELOPER`, `ADMIN`
- `InventoryStatus`: `AVAILABLE`, `RESERVED`, `SOLD`, `REMOVED`
- `ListingType`: `SINGLE`, `BUNDLE`
- `ListingStatus`: `DRAFT`, `ACTIVE`, `RESERVED`, `SOLD`, `CANCELLED`, `ARCHIVED`

The schema also enforces composite uniqueness for `(auth_user_id, role)` on `USER_ROLES` and `(listing_id, item_id)` on `LISTING_ITEMS`.
