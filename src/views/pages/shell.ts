import { type Hole, html } from "#/lib/view";

export function shell({
  path,
  title,
  subheader,
  msg,
  content,
}: {
  path: string[];
  title: string;
  subheader: string | Hole;
  msg?: string | Hole;
  content: Hole;
}) {
  const errorClass = msg ? "error visible" : "error";
  const isLoggedIn = path[0] !== "login";
  const hasPrev = path.length > 0 && isLoggedIn;
  let prevDest;
  if (hasPrev) {
    prevDest = `/${path.slice(0, -1).join("/")}`;
  }
  return html`<html>
    <head>
      <title>${title}</title>
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css"
      />
      <link rel="stylesheet" href="/public/styles.css" />
      <script src="https://unpkg.com/htmx.org@2.0.4"></script>
      <script
        src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
        defer
      ></script>
    </head>
    <body>
      <div class="${errorClass}">${msg}</div>
      <header id="header">
        <div class="row">
          <div class="col">
            <h1>
              <a href="/"
                ><span class="pm">pm</span><span class="sky">sky</span></a
              >
            </h1>
            <p>${subheader}</p>
          </div>
          ${logout(isLoggedIn)}
        </div>
      </header>
      <main id="content">${content}</main>
    </body>
  </html>`;
}

function nav(hasPrev: boolean, prevDest: string) {
  return html` <div id="nav">
    ${hasPrev ? html`<a href="${prevDest}">Back</a>` : ""}
  </div>`;
}

function logout(isLoggedIn: boolean) {
  return html`<button
    style=${!isLoggedIn ? "visibility: hidden;" : ""}
    title="Log out"
    class="logout"
    hx-post="/logout"
    hx-target="html"
  >
    ✖
  </button>`;
}
