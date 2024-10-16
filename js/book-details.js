const bookDetailsEl = document.getElementById("book-details");
const backToListBtn = document.getElementById("back-to-list");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");

const pageDetailsCache = {};

async function fetchBookDetails(id) {
  try {
    const url = `${API_URL}/${id}`;

    if (pageDetailsCache[url]) {
      return pageDetailsCache[url];
    }

    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch book details");
    }
    const data = await response.json();

    pageDetailsCache[url] = data;

    return data;
  } catch (error) {
    throw new Error("Network error");
  }
}

function renderBookDetails(book) {
  const {
    title,
    formats,
    authors,
    bookshelves,
    id,
    download_count,
    languages,
    copyright,
  } = book;
  const authorNames = authors.map((author) => author.name).join(", ");
  const genre = bookshelves.join(", ") || "N/A";
  const languageList = languages.join(", ");
  const isWishlist = wishlist[id] ? "❤️" : "🤍";

  bookDetailsEl.style.display = "block";
  bookDetailsEl.innerHTML = `
    <h2>${title}</h2>
    <img src="${formats["image/jpeg"]}" alt="${title}">
    <p><strong>Author:</strong> ${authorNames}</p>
    <p><strong>Genre:</strong> ${genre}</p>
    <p><strong>ID:</strong> ${id}</p>
    <p><strong>Download count:</strong> ${download_count}</p>
    <p><strong>Languages:</strong> ${languageList}</p>
    <p><strong>Copyright:</strong> ${copyright ? "Yes" : "No"}</p>
    <h3>Available formats:</h3>
    <ul>
      ${Object.entries(formats)
        .map(
          ([format, url]) =>
            `<li><a href="${url}" target="_blank">${format}</a></li>`
        )
        .join("")}
    </ul>
    <button class="wishlist-btn" data-id="${id}">${isWishlist}</button>
  `;

  document.querySelector(".wishlist-btn").addEventListener("click", (e) => {
    toggleWishlist(book);
    e.target.textContent = wishlist[id] ? "❤️" : "🤍";
  });
}

function showLoading() {
  loadingEl.style.display = "flex";
}

function hideLoading() {
  loadingEl.style.display = "none";
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

async function loadDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  if (!bookId) return showError("No book selected.");

  showLoading();
  try {
    const book = await fetchBookDetails(bookId);
    renderBookDetails(book);
  } catch (error) {
    console.error("Error fetching book details:", error);
    showError("Error loading book details. Please try again later.");
  } finally {
    hideLoading();
  }
}

backToListBtn.addEventListener("click", () => {
  window.history.back();
});

loadDetailsPage();
