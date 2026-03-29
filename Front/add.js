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
            title,
            rating: parseFloat(rating) || undefined,
            year: parseInt(year) || undefined,
            duration,
            genre,
            description,
            poster: poster || "",
            background: background || ""
        };

        fetch('/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMovie)
        }).then(res => {
            if (res.ok) {
                window.location.href = 'index.html';
            } else {
                res.json().then(data => alert("Error: " + data.error));
            }
        }).catch(err => console.error("Network Error:", err));
    });
});
