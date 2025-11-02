import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true,
});

function normalizeMarkdown(markdown: string): string {
  // Ensure headings render even if a user omits the required space, e.g. "##Heading"
  const withHeadingSpacing = markdown.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');
  return withHeadingSpacing;
}

export function renderMarkdown(markdown: string): string {
  const normalized = normalizeMarkdown(markdown);
  return marked.parse(normalized) as string;
}
