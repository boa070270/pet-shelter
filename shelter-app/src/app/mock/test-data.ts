export const HTML1 = `<section>
<h3>A paragraph with a span inside</h3>
<p>Both the span and the paragraph have a border set. The
  client rects are in red. Note that the p has onlyone border
  box, while the span has multiple border boxes.</p>

<div>
  <strong>Original</strong>
  <p>
    <span>Paragraph that spans multiple lines</span>
  </p>
</div>

<div>
  <strong>p's rect</strong>
  <p class="withClientRectsOverlay">
    <span>Paragraph that spans multiple lines</span>
  </p>
</div>

<div>
  <strong>span's rect</strong>
  <p>
    <span class="withClientRectsOverlay">Paragraph that spans multiple lines</span>
  </p>
</div>
</section>
<section>
<h3>A list</h3>
<p>Note that the border box doesn't include the number, so
  neither do the client rects.</p>
<div>
  <strong>Original</strong>
  <ol>
    <li>Item 1</li>
    <li>Item 2</li>
  </ol>
</div>

<div>
  <strong>ol's rect</strong>
  <ol class="withClientRectsOverlay">
    <li>Item 1</li>
    <li>Item 2</li>
  </ol>
</div>

<div>
  <strong>each li's rect</strong>
  <ol>
    <li class="withClientRectsOverlay">Item 1</li>
    <li class="withClientRectsOverlay">Item 2</li>
  </ol>
</div>
</section>
<section>
<h3>A table with a caption</h3>
<p>Although the table's border box doesn't include the
  caption, the client rects do include the caption.</p>
<div>
  <strong>Original</strong>
  <table>
    <caption>caption</caption>
    <thead>
      <tr><th>thead</th></tr>
    </thead>
    <tbody>
      <tr><td>tbody</td></tr>
    </tbody>
  </table>
</div>

<div>
  <strong>table's rect</strong>
  <table class="withClientRectsOverlay">
    <caption>caption</caption>
    <thead>
      <tr><th>thead</th></tr>
    </thead>
    <tbody>
      <tr><td>tbody</td></tr>
    </tbody>
  </table>
</div>
</section>`;

export const HTML2 = `<ui-app-bar position="Up" sticky="true">
<div cdk-scrollable class="app-container">
  <img src="/api/v1/assets/16590" class="top-banner">
  <ui-input></ui-input>
  <ui-navbar></ui-navbar>
  <div class="app-container">
    <router-outlet></router-outlet>
  </div>
</div>
</ui-app-bar>
${HTML1}
${HTML1}`;
