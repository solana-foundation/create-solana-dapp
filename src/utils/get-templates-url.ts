export function getTemplatesUrl() {
  return (
    process.env.TEMPLATES_URL ??
    `https://raw.githubusercontent.com/solana-foundation/templates/refs/heads/main/templates.json`
  )
}
