import axios from 'axios'
import qs from 'qs'


async function exchangeCode(code: string): Promise<string> {
  const response = await axios.post('https://api.linear.app/oauth/token', qs.stringify({
    client_id: process.env.LINEAR_CLIENT_ID,
    client_secret: process.env.LINEAR_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.LINEAR_REDIRECT_URI,
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.data.access_token
}

export default exchangeCode
