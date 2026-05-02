export default async function handler(req, res) {
  const q = req.body && req.body.question ? req.body.question : '';
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: 'Responde APENAS com JSON sem markdown. Formato: {"veredicto":"confirmado","confianca":80,"resumo":"texto","detalhes":"texto","fontes":"texto"}. Veredicto so pode ser confirmado, misto ou refutado. Portugues de Portugal.',
      messages: [{role: 'user', content: q}]
    })
  });
  const d = await r.json();
  const t = d.content[0].text.trim();
  const m = t.match(/\{[\s\S]*\}/);
  return res.status(200).json(m ? JSON.parse(m[0]) : {veredicto:'misto',confianca:50,resumo:t,detalhes:'',fontes:''});
}
