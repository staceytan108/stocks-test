import $ from "jquery";
import "babel-polyfill";

const fetchPrices = async symbols => {
  // ['AAPL', 'TSLA']
  // ['aapl', 'tsla']
  // 'aapl,tsla'
  const symbolsLowerCase = symbols.map(t => t.toLocaleLowerCase()).join(",");

  const resp = await fetch(
    `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbolsLowerCase}&types=price`
  );

  const data = await resp.json();

  return data;
};

let portfolio = [
  { symbol: "AAPL", purchasePrice: 192.0, qty: 100 },
  { symbol: "FB", purchasePrice: 163.0, qty: 25 }
];

let addToPortfolio = (symbol, price, qty) => {
  portfolio.push({
    symbol: symbol,
    purchasePrice: price,
    qty: qty
  });
};

let removeFromPortfolio = symbol => {
  // Keep only those stocks not matching the symbol
  portfolio = portfolio.filter(stock => stock.symbol !== symbol);
};

let prices = {};

const refreshPrices = async () => {
  // ['AAPL', 'FB']
  let symbols = portfolio.map(t => t.symbol);
  prices = await fetchPrices(symbols);
};

const toCardHtml = item => {
  let priceStr = "--";
  let plStr = "--";

  let symbol = item.symbol;
  let qty = item.qty;
  let purchasePrice = item.purchasePrice;

  if (prices[symbol]) {
    let price = prices[symbol].price;
    let pl = (price - purchasePrice) * qty;

    priceStr = price.toString();

    plStr = pl.toFixed(2).toString();
  }

  return `
	<article class="col-6" id="${symbol}">
	  <div class="card border-dark mb-3">
	    <div class="card-body text-dark">
	      <h2 class="card-title">${symbol}</h2>
	      <p class="card-text">
          <p>
            Price: <span>$${priceStr}</span> |
            P/L: <span>$${plStr}</span>
          </p>
          <p class="removeButton text-info">
            Remove
          </p>
	      </p>
	    </div>
	  </div>
	</article>
	`;
};

const displayPortfolio = () => {
  const portfolioSection = $("#portfolio");

  const cards = portfolio.map(toCardHtml).join("");

  portfolioSection.html(cards);
};

const addBtnClicked = async () => {
  const symbol = $("#symbol").val();
  const purchasePrice = $("#purchasePrice").val();
  const qty = $("#qty").val();

  addToPortfolio(symbol, parseFloat(purchasePrice), parseInt(qty));

  await refreshPrices();

  displayPortfolio();
};

const removeBtnClicked = event => {
  const card = $(event.target)
    .parent()
    .parent()
    .parent();

  const symbol = card.attr("id");

  removeFromPortfolio(symbol);

  displayPortfolio();
};

const init = async () => {
  await refreshPrices();
  displayPortfolio();
};

init();

$("body").on("click", "#addButton", addBtnClicked);
$("body").on("click", ".removeButton", removeBtnClicked);
