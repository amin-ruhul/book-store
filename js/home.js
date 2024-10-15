const booksListEl = document.getElementById("books-list");
const searchEl = document.getElementById("search");
const genreFilterEl = document.getElementById("genre-filter");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageNumbersEl = document.getElementById("page-numbers");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const paginationSlot = document.getElementById("pagination-slot");

const createBookState = () => {
  return {
    currentPage: 1,
    totalPages: 1,
  };
};

const bookState = createBookState();
const cache = {};

async function fetchBooks(page = 1, search = "", genre = "") {
  try {
    loadingEl.style.display = "grid";
    errorEl.style.display = "none";
    booksListEl.innerHTML = "";

    const url = `${API_URL}?page=${page}&search=${search}&topic=${genre}`;

    const cachedData = cache[url];
    if (cachedData) {
      bookState.totalPages = Math.ceil(cachedData.count / 32);
      return cachedData;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }
    const data = await response.json();
    bookState.totalPages = Math.ceil(data.count / 32);

    cache[url] = data;

    // Cache the response
    //setCachedData(url, data);

    return data;
  } catch (error) {
    console.error("Error fetching books:", error);
    errorEl.textContent = "Failed to load books. Please try again later.";
    errorEl.style.display = "block";
    throw error;
  } finally {
    loadingEl.style.display = "none";
  }
}

function renderBooks(books) {
  booksListEl.innerHTML = "";
  books.forEach((book) => {
    booksListEl.appendChild(createBookCard(book));
  });
}

function updatePagination() {
  paginationSlot.style.display = "block";
  prevPageBtn.disabled = bookState.currentPage === 1;
  nextPageBtn.disabled = bookState.currentPage === bookState.totalPages;
}

async function updateBooks(page, search, genre) {
  try {
    const data = await fetchBooks(page, search, genre);
    renderBooks(data.results);
    updatePagination();
  } catch (error) {}
}

function updateURL(page, search, genre) {
  const url = new URL(window.location);
  url.searchParams.set("page", page);
  if (search) url.searchParams.set("search", search);
  else url.searchParams.delete("search");
  if (genre) url.searchParams.set("genre", genre);
  else url.searchParams.delete("genre");
  window.history.pushState({}, "", url);
  handleURLChange();
}

function getRouterState() {
  const url = new URL(window.location);
  const page = parseInt(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("search") || "";
  const genre = url.searchParams.get("genre") || "";

  return { page, search, genre };
}

function handleURLChange() {
  const { page, search, genre } = getRouterState();
  bookState.currentPage = page;
  updateBooks(page, search, genre);
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

searchEl.addEventListener(
  "input",
  debounce(() => {
    updateURL(1, searchEl.value, genreFilterEl.value);
  }, 300)
);

genreFilterEl.addEventListener("change", () => {
  updateURL(1, searchEl.value, genreFilterEl.value);
});

prevPageBtn.addEventListener("click", () => {
  if (bookState.currentPage > 1) {
    updateURL(bookState.currentPage - 1, searchEl.value, genreFilterEl.value);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (bookState.currentPage < bookState.totalPages) {
    updateURL(bookState.currentPage + 1, searchEl.value, genreFilterEl.value);
  }
});

async function initializeDom(page, search, genre) {
  setSearchAndFilterInitialValue(search, genre);
  const data = await fetchBooks(page, search, genre);

  if (!data) return;

  const genres = [
    ...new Set(data.results.flatMap((book) => book.bookshelves)),
  ].sort();
  genreFilterEl.innerHTML =
    '<option value="">All Genres</option>' +
    genres
      .map((genre) => `<option value="${genre}">${genre}</option>`)
      .join("");

  genreFilterEl.value = genre;
  searchEl.value = search;
  renderBooks(data.results);
}

function setSearchAndFilterInitialValue(search, genre) {
  genreFilterEl.innerHTML =
    `<option value="">All Genres</option>` +
    `<option value="${genre}">${genre}</option>`;

  genreFilterEl.value = genre;
  searchEl.value = search;
}

async function onCreated() {
  const { page, search, genre } = getRouterState();
  initializeDom(page, search, genre);
}

async function init() {
  onCreated();
}

init();
