import Script from 'next/script'

export const Clarity = () => {
  const clarityId = process.env.CLARITY_ID

  if (process.env.NODE_ENV === 'development') {
    return null
  }

  if (!clarityId) {
    return null
  }

  return (
    <Script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "this is needed."
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){
					c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
					t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
					y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
					})(window, document, "clarity", "script", "${clarityId}");	`,
      }}
      id="clarity-script"
    />
  )
}
