/**
 * Tawk.to live chat credentials.
 *
 * Find these in Tawk dashboard:
 * Administration → Channels → Chat Widget → Direct Chat Link
 * URL format: https://tawk.to/chat/{PROPERTY_ID}/{WIDGET_ID}
 */
export const TAWK_CONFIG = {
  PROPERTY_ID: '6a3e63a976bc691d457aa1b0',
  WIDGET_ID: '1js1rakeg',
  /** Optional full override from Tawk dashboard Direct Chat Link. */
  DIRECT_CHAT_URL: 'https://tawk.to/chat/6a3e63a976bc691d457aa1b0/1js1rakeg',
};

export const getTawkDirectChatUrl = () => {
  const override = String(TAWK_CONFIG.DIRECT_CHAT_URL || '').trim();
  if (override) return override;

  const propertyId = String(TAWK_CONFIG.PROPERTY_ID || '').trim();
  const widgetId = String(TAWK_CONFIG.WIDGET_ID || '').trim();
  if (!propertyId || !widgetId) return '';

  return `https://tawk.to/chat/${propertyId}/${widgetId}`;
};

export const isTawkConfigured = () => Boolean(getTawkDirectChatUrl());

const escapeJsString = value =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n');

/** Inline HTML for in-app WebView — waits for Tawk onLoad before showing chat. */
export const buildTawkEmbedHtml = ({ visitor, backgroundColor = '#F5F7FA' } = {}) => {
  const propertyId = String(TAWK_CONFIG.PROPERTY_ID || '').trim();
  const widgetId = String(TAWK_CONFIG.WIDGET_ID || '').trim();

  const name = escapeJsString(visitor?.name);
  const email = escapeJsString(visitor?.email);
  const phone = escapeJsString(visitor?.phone);
  const hasVisitor = Boolean(name || email || phone);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: ${backgroundColor};
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    <script type="text/javascript">
      var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
      Tawk_API.onLoad = function () {
        ${
          hasVisitor
            ? `
        var attrs = {};
        ${name ? `attrs.name = '${name}';` : ''}
        ${email ? `attrs.email = '${email}';` : ''}
        ${phone ? `attrs.phone = '${phone}';` : ''}
        if (Object.keys(attrs).length && Tawk_API.setAttributes) {
          Tawk_API.setAttributes(attrs, function () {});
        }`
            : ''
        }
        if (Tawk_API.maximize) {
          Tawk_API.maximize();
        }
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage('tawk-ready');
        }
      };
      (function () {
        var s1 = document.createElement('script');
        var s0 = document.getElementsByTagName('script')[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/${propertyId}/${widgetId}';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
      })();
    </script>
  </body>
</html>`;
};
