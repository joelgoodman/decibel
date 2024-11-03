import Head from 'next/head'
import { OpenGraph, SchemaOrg } from '@/lib/seo/schemas'

interface MetaTagsProps {
  title: string
  description?: string
  canonical?: string
  openGraph?: OpenGraph
  schema?: SchemaOrg
  noindex?: boolean
}

export function MetaTags({
  title,
  description,
  canonical,
  openGraph,
  schema,
  noindex,
}: MetaTagsProps) {
  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      {openGraph && (
        <>
          <meta property="og:title" content={openGraph.title} />
          <meta property="og:description" content={openGraph.description} />
          <meta property="og:type" content={openGraph.type} />
          <meta property="og:url" content={openGraph.url} />
          {openGraph.image && <meta property="og:image" content={openGraph.image} />}
          {openGraph.siteName && <meta property="og:site_name" content={openGraph.siteName} />}
          {openGraph.locale && <meta property="og:locale" content={openGraph.locale} />}
          
          {openGraph.article && (
            <>
              {openGraph.article.publishedTime && (
                <meta property="article:published_time" content={openGraph.article.publishedTime} />
              )}
              {openGraph.article.modifiedTime && (
                <meta property="article:modified_time" content={openGraph.article.modifiedTime} />
              )}
              {openGraph.article.author && (
                <meta property="article:author" content={openGraph.article.author} />
              )}
              {openGraph.article.tags?.map((tag) => (
                <meta key={tag} property="article:tag" content={tag} />
              ))}
            </>
          )}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {openGraph?.image && <meta name="twitter:image" content={openGraph.image} />}

      {/* Schema.org */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
    </Head>
  )
}