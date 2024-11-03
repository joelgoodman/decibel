import { Node } from '@tiptap/pm/model'

interface MjmlBlock {
  tag: string
  attributes?: Record<string, string>
  content?: string
}

export function convertToMjml(content: string): string {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = content

  const blocks = Array.from(wrapper.children).map(convertNodeToMjml)

  return `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="helvetica" />
      <mj-text font-size="16px" color="#000000" line-height="24px" />
      <mj-section padding="20px 0" />
      <mj-column width="100%" />
    </mj-attributes>
  </mj-head>
  <mj-body>
    ${blocks.join('\n')}
  </mj-body>
</mjml>
`
}

function convertNodeToMjml(node: Element): string {
  switch (node.tagName.toLowerCase()) {
    case 'p':
      return `<mj-text>${node.innerHTML}</mj-text>`
    
    case 'h1':
    case 'h2':
    case 'h3':
      const fontSize = {
        h1: '32px',
        h2: '24px',
        h3: '20px',
      }[node.tagName.toLowerCase()]
      return `<mj-text font-size="${fontSize}" font-weight="bold">${node.innerHTML}</mj-text>`
    
    case 'img':
      return `<mj-image src="${node.getAttribute('src')}" alt="${node.getAttribute('alt') || ''}" />`
    
    case 'button':
      return `
<mj-button
  background-color="#000000"
  color="#ffffff"
  href="${node.getAttribute('href') || '#'}"
>
  ${node.innerHTML}
</mj-button>`
    
    case 'hr':
      return '<mj-divider border-color="#000000" border-width="1px" />'
    
    case 'blockquote':
      return `
<mj-text
  background-color="#f8f8f8"
  padding="20px"
  border-left="4px solid #000000"
>
  ${node.innerHTML}
</mj-text>`
    
    default:
      return `<mj-text>${node.innerHTML}</mj-text>`
  }
}