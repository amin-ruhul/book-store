const wishlistBooksEl = document.getElementById("wishlist-books");

function renderWishlist(books) {
  wishlistBooksEl.innerHTML = "";
  books.forEach((book) => {
    wishlistBooksEl.appendChild(createBookCard(book));
  });
}

function loadWishListPage() {
  const books = Object.values(wishlist);
  renderWishlist(books);
}

loadWishListPage();
