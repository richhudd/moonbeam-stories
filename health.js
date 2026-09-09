module.exports = async function handler(req, res) {
  res.status(200).json({ ok: true, openaiKeyConfigured: Boolean(process.env.OPENAI_API_KEY) });
};
