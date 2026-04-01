document.addEventListener("DOMContentLoaded", () => {
  const bgContainer = document.getElementById("bg-container");
  const posterEl = document.getElementById("d-poster");
  const titleEl = document.getElementById("d-title");
  const ratingEl = document.getElementById("d-rating");
  const yearEl = document.getElementById("d-year");
  const durationEl = document.getElementById("d-duration");
  const genreEl = document.getElementById("d-genre");
  const descEl = document.getElementById("d-desc");
  const editBtn = document.getElementById("edit-btn");
  const deleteBtn = document.getElementById("delete-btn");

  let currentMovie = null;

  async function initDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const indexStr = urlParams.get("index");

    if (!indexStr) {
      handleError("Movie index not provided in URL.");
      return;
    }

    const targetIndex = parseInt(indexStr, 10);

    try {
      const response = await fetch("/movies");
      const movies = await response.json();

      if (targetIndex >= 0 && targetIndex < movies.length) {
        renderMovie(movies[targetIndex]);
      } else {
        handleError("Movie not found.");
      }
    } catch (err) {
      console.error(err);
      handleError("Could not load movie data.");
    }
  }

  function renderMovie(movie) {
    currentMovie = movie;

    if (editBtn) {
      editBtn.href = `edit.html?id=${movie.id}`;
    }

    // Remove skeletons
    document.querySelectorAll(".skeleton").forEach((el) => {
      el.classList.remove(
        "skeleton",
        "skeleton-text",
        "skeleton-small",
        "skeleton-large",
      );
    });

    const mTitle = movie.title || movie.original_title || "Unknown Title";
    const mRating =
      movie.vote_average !== undefined
        ? movie.vote_average.toString()
        : movie.rating;
    const mYear = movie.release_date
      ? movie.release_date.split("/")[2] || movie.release_date.substring(0, 4)
      : movie.year;

    let mDuration = movie.duration;
    if (movie.runtime !== undefined) {
      const hours = Math.floor(movie.runtime / 60);
      const mins = movie.runtime % 60;
      mDuration = `${hours} hour${hours > 1 ? "s" : ""} ${mins} minute${mins !== 1 ? "s" : ""}`;
    }

    const mGenre = movie.genres || movie.genre || "Unknown Genre";
    const mDesc =
      movie.overview ||
      movie.description ||
      "No description available for this movie.";

    titleEl.textContent = mTitle;
    ratingEl.textContent = mRating;
    yearEl.textContent = mYear;
    durationEl.textContent = mDuration;
    genreEl.textContent = mGenre;
    descEl.textContent = mDesc;

    const safeTitleQuery = encodeURIComponent(mTitle);

    // Default fallback
    let posterUrl =
      movie.poster ||
      `https://placehold.co/300x450/1a1a2e/ffffff?text=${safeTitleQuery}`;
    let bgUrl =
      movie.background ||
      movie.poster ||
      `https://placehold.co/1920x1080/050505/333333?text=${safeTitleQuery}`;

    // If TMDB and standard poster missing, fetch it
    if (!movie.poster && movie.id && !movie.imdb_id) {
      fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=8265bd1679663a7ea12ac168da84d2e8`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.poster_path) {
            posterEl.src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
          }
          if (data.backdrop_path) {
            bgContainer.style.setProperty(
              "--bg-image",
              `url('https://image.tmdb.org/t/p/original${data.backdrop_path}')`,
            );
          }
        })
        .catch((err) => console.error(err));
    }

    // Try falling back to IMDb if present
    if (!movie.poster && movie.imdb_id) {
      fetch(`https://api.themoviedb.org/3/find/${movie.imdb_id}?external_source=imdb_id&api_key=8265bd1679663a7ea12ac168da84d2e8`)
        .then(res => res.json())
        .then(data => {
            if (data.movie_results && data.movie_results.length > 0) {
                const results = data.movie_results[0];
                if (results.poster_path) posterEl.src = `https://image.tmdb.org/t/p/w500${results.poster_path}`;
                if (results.backdrop_path) bgContainer.style.setProperty("--bg-image", `url('https://image.tmdb.org/t/p/original${results.backdrop_path}')`);
            }
        }).catch(err => console.error(err));
    }

    posterEl.src = posterUrl;
    bgContainer.style.setProperty("--bg-image", `url('${bgUrl}')`);
  }

  function handleError(msg) {
    document.querySelectorAll(".skeleton").forEach((el) => {
      el.classList.remove(
        "skeleton",
        "skeleton-text",
        "skeleton-small",
        "skeleton-large",
      );
    });
    titleEl.textContent = "Error";
    descEl.textContent = msg;
    posterEl.style.display = "none";
  }

  // Delete Action
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (!currentMovie || !currentMovie.id) return;
      
      if (window.notifier) {
        window.notifier.showConfirm(
          "Delete Movie", 
          `Are you sure you want to permanently delete "${currentMovie.title || currentMovie.original_title}"?`,
          () => {
            performDelete(currentMovie.id);
          }
        );
      } else {
        if (confirm("Are you sure you want to delete this movie?")) {
          performDelete(currentMovie.id);
        }
      }
    });
  }

  function performDelete(id) {
    fetch(`/movies/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (res.ok) {
        if (window.notifier) window.notifier.showToast("Movie deleted successfully!", "success");
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      } else {
        res.json().then(data => {
          if (window.notifier) window.notifier.showToast("Error executing delete: " + data.error, "error");
        });
      }
    })
    .catch(err => {
      console.error(err);
      if (window.notifier) window.notifier.showToast("Network Error during deletion", "error");
    });
  }

  initDetails();
});
