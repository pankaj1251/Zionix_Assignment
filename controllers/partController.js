const axios = require("axios");
const { convertCurrency } = require("../utils/apiClient");

const searchParts = async (req, res) => {
  const { partNumber, volume } = req.body;
  const results = [];

  const apis = [
    {
      name: "MOUSER",
      url: "https://api.mouser.com/api/v1/search/partnumber?apiKey=82675baf-9a58-4d5a-af3f-e3bbcf486560",
      method: "post",
      data: {
        SearchByPartRequest: {
          mouserPartNumber: partNumber,
          partSearchOptions: "string",
        },
      },
      currency: "USD",
    },
    {
      name: "RUTRONIK",
      url: `https://www.rutronik24.com/api/search/?apikey=cc6qyfg2yfis&searchterm=${partNumber}`,
      method: "get",
      currency: "EUR",
    },
    {
      name: "ELEMENT14",
      url: `http://api.element14.com/catalog/products?term=manuPartNum:${partNumber}&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=1&resultsSettings.refinements.filters=inStock&resultsSettings.responseGroup=medium&callInfo.omitXmlSchema=false&callInfo.callback=&callInfo.responseDataFormat=json&callinfo.apiKey=wb9wt295qf3g6m842896hh2u`,
      method: "get",
      currency: "USD",
    },
  ];

  for (const api of apis) {
    try {
      let response;
      if (api.method === "post") {
        response = await axios.post(api.url, api.data);
      } else {
        response = await axios.get(api.url);
      }

      let productData;

      if (api.name === "MOUSER") {
        const parts = response.data.SearchByPartResponse?.parts || [];
        parts.forEach((part) => {
          const price = part?.pricing?.[0]?.price;
          const manufacturer = part?.manufacturer;
          if (price && manufacturer) {
            const convertedPrice = convertCurrency(price, api.currency);
            const totalPrice = convertedPrice * volume;
            results.push({
              manufacturerPartNumber: partNumber,
              manufacturer,
              dataProvider: api.name,
              volume,
              unitPrice: convertedPrice,
              totalPrice,
            });
          }
        });
      } else if (api.name === "RUTRONIK") {
        const products = response.data || [];
        products.forEach((product) => {
          const price = product.price;
          const manufacturer = product.manufacturer;
          if (price && manufacturer) {
            const convertedPrice = convertCurrency(price, api.currency);
            const totalPrice = convertedPrice * volume;
            results.push({
              manufacturerPartNumber: partNumber,
              manufacturer,
              dataProvider: api.name,
              volume,
              unitPrice: convertedPrice,
              totalPrice,
            });
          }
        });
      } else if (api.name === "ELEMENT14") {
        const products = response.data.products || [];
        if (Array.isArray(products)) {
          products.forEach((product) => {
            const price = product?.prices?.[0]?.cost;
            const manufacturer = product?.vendorName;
            if (price && manufacturer) {
              const convertedPrice = convertCurrency(price, api.currency);
              const totalPrice = convertedPrice * volume;
              results.push({
                manufacturerPartNumber: partNumber,
                manufacturer,
                dataProvider: api.name,
                volume,
                unitPrice: convertedPrice,
                totalPrice,
              });
            }
          });
        } else {
          console.error(
            "Unexpected response structure from ELEMENT14:",
            response.data
          );
        }
      }
    } catch (error) {
      console.error(
        `Error fetching data from ${api.name}:`,
        error.response ? error.response.data : error.message
      );
    }
  }

  results.sort((a, b) => a.totalPrice - b.totalPrice);
  res.json(results);
};

module.exports = { searchParts };
