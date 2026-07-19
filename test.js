fetch('https://yambaomaico-pixel.github.io/The-Thrift-Store-02/')
  .then(r => r.text())
  .then(html => {
    const jsMatch = html.match(/src="(\/The-Thrift-Store-02\/assets\/index-[^\.]+\.js)"/);
    const jsUrl = 'https://yambaomaico-pixel.github.io' + jsMatch[1];
    return fetch(jsUrl).then(r => r.text());
  })
  .then(js => {
    console.log("Includes display:block for Link?", js.includes('display:"block"'));
    console.log("Includes position:relative for Link?", js.includes('position:"relative"'));
  });
