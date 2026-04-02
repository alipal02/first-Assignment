document.addEventListener("DOMContentLoaded", () => {
  // Select DOM Elements
  const bgContainer = document.getElementById("bg-container");
  const titleEl = document.getElementById("m-title");
  const ratingEl = document.getElementById("m-rating");
  const yearEl = document.getElementById("m-year");
  const durationEl = document.getElementById("m-duration");
  const genreEl = document.getElementById("m-genre");
  const descEl = document.getElementById("m-desc");
  const carouselEl = document.getElementById("carousel");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const searchInput = document.querySelector(".search-bar input");
  const searchContainer = document.querySelector(".search-bar");

  let movies = [];
  let currentIndex = 0;
  let isTransitioning = false;

  async function fetchMovies() {
    try {
      const response = await fetch("/movies");
      if (!response.ok) {
        throw new Error("Network response was not OK");
      }
      movies = await response.json();

      initApp();
    } catch (error) {
      console.error("Fetch error:", error);
      handleError();
    }
  }

  function removeSkeletons() {
    titleEl.classList.remove("skeleton", "skeleton-text");
    ratingEl.classList.remove("skeleton", "skeleton-text", "skeleton-small");
    yearEl.classList.remove("skeleton", "skeleton-text", "skeleton-small");
    durationEl.classList.remove("skeleton", "skeleton-text", "skeleton-small");
    genreEl.classList.remove("skeleton", "skeleton-text", "skeleton-small");
    descEl.classList.remove("skeleton", "skeleton-text", "skeleton-large");
  }

  function initApp() {
    if (!movies || movies.length === 0) return;
    removeSkeletons();
    renderCarousel();
    updateUI(0);
  }

  function handleError() {
    titleEl.classList.remove("skeleton", "skeleton-text");
    titleEl.textContent = "Data Error";
    descEl.classList.remove("skeleton", "skeleton-text", "skeleton-large");
    descEl.textContent =
      "Unable to fetch movie dataset. Ensure data.json exists or check internet connection.";
  }

  // Build footer carousel dynamically
  function renderCarousel() {
    carouselEl.innerHTML = "";

    movies.forEach((movie, index) => {
      const card = document.createElement("div");
      card.className = `poster-card ${index === currentIndex ? "active" : ""}`;
      card.dataset.index = index;

      const safeTitle = encodeURIComponent(movie.title || "Movie");
      const img = document.createElement("img");
      img.src =
        movie.poster ||
        `https://placehold.co/140x210/1a1a2e/ffffff?text=${safeTitle}`;
      img.alt = movie.title || "Poster";

      // Fallback for broken image paths
      img.onerror = function () {
        this.onerror = null;
        this.src = `https://placehold.co/140x210/1a1a2e/ffffff?text=${safeTitle}`;
      };

      card.appendChild(img);

      // Interaction: Change active movie
      card.addEventListener("click", () => {
        if (currentIndex !== index && !isTransitioning) {
          updateUI(index);
        }
      });

      carouselEl.appendChild(card);
    });
  }

  function triggerAnimations() {
    const elementsToAnimate = [
      titleEl,
      document.querySelector(".meta-data"),
      descEl,
      document.querySelector(".actions"),
    ];

    elementsToAnimate.forEach((el) => {
      if (!el) return;
      el.classList.remove("fade-in-up");
      void el.offsetWidth;
      el.classList.add("fade-in-up");
    });
  }

  function updateUI(index) {
    if (index < 0 || index >= movies.length) return;

    isTransitioning = true;
    currentIndex = index;
    const movie = movies[index];

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

    const safeTitleQuery = encodeURIComponent(mTitle);
    const defaultBg = `https://placehold.co/1920x1080/050505/333333?text=${safeTitleQuery}`;
    const bgUrl = movie.background || movie.poster || defaultBg;

    bgContainer.style.setProperty("--bg-image", `url('${bgUrl}')`);

    titleEl.textContent = mTitle;
    ratingEl.textContent = mRating;
    yearEl.textContent = mYear;
    durationEl.textContent = mDuration;
    genreEl.textContent = mGenre;
    descEl.textContent = mDesc;

    const detailsBtn = document.getElementById("details-btn");
    if (detailsBtn) {
      detailsBtn.href = `details.html?id=${movie.id}`;
    }

    triggerAnimations();

    const cards = carouselEl.querySelectorAll(".poster-card");
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add("active");

        // Calculate scroll position to keep it in view nicely
        // We use scrollTo on the carouselEl directly instead of scrollIntoView
        // to prevent the entire browser window from scrolling vertically.
        carouselEl.scrollTo({
          left:
            card.offsetLeft - carouselEl.clientWidth / 2 + card.clientWidth / 2,
          behavior: "smooth",
        });
      } else {
        card.classList.remove("active");
      }
    });

    setTimeout(() => {
      isTransitioning = false;
    }, 400); 
  }

  prevBtn.addEventListener("click", () => {
    if (movies.length === 0 || isTransitioning) return;
    let newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = movies.length - 1; // loop
    updateUI(newIndex);
  });

  nextBtn.addEventListener("click", () => {
    if (movies.length === 0 || isTransitioning) return;
    let newIndex = currentIndex + 1;
    if (newIndex >= movies.length) newIndex = 0; // loop
    updateUI(newIndex);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevBtn.click();
    } else if (e.key === "ArrowRight") {
      nextBtn.click();
    }
  });

  const searchDropdown = document.createElement("div");
  searchDropdown.className = "search-dropdown";
  searchContainer.appendChild(searchDropdown);

  let searchTimeout;
  
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);

    if (!query) {
      searchDropdown.style.display = "none";
      return;
    }

    // Show loading state immediately
    searchDropdown.innerHTML = `
      <div class="search-state loading">
        <i class="fa-solid fa-circle-notch fa-spin"></i>
        <span>Loading...</span>
      </div>
    `;
    searchDropdown.style.display = "block";

    // Debounce the fetch request
    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/movies?search=${encodeURIComponent(query)}&limit=10`);
        if (!res.ok) throw new Error("Search failed");
        const filtered = await res.json();

    searchDropdown.innerHTML = "";

    if (filtered.length === 0) {
      searchDropdown.innerHTML = `
        <div class="search-state empty">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>No results found</span>
        </div>
      `;
      return;
    }

      filtered.forEach((movie) => {
        const div = document.createElement("div");
        div.className = "search-item";

        // To fix broken thumbnail: Try to get the poster locally if it was already fetched by the carousel
        const cachedMovie = movies.find(m => String(m.id) === String(movie.id)) || {};
        let finalPoster = movie.poster || cachedMovie.poster;
        
        const safeTitleQuery = encodeURIComponent(movie.title || movie.original_title || "Movie");
        const placeholder = `https://placehold.co/40x60/1a1a2e/ffffff?text=${safeTitleQuery}`;
        
        div.innerHTML = `
          <img src="${finalPoster || placeholder}" alt="Poster" onerror="this.src='https://placehold.co/40x60/1a1a2e/ffffff?text=N/A'" />
          <span>${movie.title || movie.original_title}</span>
        `;
        
        div.addEventListener("click", () => {
          window.location.href = `details.html?id=${movie.id}`;
        });
        searchDropdown.appendChild(div);
      });
      
      } catch(err) {
        console.error(err);
        searchDropdown.innerHTML = `
          <div class="search-state error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>Something went wrong</span>
          </div>
        `;
      }
    }, 250); // 250ms debounce Wait
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target)) {
      searchDropdown.style.display = "none";
    }
  });

  // Show dropdown when focused again if there's text
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim() && searchDropdown.children.length > 0) {
      searchDropdown.style.display = "block";
    }
  });

  fetchMovies();

  // Ensure the page starts at the very top on reload
  window.scrollTo(0, 0);
});
