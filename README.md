# Native Node.js Movie Backend API

This project is a RESTful backend API for managing a movie database built completely from scratch using only native **Node.js** modules. No Express.js or other external frameworks were utilized.

## How to Run The Server
1. Ensure you have Node.js installed.
2. Clone this repository or open the project folder in your terminal.
3. Run the following command:
   ```bash
   node server.js
   ```
4. The server will start and listen on port **3000** (`http://localhost:3000`).

## Endpoints

### 1. Get All Movies
- **GET** `/movies`
- **Optional Query Parameters**:
  - `?search=<term>`: Implements the bonus requirement to search movies by title or original title (case-insensitive).
  - `?limit=<number>`: Implements the bonus requirement to limit the number of returned results.

### 2. Get Movie by ID
- **GET** `/movies/:id`

### 3. Add a New Movie
- **POST** `/movies`
- **Validation**: Requires `title`. `year` and `rating` must be numeric if provided.
- **Example Request Body**:
  ```json
  {
    "title": "The Dark Knight Builder",
    "year": 2026,
    "rating": 9.5,
    "description": "An amazing movie about building APIs."
  }
  ```

### 4. Update a Movie
- **PATCH** `/movies/:id`
- **Example Request Body**:
  ```json
  {
    "rating": 9.8,
    "description": "Updated the description slightly."
  }
  ```

### 5. Delete a Movie
- **DELETE** `/movies/:id`

## Known Limitations & Assumptions
- **Search limitation**: Search is case-insensitive but looks for basic substring matching rather than complex fuzzy searching to keep the logic lightweight.
- **ID Generation**: For newly POSTed movies, the ID is immediately generated using a simple Unix timestamp string (`Date.now().toString()`) rather than a UUID package to avoid external dependencies.
- **Validation constraints**: Title validates as a non-empty string; however, full strict sanitization is not implemented locally beyond the assignment's exact scope.

## Progress
We successfully implemented the complete standard criteria (including reading from and writing to `movies-db.json` natively) and **both Bonus 1 (search) and Bonus 2 (limit)** perfectly. No third-party modules were employed.

## Challenges
The hardest component originally was gracefully parsing arbitrary incoming payload streams within a vanilla HTTP server without standard middleware components (like `express.json()`) while correctly capturing and propagating syntax/semantic level errors uniformly.
