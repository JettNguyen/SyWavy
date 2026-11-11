/* ============================================================
   render.js: the markup for each part of the site, built from
   data.js. main.js and release.js use it in the browser, and
   build.js runs it ahead of time so every page already has its
   text before any script runs. Search engines read that text,
   and most AI crawlers never run the scripts at all.
   ============================================================ */

window._SWR = (function () {
  'use strict';

  /* ----------------------------------------------------------
     SVG ICONS
  ---------------------------------------------------------- */
  const ICONS = {
    Spotify: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#1ED760" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
    // Apple Music's 2026 icon: a white square with the note cut out, traced from Apple's own icon
    'Apple Music': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#FFFFFF" fill-rule="evenodd" d="M5.7 0h12.6A5.7 5.7 0 0124 5.7v12.6a5.7 5.7 0 01-5.7 5.7H5.7A5.7 5.7 0 010 18.3V5.7A5.7 5.7 0 015.7 0ZM17.14 3.15 17.30 3.16 17.47 3.27 17.60 3.45 17.63 3.66 17.62 14.43 17.62 14.84 17.57 15.28 17.47 15.77 17.33 16.13 17.04 16.62 16.78 16.92 16.51 17.18 16.14 17.46 15.87 17.61 15.56 17.76 15.15 17.89 14.70 18.00 14.22 18.03 13.85 18.00 13.50 17.90 13.20 17.74 13.02 17.61 12.86 17.44 12.71 17.23 12.58 16.92 12.50 16.51 12.50 16.17 12.56 15.79 12.72 15.32 13.01 14.84 13.14 14.67 13.44 14.39 13.85 14.09 14.36 13.82 14.67 13.70 15.21 13.53 16.31 13.35 16.46 13.23 16.51 13.16 16.52 13.03 16.52 8.17 16.49 8.07 16.38 7.94 16.27 7.92 16.10 7.95 15.28 8.22 14.77 8.42 14.12 8.63 13.95 8.71 12.99 9.02 11.59 9.52 10.91 9.74 10.74 9.82 10.12 10.02 9.87 10.12 9.72 10.26 9.67 10.36 9.64 10.53 9.64 17.30 9.57 18.12 9.51 18.46 9.40 18.76 9.25 19.08 9.10 19.32 8.85 19.63 8.72 19.77 8.41 20.05 8.18 20.21 7.66 20.49 7.32 20.62 6.91 20.74 6.56 20.79 6.29 20.80 5.98 20.79 5.68 20.73 5.37 20.60 5.16 20.48 4.97 20.31 4.82 20.14 4.68 19.90 4.63 19.76 4.53 19.38 4.50 19.18 4.51 18.87 4.65 18.29 4.81 17.95 5.07 17.54 5.50 17.12 5.88 16.85 6.15 16.70 6.74 16.44 7.18 16.32 7.56 16.25 7.86 16.22 8.07 16.16 8.34 16.11 8.44 16.03 8.52 15.93 8.54 15.86 8.53 6.70 8.54 6.50 8.62 6.27 8.85 6.02 9.13 5.89 9.78 5.68 9.95 5.61 10.56 5.41 11.08 5.21 11.76 4.99 12.31 4.79 12.92 4.59 13.13 4.50 14.09 4.19 14.26 4.11 16.10 3.49 16.56 3.32 16.99 3.17Z"/></svg>`,
    YouTube: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/><path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12z"/></svg>`,
    'YouTube Music': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#FF0000" d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/></svg>`,
    'Amazon Music': `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#46C3D0" d="M14.8454 9.4083c-1.3907 1.0194-3.405 1.563-5.1424 1.563a9.333 9.333 0 0 1-6.2768-2.3835c-.1313-.117-.0143-.277.1415-.1846a12.693 12.693 0 0 0 6.285 1.6574c1.5384 0 3.2348-.318 4.7917-.9764.2359-.0985.4328.1538.203.324h-.002zm.5784-.6564c-.1784-.2257-1.1753-.1087-1.6225-.0554-.1374.0164-.158-.1026-.0349-.1867.796-.5558 2.0984-.3958 2.2502-.2092.1539.1867-.041 1.4872-.7856 2.1087-.1149.0964-.2236.0451-.1723-.082.1682-.4165.5436-1.3498.3651-1.5754zm-1.5917-4.1702v-.5394c0-.082.0615-.1375.1374-.1375h2.4348c.078 0 .1395.0554.1395.1354v.4636c0 .078-.0656.1805-.1846.3405L15.0997 6.635c.4677-.0102.9641.0595 1.3887.2974.0964.0534.123.1334.1292.2113v.5744c0 .082-.0882.1723-.1784.123a2.8163 2.8163 0 0 0-2.5723.0062c-.0861.0451-.1743-.0451-.1743-.1251v-.5477c0-.0882.002-.238.0902-.3713l1.4626-2.0881h-1.2718c-.078 0-.1415-.0534-.1436-.1354l.002.002zm4.808-.7466c1.0995 0 1.6944.9395 1.6944 2.1333 0 1.1528-.6564 2.0676-1.6943 2.0676-1.079 0-1.6656-.9395-1.6656-2.1087 0-1.1774.5948-2.0922 1.6656-2.0922zm.0062.7713c-.5456 0-.5805.7384-.5805 1.202 0 .4615-.0061 1.4481.5744 1.4481.5743 0 .601-.7958.601-1.282 0-.318-.0144-.6994-.1108-1.001-.082-.2625-.2482-.3671-.4841-.3671zm-6.008 3.3414c-.0493.041-.1395.0451-.1744.0164-.2543-.1949-.4246-.4923-.4246-.4923-.4061.4123-.6954.5374-1.2225.5374-.6215 0-1.1077-.3835-1.1077-1.1486a1.2512 1.2512 0 0 1 .7897-1.2041c.402-.1764.9641-.2072 1.3928-.2564 0 0 .0349-.4615-.0902-.6297a.521.521 0 0 0-.4164-.1908c-.2728 0-.5395.1477-.5928.4328-.0144.082-.0739.1518-.1395.1436L9.945 5.08a.1292.1292 0 0 1-.1108-.1537c.1641-.8657.9498-1.1282 1.6554-1.1282.361 0 .8307.0964 1.1158.3671.359.3344.3262.7795.3262 1.2677v1.1487c0 .3446.1436.4964.279.681.0471.0677.0574.1477-.002.197-.1519.125-.5703.4881-.5703.4881zm-.7467-1.7969v-.16c-.5353 0-1.1015.115-1.1015.7426 0 .318.1662.5333.4513.5333.2051 0 .3938-.1272.5128-.3344.1436-.2564.1374-.4943.1374-.7815zM2.9278 7.948c-.0472.041-.1375.045-.1723.0163-.2544-.1949-.4246-.4923-.4246-.4923-.4082.4123-.6954.5374-1.2226.5374-.6235 0-1.1076-.3835-1.1076-1.1486a1.2512 1.2512 0 0 1 .7897-1.2041c.402-.1764.964-.2072 1.3928-.2564 0 0 .0348-.4615-.0903-.6297a.521.521 0 0 0-.4164-.1908c-.2748 0-.5395.1477-.5928.4328-.0143.082-.0759.1518-.1395.1436L.2345 5.08a.1292.1292 0 0 1-.1087-.1537c.162-.8657.9497-1.1282 1.6553-1.1282.361 0 .8308.0964 1.1159.3671.359.3344.324.7795.324 1.2677v1.1487c0 .3446.1437.4964.279.681.0472.0677.0575.1477-.002.197-.1518.125-.5702.4881-.5702.4881zm-.7446-1.797v-.16c-.5354 0-1.1015.115-1.1015.7426 0 .318.164.5333.4512.5333.2052 0 .3939-.1272.5128-.3344.1436-.2564.1375-.4943.1375-.7815zm2.9127-.3343v2.002a.1379.1379 0 0 1-.1395.1374H4.218a.1374.1374 0 0 1-.1395-.1374v-3.766a.1379.1379 0 0 1 .1395-.1375h.6913a.1374.1374 0 0 1 .1374.1374v.482h.0143c.1805-.4758.519-.6994.9744-.6994.4636 0 .7528.2236.962.6995a1.0523 1.0523 0 0 1 1.0215-.6995c.3118 0 .6502.1272.8574.4143.236.318.1867.7795.1867 1.1857v2.3855c0 .076-.0636.1354-.1436.1354H8.181a.1374.1374 0 0 1-.1334-.1354v-2.004c0-.16.0144-.558-.0205-.7077-.0554-.2564-.2215-.3282-.4369-.3282a.4923.4923 0 0 0-.441.3118c-.076.1908-.0698.5087-.0698.724v2.0041c0 .076-.0635.1354-.1435.1354h-.7385a.1374.1374 0 0 1-.1333-.1354v-2.004c0-.4226.0677-1.042-.4574-1.042-.5334 0-.5128.603-.5128 1.042h.002zm16.8077 2.002a.1374.1374 0 0 1-.1374.1374h-.7405a.1374.1374 0 0 1-.1374-.1374v-3.766a.1374.1374 0 0 1 .1374-.1375h.683c.0821 0 .1396.0636.1396.1067v.5764h.0143c.2051-.517.4964-.7631 1.0092-.7631.3323 0 .6564.119.8636.4451.1928.3036.1928.8123.1928 1.1774V7.837a.1395.1395 0 0 1-.1415.119h-.7426a.1395.1395 0 0 1-.1313-.119V5.552c0-.763-.2933-.7856-.4635-.7856-.197 0-.357.1538-.4246.2953a1.7025 1.7025 0 0 0-.1231.722l.002 2.0349zM.1914 20.0582c-.1271 0-.1907-.0615-.1907-.1907v-4.4491c0-.1272.0636-.1908.1907-.1908H.616c.0616 0 .1129.0144.1477.039.0349.0246.0595.0738.0718.1436l.0575.3035c.6133-.4184 1.2102-.6276 1.7907-.6276.5948 0 .9969.2256 1.2081.6769.6318-.4513 1.2636-.677 1.8954-.677.441 0 .7794.1231 1.0153.3693.236.2502.3549.603.3549 1.0584v3.3538c0 .1271-.0656.1907-.1928.1907h-.5641c-.1272 0-.1928-.0615-.1928-.1907v-3.085c0-.318-.0616-.5539-.1805-.7057-.1231-.1538-.3139-.2297-.5744-.2297-.4677 0-.9353.1436-1.4092.4307a.997.997 0 0 1 .0103.1416v3.448c0 .1272-.0636.1908-.1908.1908H3.297c-.1272 0-.1908-.0615-.1908-.1907v-3.085c0-.318-.0615-.5539-.1825-.7057-.1231-.1538-.3139-.2297-.5744-.2297-.4861 0-.9517.1395-1.399.4205v3.5999c0 .1271-.0615.1907-.1907.1907H.1914zm9.731.1436c-.4533 0-.8-.1272-1.044-.3815-.242-.2544-.3631-.6133-.3631-1.0769v-3.321c0-.1292.0615-.1927.1908-.1927h.564c.1293 0 .1929.0635.1929.1907v3.0215c0 .3425.0656.5948.201.7569.1333.162.3487.242.642.242.4595 0 .923-.1518 1.3887-.4574v-3.565c0-.1272.0615-.1908.1908-.1908h.564c.1293 0 .1929.0636.1929.1908v4.4511c0 .1252-.0636.1887-.1928.1887h-.4103c-.0636 0-.1149-.0123-.1497-.0369-.0349-.0266-.0575-.0738-.0718-.1436l-.0657-.3323c-.5948.437-1.204.6564-1.8297.6564zm5.4399 0c-.5374 0-1.0195-.0882-1.4461-.2666a.3754.3754 0 0 1-.158-.1047c-.0287-.039-.043-.0984-.043-.1805v-.2687c0-.1148.0369-.1723.1148-.1723.0452 0 .1231.0205.238.0575.4225.1333.8615.199 1.3128.199.3138 0 .5517-.0616.7138-.1806.164-.121.244-.2954.244-.523a.4923.4923 0 0 0-.1476-.3734 1.606 1.606 0 0 0-.5415-.285l-.8144-.3037c-.7097-.2605-1.0625-.7056-1.0625-1.3333 0-.4143.16-.7487.484-1.001.3221-.2543.7447-.3815 1.2677-.3815a3.487 3.487 0 0 1 1.2164.2195c.076.0246.1313.0574.1641.0985.0308.041.0472.1025.0472.1846v.2584c0 .1149-.041.1723-.123.1723a.8615.8615 0 0 1-.2216-.0472 3.5495 3.5495 0 0 0-1.0359-.1538c-.6112 0-.919.2072-.919.6195 0 .164.0514.2953.154.3897.1025.0964.3035.201.603.3159l.7466.2872c.3774.1436.6482.318.8144.519.1661.1989.2482.4574.2482.7753 0 .4513-.1682.8102-.5067 1.0769-.3385.2666-.7877.4-1.3497.4v.002zm3.0645-.1436c-.1272 0-.1928-.0615-.1928-.1907v-4.4491c0-.1272.0656-.1908.1928-.1908h.5641c.1272 0 .1928.0636.1928.1908v4.4511c0 .1251-.0656.1887-.1928.1887h-.564zm.2872-5.688c-.1846 0-.3303-.0513-.437-.1559a.558.558 0 0 1-.1579-.4143c0-.1724.0534-.3098.158-.4144a.5907.5907 0 0 1 .4369-.158c.1846 0 .3282.0534.4349.158.1066.1026.1579.242.1579.4144 0 .1702-.0513.3076-.158.4143-.1046.1026-.2502.1559-.4348.1559zm4.002 5.7926c-.7529 0-1.3293-.2133-1.7272-.642-.4-.4307-.599-1.0502-.599-1.8625 0-.8061.2052-1.4318.6175-1.8728.4102-.441.9948-.6625 1.7476-.6625.3446 0 .683.0615 1.0154.1825.0697.0247.119.0554.1477.0944s.043.1026.043.1908v.2564c0 .1271-.041.1907-.123.1907-.0329 0-.082-.0082-.1539-.0287a2.8307 2.8307 0 0 0-.7959-.1128c-.5353 0-.923.1333-1.1589.404s-.3528.6996-.3528 1.2924v.123c0 .5764.119 1.001.359 1.2718.24.2687.6174.404 1.1343.404.2666 0 .5538-.043.8615-.1332.0718-.0206.119-.0288.1436-.0288.082 0 .1251.0636.1251.1908v.2585c0 .082-.0123.1435-.039.1805-.0246.0369-.0759.0718-.1518.1025-.3138.1354-.6769.201-1.0933.201z"/></svg>`,
    Tidal: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#FFFFFF" d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996 4.004 12l4.004-4.004L12.012 12l-4.004 4.004 4.004 4.004 4.004-4.004L12.012 12l4.004-4.004-4.004-4.004zM16.042 7.996l3.979-3.979L24 7.996l-3.979 3.979z"/></svg>`,
    Deezer: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#A238FF" d="M.693 10.024c.381 0 .693-1.256.693-2.807 0-1.55-.312-2.807-.693-2.807C.312 4.41 0 5.666 0 7.217s.312 2.808.693 2.808ZM21.038 1.56c-.364 0-.684.805-.91 2.096C19.765 1.446 19.184 0 18.526 0c-.78 0-1.464 2.036-1.784 5-.312-2.158-.788-3.536-1.325-3.536-.745 0-1.386 2.704-1.62 6.472-.442-1.932-1.083-3.145-1.793-3.145s-1.35 1.213-1.793 3.145c-.242-3.76-.874-6.463-1.628-6.463-.537 0-1.013 1.378-1.325 3.535C6.938 2.036 6.262 0 5.474 0c-.658 0-1.247 1.447-1.602 3.665-.217-1.291-.546-2.105-.91-2.105-.675 0-1.221 2.807-1.221 6.272 0 3.466.546 6.273 1.221 6.273.277 0 .537-.476.736-1.273.32 2.928.996 4.938 1.776 4.938.606 0 1.143-1.204 1.507-3.11.251 3.622.875 6.195 1.602 6.195.46 0 .875-1.023 1.187-2.677C10.142 21.6 11 24 12.004 24c1.005 0 1.863-2.4 2.235-5.822.312 1.654.727 2.677 1.186 2.677.728 0 1.352-2.573 1.603-6.195.364 1.906.9 3.11 1.507 3.11.78 0 1.455-2.01 1.775-4.938.208.797.46 1.273.737 1.273.675 0 1.22-2.807 1.22-6.273-.008-3.457-.553-6.272-1.23-6.272ZM23.307 10.024c.381 0 .693-1.256.693-2.807 0-1.55-.312-2.807-.693-2.807-.381 0-.693 1.256-.693 2.807s.312 2.808.693 2.808Z"/></svg>`,
    SoundCloud: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#FF5500" d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z"/></svg>`,
    Pandora: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#3668FF" d="M1.882 0v24H8.32a1.085 1.085 0 001.085-1.085v-4.61h1.612c7.88 0 11.103-4.442 11.103-9.636C22.119 2.257 17.247 0 12.662 0H1.882Z"/></svg>`,
    Instagram: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="sw-ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FEDA75"/><stop offset="0.3" stop-color="#FA7E1E"/><stop offset="0.55" stop-color="#D62976"/><stop offset="0.8" stop-color="#962FBF"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs><path fill="url(#sw-ig)" d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>`,
    TikTok: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#25F4EE" transform="translate(-0.7 -0.7)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/><path fill="#FE2C55" transform="translate(0.7 0.7)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/><path fill="#FFFFFF" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
  };

  function icon(platform) {
    return ICONS[platform] || `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>`;
  }

  // The same mark in one color (the text color), for quiet places like the
  // footer and on light buttons. Drops the extra layers that only make sense in color.
  function monoIcon(platform) {
    const svg = ICONS[platform];
    if (!svg) return icon(platform);
    return svg
      .replace(/<defs>[\s\S]*?<\/defs>/, '')
      .replace(/<path fill="#FFFFFF" d="M9\.545[^"]*"\/>/, '')           // YouTube's white triangle
      .replace(/<path fill="[^"]*" transform="[^"]*" d="[^"]*"\/>/g, '') // TikTok's offset color layers
      .replace(/fill="[^"]*"/g, 'fill="currentColor"');
  }

  const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */
  const TYPE_LABEL = { album: 'Album', ep: 'EP', single: 'Single' };
  const typeLabel = t => TYPE_LABEL[t] || t;
  const typeWord  = t => (t === 'ep' ? 'EP' : typeLabel(t).toLowerCase());

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (d === 1 && m === 1) return String(y);
    if (d === 1) return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const yearOf = iso => (iso ? iso.slice(0, 4) : '');

  // Responsive cover art: 480w for grids, 1000w for large placements
  function coverImg(release, { sizes, cls = '', extra = '', alt } = {}) {
    const base = `assets/covers/${release.cover}`;
    return `<img
      src="/${base}-480.webp"
      srcset="/${base}-480.webp 480w, /${base}-1000.webp 1000w"
      sizes="${sizes}"
      alt="${alt !== undefined ? alt : `${escapeHTML(release.title)} cover art`}"
      class="${cls}"
      width="1000"
      height="1000"
      loading="lazy"
      decoding="async"
      ${extra}
    />`;
  }

  // The cover, blurred and faded, as colored light behind a release
  const coverGlow = (release, cls) => `
      <div class="cover-glow ${cls || ''}" aria-hidden="true">
        <img src="/assets/covers/${release.cover}-480.webp" alt="" width="480" height="480" loading="lazy" decoding="async" />
      </div>`;

  const liveLinks = release => (release.links || []).filter(l => l.url && l.url !== '#');

  // The first platform is the main button; the rest sit beside it, quieter
  // The first link is a light button, so it keeps the brand colors unless the
  // icon is white and would disappear against it
  const WHITE_ICONS = new Set(['Apple Music', 'Tidal']);

  function streamLinks(release, ariaPrefix) {
    return liveLinks(release).map((l, i) => `
        <a href="${l.url}" class="${i === 0 ? 'btn-primary' : 'btn-outline'}" data-platform="${escapeHTML(l.platform)}" target="_blank" rel="noopener noreferrer" aria-label="${ariaPrefix} on ${escapeHTML(l.platform)}">
          <span class="btn-platform-icon" aria-hidden="true">${i === 0 && WHITE_ICONS.has(l.platform) ? monoIcon(l.platform) : icon(l.platform)}</span>
          ${escapeHTML(l.platform)}
        </a>`).join('');
  }

  // Spotify player, worked out from the Spotify link (no extra data needed)
  function spotifyEmbed(release, height) {
    const spotify = liveLinks(release).find(l => l.platform === 'Spotify' && /open\.spotify\.com\/(album|track)\/([A-Za-z0-9]+)/.test(l.url));
    if (!spotify) return '';
    const [, type, sid] = spotify.url.match(/open\.spotify\.com\/(album|track)\/([A-Za-z0-9]+)/);
    return `
      <div class="spotify-embed" style="height:${height}px">
        <iframe
          src="https://open.spotify.com/embed/${type}/${sid}?utm_source=generator&theme=0"
          height="${height}"
          title="${escapeHTML(release.title)} on Spotify"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
      </div>`;
  }

  // How many releases and videos show before the "Show all" buttons.
  // The first video plays large, so seven fills the big one plus two rows.
  const RELEASE_LIMIT = 8;
  const VIDEO_LIMIT = 7;

  const featuredOf = releases => releases.find(r => r.featured) || releases[0];

  /* ----------------------------------------------------------
     HERO: the newest release, one tap from the top of the page
  ---------------------------------------------------------- */
  function heroRelease(featured) {
    return `<span class="hero-release-art">${coverImg(featured, { sizes: '72px', alt: '', extra: 'loading="eager"' })}</span>
        <span class="hero-release-text">
          <span class="hero-release-kicker">Latest ${typeWord(featured.type)}</span>
          <span class="hero-release-title">${escapeHTML(featured.title)}</span>
        </span>
        <span class="hero-release-go" aria-hidden="true">${ARROW}</span>`;
  }

  /* ----------------------------------------------------------
     RELEASES
  ---------------------------------------------------------- */
  function releaseCard(release, hidden = false) {
    return `
      <article class="release-card animate-on-scroll${hidden ? ' hidden' : ''}" data-type="${escapeHTML(release.type)}">
        <a href="/${release.id}" class="release-card-link" aria-label="${escapeHTML(release.title)}, ${typeLabel(release.type)}">
          <div class="release-card-art">
            ${coverImg(release, { sizes: '(min-width: 1200px) 290px, (min-width: 650px) 30vw, 45vw', cls: 'release-card-img' })}
          </div>
          <h3 class="release-card-title">${escapeHTML(release.title)}</h3>
          <p class="release-card-meta"><span>${typeLabel(release.type)}</span><span>${yearOf(release.date)}</span></p>
        </a>
      </article>`;
  }

  // The full grid, with the cards past the limit hidden until "Show all"
  const discography = releases => releases.map((r, i) => releaseCard(r, i >= RELEASE_LIMIT)).join('');

  function featuredRelease(featured) {
    const links = streamLinks(featured, `Stream ${featured.title}`);
    return `
      ${coverGlow(featured, 'featured-glow')}
      <a href="/${featured.id}" class="featured-cover-link" aria-label="Open ${escapeHTML(featured.title)}">
        ${coverImg(featured, { sizes: '(min-width: 1024px) 560px, (min-width: 640px) 420px, 92vw', cls: 'featured-cover' })}
      </a>
      <div class="featured-info">
        <p class="kicker">Latest ${typeWord(featured.type)}${featured.date ? `<span>${formatDate(featured.date)}</span>` : ''}</p>
        <h2 class="featured-title" id="featuredTitle"><a href="/${featured.id}">${escapeHTML(featured.title)}</a></h2>
        <div class="stream-links">
          ${links || '<p class="release-coming-soon">Coming soon to all platforms.</p>'}
        </div>
        ${spotifyEmbed(featured, 152)}
        <a href="/${featured.id}" class="text-link">More on this ${typeWord(featured.type)} ${ARROW}</a>
      </div>`;
  }

  /* ----------------------------------------------------------
     VIDEOS
     The thumbnail carries the video's id and title, and main.js
     swaps it for the YouTube player when it is clicked.
  ---------------------------------------------------------- */
  function videoThumb(youtubeId, title, { cls = 'video-thumb-wrap', label = `Play ${title}`, extra = '' } = {}) {
    const hq  = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    const max = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    return `
        <div class="${cls}" role="button" tabindex="0" aria-label="${escapeHTML(label)}"
             data-youtube-id="${escapeHTML(youtubeId)}" data-title="${escapeHTML(title)}">
          <img src="${max}" data-fallback="${hq}" alt="" class="video-thumb" width="1280" height="720" decoding="async" ${extra}
               onload="if(this.naturalWidth<400&&this.src!==this.dataset.fallback){this.src=this.dataset.fallback}"
               onerror="if(this.src!==this.dataset.fallback){this.src=this.dataset.fallback}" />
          <div class="video-play-btn" aria-hidden="true">
            <div class="video-play-icon">
              <svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg>
            </div>
          </div>
        </div>`;
  }

  function videoIframe(youtubeId, title) {
    return `<iframe
          src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0"
          title="${escapeHTML(title)} by SyWavy (official music video)"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>`;
  }

  function videoItem(video, hidden = false, lead = false) {
    return `
      <div class="video-item${lead ? ' video-lead' : ''}${hidden ? ' hidden' : ''}">
        ${videoThumb(video.youtubeId, video.title, { extra: lead ? 'loading="lazy" fetchpriority="low"' : 'loading="lazy"' })}
        <div class="video-meta">
          ${lead ? '<p class="kicker">Newest video</p>' : ''}
          <p class="video-title">${escapeHTML(video.title)}</p>
          ${video.date ? `<p class="video-date">${formatDate(video.date)}</p>` : ''}
        </div>
      </div>`;
  }

  const videos = list => list.map((v, i) => videoItem(v, i >= VIDEO_LIMIT, i === 0)).join('');

  /* ----------------------------------------------------------
     SOCIALS AND FOLLOW LINKS
  ---------------------------------------------------------- */

  // Icon only, one color (footer)
  const socialLinks = socials => socials.map(s => `<a href="${escapeHTML(s.url)}" class="social-icon-link" data-platform="${escapeHTML(s.platform)}" aria-label="SyWavy on ${escapeHTML(s.platform)}" target="_blank" rel="noopener noreferrer">${monoIcon(s.platform)}</a>`).join('');

  // Icon and name (About). Streaming pages first, since a follow there is what counts most.
  const followLinks = pages => pages.map(s => `<a href="${escapeHTML(s.url)}" class="follow-link" data-platform="${escapeHTML(s.platform)}" target="_blank" rel="noopener noreferrer"><span class="follow-icon" aria-hidden="true">${monoIcon(s.platform)}</span>${escapeHTML(s.platform)}</a>`).join('');

  /* ----------------------------------------------------------
     ABOUT
  ---------------------------------------------------------- */

  // Periods that don't end a sentence, like the one in "St. Petersburg"
  const ABBREVIATION = /\b(?:St|Mt|Ft|Mr|Mrs|Ms|Dr|Jr|Sr|vs)\.$/;

  // The first sentence of the bio leads in large type, the rest follows.
  // A blank line in the bio starts a new paragraph.
  function aboutBio(bio) {
    const paras = String(bio).split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    if (!paras.length) return '';
    const first = paras.shift();
    const ends = /[.!?]["”)]?(?=\s+["“A-Z])/g;
    let cut = -1, m;
    while ((m = ends.exec(first))) {
      const end = m.index + m[0].length;
      if (!ABBREVIATION.test(first.slice(0, end))) { cut = end; break; }
    }
    const lede = cut < 0 ? first : first.slice(0, cut);
    const rest = cut < 0 ? paras : [first.slice(cut).trim(), ...paras];
    return `<p class="about-lede">${escapeHTML(lede)}</p>` +
      rest.map(p => `<p class="about-rest">${escapeHTML(p)}</p>`).join('');
  }

  // Plain facts, all worked out from data.js. The song count comes from the
  // lyrics files, so only build.js knows it; without it the release count shows.
  function aboutFacts(data, songCount) {
    const years = data.releases.map(r => yearOf(r.date)).filter(Boolean).sort();
    const facts = [
      ['From', data.artist.location],
      ['First release', years[0]],
      songCount ? ['Songs', String(songCount)] : ['Releases', String(data.releases.length)]
    ].filter(([, v]) => v);
    return facts.map(([k, v]) => `<div><dt>${escapeHTML(k)}</dt><dd>${escapeHTML(v)}</dd></div>`).join('');
  }

  /* ----------------------------------------------------------
     RELEASE PAGE (sywavy.com/flame and so on)
  ---------------------------------------------------------- */

  // The two releases on either side of this one, filled to four
  function relatedReleases(releases, index) {
    const related = [];
    for (let step = 1; related.length < 4 && step < releases.length; step++) {
      if (releases[index - step]) related.push(releases[index - step]);
      if (related.length < 4 && releases[index + step]) related.push(releases[index + step]);
    }
    return related.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  // extras come from build.js: the tracklist with links to the lyrics, a
  // paragraph on the sound, and an album's track by track. The page reads fine
  // without them.
  function releasePage(release, releases, extras = {}) {
    const kind  = typeLabel(release.type);
    const links = streamLinks(release, `Stream ${release.title}`);
    const embedHTML = spotifyEmbed(release, release.type === 'single' ? 152 : 352);

    /* Optional tracklist (only when data is provided) */
    const tracklist = Array.isArray(release.tracklist) && release.tracklist.length ? release.tracklist : null;
    const tracklistHTML = extras.tracks ? extras.tracks : !tracklist ? '' : `
    <div class="release-tracklist">
      <h2 class="tracklist-heading">Tracklist</h2>
      <ol class="tracklist">
        ${tracklist.map((t, i) => {
          const title = typeof t === 'string' ? t : t.title;
          const dur   = typeof t === 'object' && t.duration ? `<span class="track-duration">${escapeHTML(t.duration)}</span>` : '';
          const feat  = typeof t === 'object' && t.features ? `<span class="track-features"> feat. ${escapeHTML(t.features)}</span>` : '';
          return `<li class="track-item"><span class="track-num">${String(i + 1).padStart(2, '0')}</span><span class="track-title">${escapeHTML(title)}${feat}</span>${dur}</li>`;
        }).join('')}
      </ol>
    </div>`;

    /* Music video */
    const videoHTML = release.musicVideoId ? `
    <section class="release-section" aria-labelledby="releaseVideoHeading">
      <div class="section-head"><h2 id="releaseVideoHeading" class="section-heading section-heading-sm">Music video</h2></div>
      ${videoThumb(release.musicVideoId, release.title, { cls: 'video-thumb-wrap release-video-thumb-wrap', label: `Play the ${release.title} music video` })}
    </section>` : '';

    const index   = releases.indexOf(release);
    const related = relatedReleases(releases, index).map(r => releaseCard(r)).join('');

    return `
    ${coverGlow(release, 'release-glow')}
    <div class="release-page-inner animate-on-scroll">
      <div class="release-page-cover">
        ${coverImg(release, { sizes: '(min-width: 1024px) 460px, (min-width: 640px) 300px, 88vw', cls: 'release-cover-img', extra: 'loading="eager" fetchpriority="high"' })}
      </div>
      <div class="release-page-info">
        <p class="kicker">${kind}${release.date ? `<span>${formatDate(release.date)}</span>` : ''}</p>
        <h1 class="release-page-title">${escapeHTML(release.title)}</h1>
        <p class="release-page-artist">SyWavy</p>
        <div class="stream-links">
          ${links || '<p class="release-coming-soon">Coming soon to all platforms.</p>'}
        </div>
        ${embedHTML}
        ${tracklistHTML}
      </div>
    </div>
    ${extras.sound || ''}
    ${extras.arc || ''}
    ${videoHTML}
    <section class="release-section" aria-labelledby="relatedHeading">
      <div class="section-head"><h2 id="relatedHeading" class="section-heading section-heading-sm">More from SyWavy</h2></div>
      <div class="related-grid" id="relatedGrid">${related}</div>
    </section>`;
  }

  return {
    icon, monoIcon, typeLabel, escapeHTML, formatDate, streamLinks,
    RELEASE_LIMIT, VIDEO_LIMIT, featuredOf,
    heroRelease, discography, featuredRelease, videos, videoIframe,
    socialLinks, followLinks, aboutBio, aboutFacts, releasePage
  };
})();
