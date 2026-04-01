document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = "index.html";
        return;
    }

    try {
        const res = await fetch(`/movies/${id}`);
        if (!res.ok) throw new Error("Movie not found");
        const movie = await res.json();
        
        const safeTitle = encodeURIComponent(movie.title || movie.original_title || "Movie");
        
        document.getElementById('d-poster').src = movie.poster || `https://placehold.co/300x450/1a1a2e/ffffff?text=${safeTitle}`;
        
        const bgUrl = movie.background || movie.poster || `https://placehold.co/1920x1080/050505/333333?text=${safeTitle}`;
        document.getElementById('bg-container').style.setProperty('--bg-image', `url('${bgUrl}')`);
        
        document.getElementById('d-title').textContent = movie.title || movie.original_title || "Unknown";
        
        let mDuration = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : (movie.duration || "N/A");
        let mYear = movie.year || (movie.release_date || "").substring(0, 4) || "N/A";
        let mRating = movie.rating !== undefined ? movie.rating : (movie.vote_average || "N/A");
        let mGenre = movie.genres || movie.genre || "N/A";
        
        document.getElementById('d-meta').innerHTML = `
            <span class="imdb">IMDb</span> ${mRating} 
            <span class="dot">•</span> ${mYear} 
            <span class="dot">•</span> ${mDuration} 
            <span class="dot">•</span> ${mGenre}
        `;
        
        document.getElementById('d-desc').textContent = movie.overview || movie.description || "No description available.";
        
        document.getElementById('edit-btn').href = `edit.html?id=${id}`;
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('details-wrapper').style.display = 'flex';
        
    } catch(e) {
        window.showToast("Failed to load details. " + e.message, "error");
        setTimeout(() => window.location.href = "index.html", 2000);
    }
    
    // Modal Logic
    const deleteModal = document.getElementById('delete-modal');
    
    document.getElementById('delete-btn').addEventListener('click', () => {
        deleteModal.classList.add('show');
    });
    
    document.getElementById('cancel-delete').addEventListener('click', () => {
        deleteModal.classList.remove('show');
    });
    
    document.getElementById('confirm-delete').addEventListener('click', async () => {
        deleteModal.classList.remove('show');
        try {
            const delRes = await fetch(`/movies/${id}`, { method: 'DELETE' });
            if (delRes.ok) {
                window.showToast("Movie deleted successfully", "success");
                setTimeout(() => window.location.href = "index.html", 1200);
            } else {
                window.showToast("Failed to delete movie", "error");
            }
        } catch(err) {
            window.showToast("Error deleting movie", "error");
        }
    });
});
