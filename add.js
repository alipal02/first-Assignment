document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-movie-form');

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

        const newMovie = {
            id: 'local_' + Date.now(),
            title,
            rating,
            year,
            duration,
            genre,
            description,
            poster: poster || "",
            background: background || ""
        };

        const userMovies = JSON.parse(localStorage.getItem('userMovies')) || [];
        userMovies.unshift(newMovie);
        localStorage.setItem('userMovies', JSON.stringify(userMovies));

        window.location.href = 'index.html';
    });
});
