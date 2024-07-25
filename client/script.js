document.getElementById('searchBtn').addEventListener('click', async () => {
    const partNumber = document.getElementById('partNumber').value;
    const volume = document.getElementById('volume').value;

    if (!partNumber || !volume) {
        alert('Please enter both Part Number and Volume.');
        return;
    }

    const response = await fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ partNumber, volume })
    });

    const results = await response.json();
    displayResults(results);
});

const displayResults = (results) => {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        return;
    }

    results.forEach(result => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p>
                Manufacturer Part Number: ${result.manufacturerPartNumber}<br>
                Manufacturer: ${result.manufacturer}<br>
                Data Provider: ${result.dataProvider}<br>
                Volume: ${result.volume}<br>
                Unit Price: ${result.unitPrice.toFixed(2)} INR<br>
                Total Price: ${result.totalPrice.toFixed(2)} INR
            </p>
            <button onclick="addToCart(${JSON.stringify(result)})">ADD TO CART</button>
        `;
        resultsDiv.appendChild(div);
    });
};

const cartItems = [];

const addToCart = (item) => {
    cartItems.push(item);
    console.log('Added to cart:', item);
    displayCart();
};

const displayCart = () => {
    const cartDiv = document.getElementById('cart');
    cartDiv.innerHTML = '<h2>My Cart</h2>';
    cartItems.forEach(item => {
        cartDiv.innerHTML += `
            <p>${item.manufacturerPartNumber} - ${item.dataProvider} - Volume: ${item.volume} - Unit Price: ${item.unitPrice.toFixed(2)} INR - Total Price: ${item.totalPrice.toFixed(2)} INR</p>
        `;
    });
    cartDiv.style.display = 'block';
};