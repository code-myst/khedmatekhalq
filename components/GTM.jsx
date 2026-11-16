import Script from 'next/script';

// Google Tag Manager. Loads only when NEXT_PUBLIC_GTM_ID (e.g. GTM-XXXXXXX) is set.
// Meta Pixel / Google Ads tags are then managed inside the GTM container.
export default function GTM() {
  const id = process.env.NEXT_PUBLIC_GTM_ID;
  if (!id) return null;
  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=document.getElementsByTagName('script')[0],j=document.createElement('script');j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id=${id}';f.parentNode.insertBefore(j,f);`}
      </Script>
      <noscript>
        <iframe src={`https://www.googletagmanager.com/ns.html?id=${id}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
      </noscript>
    </>
  );
}
