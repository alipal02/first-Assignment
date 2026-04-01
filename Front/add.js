document.getElementById('add-movie-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    
    // Parse the form data safely
    const payload = {
        title: formData.get('title'),
        year: parseInt(formData.get('year'), 10),
        rating: formData.get('rating') ? parseFloat(formData.get('rating')) : undefined,
        runtime: formData.get('duration') ? parseInt(formData.get('duration'), 10) : undefined,
        genres: formData.get('genres') || undefined,
        overview: formData.get('overview') || undefined,
        poster: formData.get('poster') || undefined,
        background: formData.get('background') || undefined
    };

    try {
        const res = await fetch('/movies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            window.showToast("Movie added successfully!", "success");
            setTimeout(() => {
                window.location.href = `details.html?id=${data.movie.id}`;
            }, 1000);
        } else {
            window.showToast(data.error || "Failed to add movie", "error");
        }
    } catch(err) {
        console.error(err);
        window.showToast("An unexpected error occurred", "error");
    }
});
