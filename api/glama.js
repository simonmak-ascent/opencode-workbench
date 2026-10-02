export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400");
  res.status(200).send(
    JSON.stringify(
      {
        $schema: "https://glama.ai/mcp/schemas/connector.json",
        claim: "glama_claim_-rgFSSE6Fr8KZ_NK1iogclzjnF4VfXzn",
      },
      null,
      2,
    ),
  );
}
