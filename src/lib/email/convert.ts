import { Post } from '@prisma/client'

export function convertPostToMjml(post: Post): string {
  return `
<mjml>
  <mj-head>
    <mj-title>${post.title}</mj-title>
    <mj-preview>${post.excerpt || ''}</mj-preview>
    <mj-attributes>
      <mj-all font-family="helvetica" />
      <mj-text font-weight="400" font-size="16px" color="#000000" line-height="24px" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f4">
    <mj-section background-color="#ffffff" padding-bottom="20px" padding-top="20px">
      <mj-column width="100%">
        <mj-image src="${post.coverImage || ''}" alt="${post.title}" padding="0px"></mj-image>
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding-bottom="20px" padding-top="20px">
      <mj-column width="90%">
        <mj-text font-size="32px" font-weight="bold" align="center">
          ${post.title}
        </mj-text>
        ${post.excerpt ? `
        <mj-text font-size="18px" color="#666666" align="center">
          ${post.excerpt}
        </mj-text>
        ` : ''}
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding-bottom="20px" padding-top="0px">
      <mj-column width="90%">
        <mj-text>
          ${convertContentToMjml(post.content)}
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `.trim()
}

function convertContentToMjml(content: string): string {
  // TODO: Implement more sophisticated content conversion
  // This is a basic implementation that should be enhanced
  return content
    .replace(/<h([1-6])>(.*?)<\/h\1>/g, (_, level, text) => 
      `<mj-text font-size="${28 - (level * 2)}px" font-weight="bold" padding-top="24px" padding-bottom="8px">${text}</mj-text>`)
    .replace(/<p>(.*?)<\/p>/g, '<mj-text padding-bottom="16px">$1</mj-text>')
    .replace(/<img.*?src="(.*?)".*?>/g, '<mj-image src="$1" padding-bottom="16px"></mj-image>')
    .replace(/<blockquote>(.*?)<\/blockquote>/g, 
      '<mj-text padding="16px" background-color="#f8f8f8" border-left="4px solid #e2e8f0">$1</mj-text>')
}