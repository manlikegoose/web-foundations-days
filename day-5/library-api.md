
# Library Books REST API Design

## Base URL

`https://api.example.com`

## 1. List All Books

- **Method:** GET
- **Path:** `/books`
- **Description:** Retrieves a list of all books in the library.
- **Success status:** `200 OK`
- **Example request body:** Not required.

## 2. Get a Single Book

- **Method:** GET
- **Path:** `/books/{id}`
- **Description:** Retrieves details of a book using its unique ID.
- **Success status:** `200 OK`
- **Example request body:** Not required.

## 3. Create a Book

- **Method:** POST
- **Path:** `/books`
- **Description:** Adds a new book to the library.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publishedYear": 1958
}
```

- **Success status:** `201 Created`

## 4. Update a Book

- **Method:** PUT
- **Path:** `/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Example request body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "publishedYear": 1958
}
```

- **Success status:** `200 OK`

## 5. Delete a Book

- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Deletes a book using its unique ID.
- **Success status:** `204 No Content`
- **Example request body:** Not required.

## 6. List Books by Author

- **Method:** GET
- **Path:** `/books?author=Chinua%20Achebe`
- **Description:** Retrieves books written by the specified author using a query parameter.
- **Success status:** `200 OK`
- **Example request body:** Not required.

## Error Responses

### 400 Bad Request

- **Description:** The request contains invalid data or fails validation.
- **Example:** Creating a book without a required title or sending an invalid publication year.
- **Example response:**

```json
{
  "error": "Invalid book data"
}
```

### 404 Not Found

- **Description:** The requested resource does not exist.
- **Example:** Requesting `GET /books/9999` when book ID 9999 does not exist.
- **Example response:**

```json
{
  "error": "Book not found"
}
```
