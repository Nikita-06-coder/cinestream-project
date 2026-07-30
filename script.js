// Apni TMDB API Key yahan dalein (jo aapne website par account banakar li hai)
const API_KEY = 'YOUR_TMDB_API_KEY';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.picy.org/t/p/w500'; // ya image.tmdb.org
// Sahi image base URL: https://image.tmdb.org/t/p/w500
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// 1. Trending Movies fetch karne ka function
async function fetchTrendingMovies() {
    try {
        const response = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`);
        const data = await response.json();
        
        // Jo movies aayi hain, unhe display function mein bhej do
        displayMovies(data.results);
    } catch (error) {
        console.error("Movies laane mein error aaya:", error);
    }
}

// 2. Movies ko HTML card mein badalkar screen par dikhane ka function
function displayMovies(movies) {
    const moviesRow = document.querySelector('.movies-row');
    moviesRow.innerHTML = ""; // Pehle ka static data clear kar do

    movies.forEach(movie => {
        // Har movie ke liye ek HTML card banega
        const movieCard = `
            <div class="movie-card flex-shrink-0 w-36 md:w-48 cursor-pointer group" onclick="openMovieModal(${movie.id})">
                <div class="overflow-hidden rounded-lg shadow-md aspect-[2/3] bg-gray-800">
                    <img src="${TMDB_IMAGE_URL + movie.poster_path}" alt="${movie.title || movie.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                </div>
                <p class="text-sm font-medium mt-2 truncate text-gray-200 group-hover:text-cyan-400 transition">${movie.title || movie.name}</p>
            </div>
        `;
        // Row ke andar card jod do
        moviesRow.innerHTML += movieCard;
    });
}

// Jab page load ho toh function run ho jaye
window.onload = () => {
    fetchTrendingMovies();
};
const searchInput = document.getElementById('search-input');

// Jab bhi user keyboard se kuch type karega
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.trim();

    if (searchTerm) {
        searchMovies(searchTerm);
    } else {
        fetchTrendingMovies(); // Agar search box khali hai toh wapas trending dikhao
    }
});

// Search API ko call karne ka function
async function searchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        displayMovies(data.results); // Search results ko screen par dikhao
    } catch (error) {
        console.error("Search karne mein error aaya:", error);
    }
}
// Movie par click hone par modal khulega
async function openMovieModal(movieId) {
    const modal = document.getElementById('movie-modal');
    const modalContent = document.getElementById('modal-content');
    modal.classList.remove('hidden'); // Modal ko visible karo

    try {
        // Movie ki detail aur videos (trailer) mangwane ke liye API call
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos`);
        const movie = await response.json();

        // YouTube trailer dhoondo video list mein se
        let youtubeKey = "";
        if (movie.videos && movie.videos.results) {
            const trailer = movie.videos.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
            if (trailer) youtubeKey = trailer.key;
        }

        modalContent.innerHTML = `
            <h2 class="text-2xl font-bold text-cyan-400">${movie.title}</h2>
            <p class="text-gray-300 text-sm">${movie.overview}</p>
            ${youtubeKey ? `
                <div class="aspect-video w-full mt-4">
                    <iframe class="w-full h-full rounded-lg" src="https://www.youtube.com/embed/${youtubeKey}" frameborder="0" allowfullscreen></iframe>
                </div>
            ` : `<p class="text-gray-500 mt-4">Trailer available nahi hai.</p>`}
        `;
    } catch (error) {
        console.error("Modal data load karne mein error:", error);
    }
}

// Modal ko band karne ka function
function closeModal() {
    const modal = document.getElementById('movie-modal');
    modal.classList.add('hidden');
    document.getElementById('modal-content').innerHTML = ""; // Video rokne ke liye content clear karo
}
// Movie ko Watchlist mein save karne ka function
function addToWatchlist(movieObj) {
    // Pehle se saved movies nikalo, agar kuch nahi hai toh khali array lo
    let watchlist = JSON.parse(localStorage.getItem('myWatchlist')) || [];

    // Check karo ki movie pehle se toh added nahi hai
    const isAlreadyExists = watchlist.some(movie => movie.id === movieObj.id);

    if (!isAlreadyExists) {
        watchlist.push(movieObj);
        localStorage.setItem('myWatchlist', JSON.stringify(watchlist));
        alert("Movie Watchlist mein add ho gayi!");
    } else {
        alert("Yeh movie pehle se aapki watchlist mein hai!");
    }
}