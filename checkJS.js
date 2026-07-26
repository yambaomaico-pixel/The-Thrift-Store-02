fetch('https://yambaomaico-pixel.github.io/The-Thrift-Store-02/')
  .then(r => r.text())
  .then(html => {
    const jsMatch = html.match(/src="(\/The-Thrift-Store-02\/assets\/index-[^\.]+\.js)"/);
    if (!jsMatch) throw new Error("No JS file found");
    const jsUrl = 'https://yambaomaico-pixel.github.io' + jsMatch[1];
    return fetch(jsUrl).then(r => r.text());
  })
  .then(js => {
    console.log("Includes 'Added to cart!':", js.includes('Added to cart!'));
    console.log("Includes 'Please log in to add items to cart.':", js.includes('Please log in to add items to cart.'));
  })
  .catch(e => console.error(e));
