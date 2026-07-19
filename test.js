fetch('https://yambaomaico-pixel.github.io/The-Thrift-Store-02/')
  .then(r => r.text())
  .then(html => {
    const jsMatch = html.match(/src="(\/The-Thrift-Store-02\/assets\/index-[^\.]+\.js)"/);
    if (!jsMatch) {
      console.log("Could not find JS bundle");
      return;
    }
    const jsUrl = 'https://yambaomaico-pixel.github.io' + jsMatch[1];
    console.log("Fetching", jsUrl);
    return fetch(jsUrl).then(r => r.text());
  })
  .then(js => {
    if (js) {
      console.log("Includes css grid fix?", js.includes('gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))"'));
    }
  });
