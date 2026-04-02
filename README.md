# Movie Application

This project is a movie browsing application encompassing both a frontend and a RESTful backend API. The backend is built completely from scratch using native **Node.js** modules (without Express.js or other external frameworks), and it serves the static vanilla HTML/CSS/JS frontend alongside the API.

## How to run the project
**Explain how to start both frontend and backend**

Because the frontend and backend are tightly integrated in a monolithic architecture, they both start with a single command. 

1. Ensure you have Node.js installed on your machine.
2. Clone this repository or open the project folder in your terminal.
3. Run the following command:

node server.js

4. The server will start and listen on port **3000**.
   - **Frontend:** You can access the application interface by navigating your web browser to `http://localhost:3000/`
   - **Backend API:** The backend API base URL is available at `http://localhost:3000/movies`

## List of endpoints

1. **GET `/movies`**
   - Retrieves all movies.
   - **Query Parameters:**
     - `?search=<term>`: Search movies by title or original title (case-insensitive).
     - `?limit=<number>`: Limit the number of returned results.
2. **GET `/movies/:id`**
   - Retrieves a specific movie by its unique ID.
3. **POST `/movies`**
   - Creates and adds a new movie to the database. Requires a `title` (string) and a `year` (number).
4. **PATCH `/movies/:id`**
   - Updates an existing movie partially by its ID.
5. **DELETE `/movies/:id`**
   - Deletes a specific movie by its ID.

## Example request body

When testing the **POST `/movies`** or **PATCH `/movies/:id`** endpoints, you should send a valid JSON body. 

**Example POST Request Body:**
```json
{
  "title": "The Dark Knight Builder",
  "year": 2026,
  "rating": 9.5,
  "description": "An amazing movie about building APIs."
}
```

**Example PATCH Request Body:**
```json
{
  "rating": 9.8,
  "description": "Updated the description slightly."
}
```

## Any assumptions you made
**Was anything unclear? What did you assume?**

- **Database:** I assumed that using a local JSON file (`movies-db.json`) as a makeshift database was acceptable in place of a full SQL or NoSQL production database purely for learning native Node.js filesystem (`fs`) interactions.
- **Serving the Frontend:** I assumed serving the frontend and API from the exact same Node.js server on standard port 3000 was the most sensible design since there are no heavy build tools (Webpack/Vite) required for the vanilla frontend.
- **IDs:** I assumed sequential timestamps (`Date.now().toString()`) are perfectly functional as pseudorandom unique identifiers for newly created records rather than relying on external `uuid` packages.

## Any known limitations
**What did you not implement or simplify? Why?**

- **Search Capabilities:** The `search` parameter performs a basic substring match instead of fuzzy finding. I simplified this to keep the API's sorting logic lightweight.


## Your progress
**What you completed, what you didn’t, and why**

- **Completed:** I successfully built a robust native Node.js API with zero external dependencies to handle all standard CRUD operations. I also successfully implemented bonus requirements for filtering limits (`?limit=x`) and searching (`?search=y`). The API successfully writes synchronously to the backend `JSON` file. Furthermore, the frontend correctly consumes these endpoints, displays lists, searches, deletes, and adds items.
- **Didn't Complete:** 
Poster Image
Add poster_image using imdb_id + API

## Challenges you faced
**What was hardest for you**

1. **Parsing Request Streams without Express:** The hardest part of the backend was gracefully assembling data streams sequentially into parsing chunks inside a vanilla HTTP server via `req.on('data')` and `req.on('end')` without handy middleware like `express.json()`, and ensuring errors arising from invalid JSON payloads were caught gracefully.
2. **Serving Static Files:** Differentiating API routes from static files and manually handling the MIME types (`image/jpeg`, `text/css`, etc.) required a lot of boilerplate that Express natively manages in one line.
3. **UI State Management:** Handling state transitions visually on the frontend (e.g., swapping a component out to show a loading spinner, and then replacing it with search results or an error page) was tricky when managing lots of raw DOM manual logic.
