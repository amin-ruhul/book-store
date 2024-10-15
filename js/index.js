const API_URL = "https://gutendex.com/books";
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || {};

function saveWishlist() {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function toggleWishlist(book) {
  const bookId = book.id;

  if (wishlist[bookId]) {
    delete wishlist[bookId];
  } else {
    wishlist[bookId] = book;
  }
  saveWishlist();
}

function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.innerHTML = `
    <img src="${book.formats["image/jpeg"]}" alt="${book.title}">
    <div class="book-info">
      <h3 class="line-clamp-1">${book.title}</h3>
      <p>Author: ${book.authors.map((author) => author.name).join(", ")}</p>
      <p class="line-clamp-2">Genre: ${book.bookshelves.join(", ") || "N/A"}</p>
      <p>ID: ${book.id}</p>
    </div>
    <button class="wishlist-btn" data-id="${book.id}">
      ${wishlist[book.id] ? "❤️" : "🤍"}
    </button>
  `;

  card.querySelector(".wishlist-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleWishlist(book);

    e.target.textContent = wishlist[book.id] ? "❤️" : "🤍";
  });

  card.addEventListener("click", () => {
    window.location.href = `book-details.html?id=${book.id}`;
  });

  return card;
}
