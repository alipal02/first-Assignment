document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById('back-link').href = `details.html?id=${id}`;

    // Load data
    try {
        const res = await fetch(`/movies/${id}`);
        if (!res.ok) throw new Error("Movie not found");
        const movie = await res.json();
        
        document.getElementById('e-title-header').textContent = movie.title || movie.original_title || "Unknown";
        
        // Setup background preview safely
        const safeTitle = encodeURIComponent(movie.title || movie.original_title || "Movie");
        const bgUrl = movie.background || movie.poster || `https://placehold.co/1920x1080/050505/333333?text=${safeTitle}`;
        document.getElementById('bg-container').style.setProperty('--bg-image', `url('${bgUrl}')`);

        // Populate fields
        document.getElementById('title').value = movie.title || movie.original_title || "";
        
        let mYear = movie.year;
        if (!mYear && movie.release_date) mYear = parseInt(movie.release_date.substring(0, 4));
        document.getElementById('year').value = mYear || "";
        
        let mRating = movie.rating !== undefined ? movie.rating : (movie.vote_average || "");
        document.getElementById('rating').value = mRating;
        
        let mRuntime = movie.runtime || movie.duration || "";
        document.getElementById('duration').value = mRuntime;
        
        document.getElementById('genres').value = movie.genres || movie.genre || "";
        
        document.getElementById('overview').value = movie.overview || movie.description || "";
        
        document.getElementById('poster').value = movie.poster || "";
        document.getElementById('background').value = movie.background || "";

        document.getElementById('loading').style.display = 'none';
        document.getElementById('form-container').style.display = 'block';

    } catch(e) {
        window.showToast("Failed to load details. " + e.message, "error");
        setTimeout(() => window.location.href = "index.html", 2000);
    }

    // Submit changes
    document.getElementById('edit-movie-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        
        const payload = {
            title: formData.get('title'),
            year: parseInt(formData.get('year'), 10),
        };
        
        if (formData.get('rating')) payload.rating = parseFloat(formData.get('rating'));
        if (formData.get('duration')) payload.runtime = parseInt(formData.get('duration'), 10);
        if (formData.get('genres')) payload.genres = formData.get('genres');
        if (formData.get('overview')) payload.overview = formData.get('overview');
        if (formData.get('poster')) payload.poster = formData.get('poster');
        if (formData.get('background')) payload.background = formData.get('background');

        try {
            const res = await fetch(`/movies/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                window.showToast("Movie updated successfully!", "success");
                setTimeout(() => {
                    window.location.href = `details.html?id=${id}`;
                }, 1000);
            } else {
                window.showToast(data.error || "Failed to update movie", "error");
            }
        } catch(err) {
            console.error(err);
            window.showToast("An unexpected error occurred", "error");
        }
    });
});
