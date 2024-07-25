const convertCurrency = (amount, currency) => {
    const rates = {
        USD: 1,
        EUR: 90 / 84, // 1 EUR = 90 INR, 1 USD = 84 INR
    };
    return amount * rates[currency];
};

module.exports = { convertCurrency };