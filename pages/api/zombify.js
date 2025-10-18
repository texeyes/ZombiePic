import formidable from 'formidable'
import fs from 'fs'
import axios from 'axios'

export const config = {
  api: {
    bodyParser: false,
  }
}

const parseForm = (req) => new Promise((resolve, reject) => {
  const form = formidable({ multiples: false })
  form.parse(req, (err, fields, files) => {
    if (err) reject(err)
    resolve({ fields, files })
  })
})

export default async function handler(req, res) {
  if(req.method !== 'POST') return res.status(405).end()

  try{
    const { fields, files } = await parseForm(req)
    const file = files.photo
    const style = fields.style || 'classic'

    // read file to buffer
    const buffer = fs.readFileSync(file.filepath)

    // Call Replicate's image-to-image or SD Inpaint model
    // NOTE: You must set REPLICATE_API_TOKEN in Vercel/Env
    const replicateToken = process.env.REPLICATE_API_TOKEN
    if(!replicateToken) return res.status(500).json({ error: 'Replicate token not set' })

    const base64 = buffer.toString('base64')

    const promptMap = {
      classic: 'A hyperrealistic zombie portrait, decayed skin, glowing eyes, cinematic lighting, photographic detail, Halloween mood',
      cartoon: 'A cute cartoon zombie portrait, bold lines, colorful, playful, Halloween',
      survivor: 'A cinematic apocalypse survivor turned zombie, gritty, dramatic lighting, film poster style'
    }

    const prompt = promptMap[style] || promptMap.classic

    // Create a prediction on Replicate
    const predictionResp = await axios.post('https://api.replicate.com/v1/predictions', {
      version: '8df3a6a1a3b2e9f1c6b5d4e3f2a1b0c9', // placeholder: replace with actual model version ID
      input: {
        image: `data:image/jpeg;base64,${base64}`,
        prompt,
        strength: 0.7,
        prompt_strength: 7.5
      }
    },{
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json'
      }
    })

    const prediction = predictionResp.data

    // Poll for completion
    let outputUrl = null
    for(let i=0;i<40;i++){
      const check = await axios.get(`https://api.replicate.com/v1/predictions/${prediction.id}`,{ headers: { 'Authorization': `Token ${replicateToken}` } })
      if(check.data.status === 'succeeded'){
        outputUrl = check.data.output[0]
        break
      }
      if(check.data.status === 'failed') throw new Error('Generation failed')
      await new Promise(r=>setTimeout(r, 1500))
    }

    if(!outputUrl) return res.status(500).json({ error: 'Timeout generating image' })

    return res.status(200).json({ imageUrl: outputUrl })

  }catch(err){
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
