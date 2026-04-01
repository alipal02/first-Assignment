document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('edit-movie-form');
    const fetchImdbBtn = document.getElementById('fetch-imdb-btn');
    
    // Parse URL for Movie ID
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get("id");

    if (!movieId) {
        if (window.notifier) window.notifier.showToast("Movie ID is missing!", "error");
        setTimeout(() => window.location.href = "index.html", 2000);
        return;
    }

    // Pre-fill the form with existing movie data
    try {
        const res = await fetch(`/movies/${movieId}`);
        if (!res.ok) throw new Error("Could not fetch movie details");
        const movie = await res.json();

        document.getElementById('title').value = movie.title || movie.original_title || "";
        document.getElementById('rating').value = movie.vote_average !== undefined ? movie.vote_average : (movie.rating || "");
        
        let mYear = movie.year || "";
        if (movie.release_date) {
            mYear = movie.release_date.split("/")[2] || movie.release_date.substring(0, 4);
        }
        document.getElementById('year').value = mYear;
        
        let mDuration = movie.duration || "";
        if (movie.runtime) {
            const hours = Math.floor(movie.runtime / 60);
            const mins = movie.runtime % 60;
            mDuration = `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins !== 1 ? "s" : ""}`;
        }
        document.getElementById('duration').value = mDuration;
        
        document.getElementById('genre').value = movie.genres || movie.genre || "";
        document.getElementById('description').value = movie.overview || movie.description || "";
        document.getElementById('poster').value = movie.poster || "";
        document.getElementById('background').value = movie.background || "";
        
        if (movie.imdb_id) {
            const imdbEl = document.getElementById('imdb_id');
            if(imdbEl) imdbEl.value = movie.imdb_id;
        }

    } catch (err) {
        console.error(err);
        if (window.notifier) window.notifier.showToast("Failed to load movie for editing.", "error");
    }

    // Fetch from IMDb via TMDB proxy
    if (fetchImdbBtn) {
        fetchImdbBtn.addEventListener('click', async () => {
            const imdbId = document.getElementById('imdb_id').value.trim();
            if (!imdbId) {
                if(window.notifier) window.notifier.showToast("Please enter an IMDb ID first", "error");
                return;
            }

            fetchImdbBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading';
            fetchImdbBtn.disabled = true;

            try {
                const response = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id&api_key=8265bd1679663a7ea12ac168da84d2e8`);
                const data = await response.json();

                if (data.movie_results && data.movie_results.length > 0) {
                    const movie = data.movie_results[0];
                    if (movie.poster_path) {
                        document.getElementById('poster').value = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
                    }
                    if (movie.backdrop_path) {
                        document.getElementById('background').value = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
                    }
                    if (window.notifier) window.notifier.showToast("Images successfully retrieved!", "success");
                } else {
                    if (window.notifier) window.notifier.showToast("No images found for this IMDb ID", "error");
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                if (window.notifier) window.notifier.showToast("Network error while trying to reach TMDB", "error");
            } finally {
                fetchImdbBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> Retrieve';
                fetchImdbBtn.disabled = false;
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const rating = document.getElementById('rating').value.trim();
        const year = document.getElementById('year').value.trim();
        const duration = document.getElementById('duration').value.trim();
        const genre = document.getElementById('genre').value.trim();
        const description = document.getElementById('description').value.trim();
        const poster = document.getElementById('poster').value.trim();
        const background = document.getElementById('background').value.trim();
        const imdb_id = document.getElementById('imdb_id') ? document.getElementById('imdb_id').value.trim() : undefined;

        const updatedMovie = {
            title,
            rating: parseFloat(rating) || undefined,
            year: parseInt(year) || undefined,
            duration,
            genre,
            description,
            poster: poster || "",
            background: background || "",
            imdb_id: imdb_id
        };

        fetch(`/movies/${movieId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMovie)
        }).then(res => {
            if (res.ok) {
                if (window.notifier) window.notifier.showToast("Movie updated successfully!", "success");
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                res.json().then(data => {
                    if (window.notifier) window.notifier.showToast("Error: " + data.error, "error");
                });
            }
        }).catch(err => {
            console.error("Network Error:", err);
            if (window.notifier) window.notifier.showToast("Network Error", "error");
        });
    });
});
