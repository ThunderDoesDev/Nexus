export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { clientId } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required' });
  }
  if (!/^\d{17,19}$/.test(clientId)) {
    return res.status(400).json({ error: 'Invalid client ID format' });
  }
  try {
    const response = await fetch(`https://discord.com/api/v10/applications/${clientId}/rpc`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Bot not found. Make sure the client ID is correct.' });
      }
      return res.status(response.status).json({ error: 'Failed to fetch bot information' });
    }
    const data = await response.json();
    return res.status(200).json({
      id: data.id,
      name: data.name,
      description: data.description || '',
      icon: data.icon ? `https://cdn.discordapp.com/app-icons/${data.id}/${data.icon}` : null,
    });
  } catch (error) {
    console.error('Error fetching bot info:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}