# Database ER Diagram

```mermaid
erDiagram
  User ||--o{ Product : creates
  User ||--o{ InventoryTransaction : performs
  Category ||--o{ Product : has
  Product ||--o{ InventoryTransaction : logs

  User {
    ObjectId _id
    string name
    string email UK
    string password
    string role
    date createdAt
    date updatedAt
  }

  Category {
    ObjectId _id
    string name UK
    string description
    ObjectId createdBy
    date createdAt
    date updatedAt
  }

  Product {
    ObjectId _id
    string name
    string sku UK
    ObjectId category
    string description
    number quantity
    number unitPrice
    string supplierName
    ObjectId createdBy
    date createdAt
    date updatedAt
  }

  InventoryTransaction {
    ObjectId _id
    ObjectId product
    ObjectId user
    string type
    number quantityChange
    number previousQty
    number newQty
    string note
    date createdAt
  }
```

## Notes

- Product **status** is derived at runtime from `quantity` and `LOW_STOCK_THRESHOLD` (not stored).
- Roles: `admin`, `staff`.
- Category delete is blocked when products still reference the category.
