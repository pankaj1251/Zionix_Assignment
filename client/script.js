let cartItems = [];

// Prevent default form submission
document
  .getElementById("searchForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent the form from submitting

    const partNumber = document.getElementById("partNumber").value;
    const volume = document.getElementById("volume").value;

    if (!partNumber || !volume) {
      alert("Please enter both Part Number and Volume.");
      return;
    }

    const response = await fetch("http://localhost:3000/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ partNumber, volume }),
    });

    const results = await response.json();
    displayResults(results);
  });

const displayResults = (results) => {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  // Find the item with the least total price
  const leastExpensiveItem = results.reduce((prev, current) =>
    prev.totalPrice < current.totalPrice ? prev : current
  );

  results.forEach((result) => {
    const div = document.createElement("div");
    div.innerHTML = `
            <p>
                Manufacturer Part Number: ${result.manufacturerPartNumber}<br>
                Manufacturer: ${result.manufacturer}<br>
                Data Provider: ${result.dataProvider}<br>
                Volume: ${result.volume}<br>
                Unit Price: ${result.unitPrice.toFixed(2)} INR<br>
                Total Price: ${result.totalPrice.toFixed(2)} INR
            </p>
        `;
    const addToCartBtn = document.createElement("button");
    addToCartBtn.textContent = "ADD TO CART";
    addToCartBtn.addEventListener("click", () => addToCart(leastExpensiveItem));
    div.appendChild(addToCartBtn);
    resultsDiv.appendChild(div);
  });
};

const addToCart = (item) => {
  console.log("Adding to cart:", item); // Debugging statement
  cartItems.push(item);
  displayCart();
  showNotification(
    `${item.manufacturerPartNumber} has been added to your cart!`
  );
};

const displayCart = () => {
  const cartDiv = document.getElementById("cart");
  const cartItemsDiv = document.getElementById("cartItems");
  cartItemsDiv.innerHTML = ""; // Clear existing items

  if (cartItems.length === 0) {
    cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>"; // Message if cart is empty
  } else {
    cartItems.forEach((item) => {
      const div = document.createElement("div");
      div.innerHTML = `
                <p>
                    Manufacturer Part Number: ${item.manufacturerPartNumber}<br>
                    Manufacturer: ${item.manufacturer}<br>
                    Data Provider: ${item.dataProvider}<br>
                    Volume: <input type="number" value="${
                      item.volume
                    }" id="volumeInput_${item.manufacturerPartNumber}"><br>
                    Unit Price: ${item.unitPrice.toFixed(2)} INR<br>
                    Total Price: <span id="totalPrice_${
                      item.manufacturerPartNumber
                    }">${item.totalPrice.toFixed(2)} INR</span>
                </p>
                <button onclick="updateCartItem('${
                  item.manufacturerPartNumber
                }')">Update</button>
                <button onclick="deleteCartItem('${
                  item.manufacturerPartNumber
                }')">Delete</button>
            `;
      cartItemsDiv.appendChild(div);
    });
  }

  cartDiv.style.display = "block"; // Show the cart
};

const updateCartItem = (partNumber) => {
  const item = cartItems.find((i) => i.manufacturerPartNumber === partNumber);
  const newVolume = document.getElementById(`volumeInput_${partNumber}`).value;

  if (item && newVolume) {
    item.volume = newVolume;
    item.totalPrice = item.unitPrice * newVolume; // Update total price
    document.getElementById(`totalPrice_${partNumber}`).innerText =
      item.totalPrice.toFixed(2) + " INR"; // Update displayed total price
    showNotification(
      `Updated volume for ${item.manufacturerPartNumber} to ${newVolume}.`
    );
  }
};

const deleteCartItem = (partNumber) => {
  cartItems = cartItems.filter(
    (item) => item.manufacturerPartNumber !== partNumber
  ); // Remove item from cart
  displayCart();
  showNotification(`Removed ${partNumber} from your cart.`);
};

// Show notification message
const showNotification = (message) => {
  const notificationDiv = document.getElementById("notification");
  notificationDiv.innerText = message;
  notificationDiv.style.display = "block";

  // Hide the notification after 3 seconds
  setTimeout(() => {
    notificationDiv.style.display = "none";
  }, 3000);
};

// Toggle cart visibility
document.getElementById("toggleCartBtn").addEventListener("click", () => {
  const cartDiv = document.getElementById("cart");
  cartDiv.style.display = cartDiv.style.display === "block" ? "none" : "block";
});

// Close cart button
document.getElementById("closeCartBtn").addEventListener("click", () => {
  document.getElementById("cart").style.display = "none";
});
