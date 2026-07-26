fetch('https://yambaomaico-pixel.github.io/The-Thrift-Store-02/')
  .then(r => r.text())
  .then(html => {
    const jsMatch = html.match(/src="(\/The-Thrift-Store-02\/assets\/index-[^\.]+\.js)"/);
    if (!jsMatch) throw new Error("No JS file found");
    const jsUrl = 'https://yambaomaico-pixel.github.io' + jsMatch[1];
    return fetch(jsUrl).then(r => r.text());
  })
  .then(js => {
    console.log("Includes 'getCountFromServer':", js.includes('getCountFromServer'));
    console.log("Includes 'Total Customers':", js.includes('Total Customers'));
    console.log("Includes '12,450':", js.includes('12,450'));
  })
  .catch(e => console.error(e));
