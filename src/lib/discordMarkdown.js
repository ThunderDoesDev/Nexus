const FORMAT_BUTTONS = [
  { id: "bold", label: "Bold", wrap: ["**", "**"], example: "**bold**" },
  { id: "italic", label: "Italic", wrap: ["*", "*"], example: "*italic*" },
  { id: "underline", label: "Underline", wrap: ["__", "__"], example: "__underline__" },
  { id: "strike", label: "Strike", wrap: ["~~", "~~"], example: "~~strike~~" },
  { id: "spoiler", label: "Spoiler", wrap: ["||", "||"], example: "||spoiler||" },
  { id: "code", label: "Code", wrap: ["`", "`"], example: "`code`" },
  { id: "_codeblock", label: "Block", wrap: ["```\n", "\n```"], example: "```\ncode block\n```" },
  { id: "quote", label: "Quote", prefix: "> ", example: "> quoted text" },
  { id: "link", label: "Link", wrap: ["[text](", ")"], example: "[Nexus](https://discord.com)" },
];

export { FORMAT_BUTTONS };

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyInlineFormatting(text) {
  let result = text;

  result = result.replace(/`([^`\n]+)`/g, '<code class="nx-md-code">$1</code>');
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/__(.+?)__/g, "<u>$1</u>");
  result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  result = result.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "<em>$1</em>");
  result = result.replace(/~~(.+?)~~/g, "<s>$1</s>");
  result = result.replace(/\|\|(.+?)\|\|/g, '<span class="nx-md-spoiler">$1</span>');
  result = result.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" class="nx-md-link" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  result = result.replace(
    /&lt;t:(\d+)(?::([tTdDfFR]))?&gt;/g,
    '<span class="nx-md-timestamp" title="Unix: $1">$1</span>'
  );
  result = result.replace(
    /&lt;@!?(\d+)&gt;/g,
    '<span class="nx-md-mention">@user</span>'
  );
  result = result.replace(
    /&lt;@&amp;(\d+)&gt;/g,
    '<span class="nx-md-mention">@role</span>'
  );
  result = result.replace(
    /&lt;#(\d+)&gt;/g,
    '<span class="nx-md-mention">#channel</span>'
  );
  result = result.replace(
    /&lt;(a?):([^:]+):(\d+)&gt;/g,
    '<span class="nx-md-emoji" title=":$2:">$2</span>'
  );

  return result;
}

export function renderDiscordMarkdown(source) {
  if (!source) return "";

  const lines = source.split("\n");
  const html = [];
  let inCodeBlock = false;
  let codeBlockContent = [];

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        html.push(
          `<pre class="nx-md-pre"><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    const escaped = escapeHtml(line);

    if (line.startsWith(">>> ")) {
      html.push(
        `<blockquote class="nx-md-blockquote">${applyInlineFormatting(escapeHtml(line.slice(4)))}</blockquote>`
      );
      continue;
    }

    if (line.startsWith("> ")) {
      html.push(
        `<blockquote class="nx-md-blockquote">${applyInlineFormatting(escapeHtml(line.slice(2)))}</blockquote>`
      );
      continue;
    }

    if (line.trim() === "") {
      html.push("<br />");
      continue;
    }

    html.push(`<p class="nx-md-line">${applyInlineFormatting(escaped)}</p>`);
  }

  if (inCodeBlock && codeBlockContent.length) {
    html.push(
      `<pre class="nx-md-pre"><code>${escapeHtml(codeBlockContent.join("\n"))}</code></pre>`
    );
  }

  return html.join("");
}

export function wrapSelection(text, selectionStart, selectionEnd, before, after = before) {
  const selected = text.slice(selectionStart, selectionEnd);
  const wrapped = `${before}${selected || "text"}${after}`;
  const next = text.slice(0, selectionStart) + wrapped + text.slice(selectionEnd);
  const cursorStart = selectionStart + before.length;
  const cursorEnd = cursorStart + (selected || "text").length;
  return { text: next, selectionStart: cursorStart, selectionEnd: cursorEnd };
}

export function prefixLines(text, selectionStart, selectionEnd, prefix) {
  const before = text.slice(0, selectionStart);
  const selected = text.slice(selectionStart, selectionEnd);
  const after = text.slice(selectionEnd);
  const lines = selected || "text";
  const prefixed = lines
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
  const next = before + prefixed + after;
  return {
    text: next,
    selectionStart: selectionStart,
    selectionEnd: selectionStart + prefixed.length,
  };
}
