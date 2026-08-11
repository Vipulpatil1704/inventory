const SWAGGER_UI_VERSION = '5.32.12';
const CDN_BASE = `https://cdn.jsdelivr.net/npm/swagger-ui@${SWAGGER_UI_VERSION}/dist`;

const swaggerUiCdn = {
  css: `${CDN_BASE}/swagger-ui.css`,
  bundle: `${CDN_BASE}/swagger-ui-bundle.js`,
  preset: `${CDN_BASE}/swagger-ui-standalone-preset.js`,
};

/** CDN-only Swagger page — avoids Vercel failing to serve swagger-ui-dist static files. */
export function renderSwaggerHtml(specUrl = '/api/docs.json') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inventory API Docs</title>
  <link rel="stylesheet" href="${swaggerUiCdn.css}" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${swaggerUiCdn.bundle}"></script>
  <script src="${swaggerUiCdn.preset}"></script>
  <script>
    window.onload = function () {
      window.ui = SwaggerUIBundle({
        url: ${JSON.stringify(specUrl)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: 'StandaloneLayout',
        persistAuthorization: true,
      });
    };
  </script>
</body>
</html>`;
}
