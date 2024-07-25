// const axios = require('axios');
// const { convertCurrency } = require('../utils/apiClient');

// const searchParts = async (req, res) => {
//     const { partNumber, volume } = req.body;
//     const results = [];

//     // Define API endpoints and their configurations
//     const apis = [
//         {
//             name: 'MOUSER',
//             url: 'https://api.mouser.com/api/v1/search/partnumber?apiKey=82675baf-9a58-4d5a-af3f-e3bbcf486560', // Replace with actual endpoint
//             method: 'post',
//             data: {
//                 SearchByPartRequest: {
//                     mouserPartNumber: partNumber,
//                     partSearchOptions: "string"
//                 }
//             },
//             currency: 'USD'
//         },
//         {
//             name: 'RUTRONIK',
//             url: 'https://www.rutronik24.com/api/search/?apikey=cc6qyfg2yfis&searchterm=CC0402KRX7R7BB104', // Replace with actual endpoint
//             method: 'get',
//             params: { sku: partNumber },
//             currency: 'EUR'
//         },
//         {
//             name: 'ELEMENT14',
//             url: 'http://api.element14.com//catalog/products?term=manuPartNum:CC0402KRX7R7BB104&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=1&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callinfo.apiKey=wb9wt295qf3g6m842896hh2u', // Replace with actual endpoint
//             method: 'post',
//             data: { manufacturerPartNumberSearchReturn: { numberOfResults: 4, products: [{ sku: partNumber }] } },
//             currency: 'USD'
//         }
//     ];

//     for (const api of apis) {
//         try {
//             let response;
//             if (api.method === 'post') {
//                 response = await axios.post(api.url, api.data);
//             } else {
//                 response = await axios.get(api.url, { params: api.params });
//             }

//             // Process the response based on the API
//             let price, manufacturer, productData;

//             if (api.name === 'MOUSER') {
//                 productData = response.data.SearchByPartResponse?.parts?.[0]; // Adjust based on actual response structure
//                 price = productData?.pricing?.[0]?.price; // Adjust based on actual response structure
//                 manufacturer = productData?.manufacturer; // Adjust based on actual response structure
//             } else if (api.name === 'RUTRONIK') {
//                 productData = response.data[0];
//                 price = productData.price;
//                 manufacturer = productData.manufacturer;
//             } else if (api.name === 'ELEMENT14') {
//                 productData = response.data.manufacturerPartNumberSearchReturn?.products?.[0];
//                 price = productData?.prices?.[0]?.cost; // Get the price for the lowest quantity
//                 manufacturer = productData?.vendorName;
//             }

//             if (price && manufacturer) {
//                 const convertedPrice = convertCurrency(price, api.currency);
//                 const totalPrice = convertedPrice * volume;

//                 results.push({
//                     manufacturerPartNumber: partNumber,
//                     manufacturer,
//                     dataProvider: api.name,
//                     volume,
//                     unitPrice: convertedPrice,
//                     totalPrice,
//                 });
//             }
//         } catch (error) {
//             console.error(`Error fetching data from ${api.name}:`, error.message);
//         }
//     }

//     results.sort((a, b) => a.totalPrice - b.totalPrice);
//     res.json(results);
// };

// module.exports = { searchParts };

const axios = require('axios');
const { convertCurrency } = require('../utils/apiClient');

const searchParts = async (req, res) => {
    const { partNumber, volume } = req.body;
    const results = [];

    // Define API endpoints and their configurations
    const apis = [
        {
            name: 'MOUSER',
            url: 'https://api.mouser.com/api/v1/search/partnumber?apiKey=82675baf-9a58-4d5a-af3f-e3bbcf486560', // Ensure this is the correct endpoint
            method: 'post',
            headers: {
                'Authorization': 'Bearer YOUR_MOUSER_API_KEY', // Replace with your actual API key
                'Content-Type': 'application/json'
            },
            data: {
                SearchByPartRequest: {
                    mouserPartNumber: partNumber,
                    partSearchOptions: "string"
                }
            },
            currency: 'USD'
        },
        {
            name: 'RUTRONIK',
            url: 'https://www.rutronik24.com/api/search/?apikey=cc6qyfg2yfis&searchterm=CC0402KRX7R7BB104', // Ensure this is the correct endpoint
            method: 'get',
            params: { sku: partNumber },
            currency: 'EUR'
        },
        {
            name: 'ELEMENT14',
            url: 'http://api.element14.com//catalog/products?term=manuPartNum:CC0402KRX7R7BB104&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=1&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callinfo.apiKey=wb9wt295qf3g6m842896hh2u', // Ensure this is the correct endpoint
            method: 'post',
            headers: {
                'Authorization': 'Bearer YOUR_ELEMENT14_API_KEY', // Replace with your actual API key
                'Content-Type': 'application/json'
            },
            data: {
                manufacturerPartNumberSearchReturn: {
                    numberOfResults: 4,
                    products: [{ sku: partNumber }]
                }
            },
            currency: 'USD'
        }
    ];

    for (const api of apis) {
        try {
            let response;
            if (api.method === 'post') {
                response = await axios.post(api.url, api.data, { headers: api.headers });
            } else {
                response = await axios.get(api.url, { params: api.params });
            }

            // Process the response based on the API
            let price, manufacturer, productData;

            if (api.name === 'MOUSER') {
                productData = response.data.SearchByPartResponse?.parts?.[0];
                price = productData?.pricing?.[0]?.price;
                manufacturer = productData?.manufacturer;
            } else if (api.name === 'RUTRONIK') {
                productData = response.data[0];
                price = productData.price;
                manufacturer = productData.manufacturer;
            } else if (api.name === 'ELEMENT14') {
                productData = response.data.manufacturerPartNumberSearchReturn?.products?.[0];
                price = productData?.prices?.[0]?.cost;
                manufacturer = productData?.vendorName;
            }

            if (price && manufacturer) {
                const convertedPrice = convertCurrency(price, api.currency);
                const totalPrice = convertedPrice * volume;

                results.push({
                    manufacturerPartNumber: partNumber,
                    manufacturer,
                    dataProvider: api.name, // Make sure this is included
                    volume, // Make sure this is included
                    unitPrice: convertedPrice,
                    totalPrice,
                });
            }
        } catch (error) {
            console.error(`Error fetching data from ${api.name}:`, error.response ? error.response.data : error.message);
        }
    }

    results.sort((a, b) => a.totalPrice - b.totalPrice);
    res.json(results);
};

module.exports = { searchParts };