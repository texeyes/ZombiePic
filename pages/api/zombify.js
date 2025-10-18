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
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { fields, files } = await parseForm(req)
    
    const file = Array.isArray(files.photo) ? files.photo[0] : files.photo
    const style = Array.isArray(fields.style) ? fields.style[0] : (fields.style || 'classic')

    if (!file || !file.filepath) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN
    if (!replicateToken) {
      return res.status(500).json({ 
        error: 'Missing API token. Please add REPLICATE_API_TOKEN in Vercel environment variables.' 
      })
    }

    const buffer = fs.readFileSync(file.filepath)
    const base64 = buffer.toString('base64')

    const promptMap = {
      classic: 'zombie portrait, decayed rotting skin, undead horror, dramatic lighting, highly detailed, scary',
      cartoon: 'cute cartoon zombie character, colorful, playful, Halloween style, fun',
      survivor: 'post-apocalyptic zombie survivor, gritty, cinematic, dark, dramatic'
    }

    const prompt = promptMap[style] || promptMap.classic

    const modelVersion = 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'
    
    console.log('Creating prediction with Replicate...')
    
    const predictionResp = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: modelVersion,
        input: {
          image: `data:image/jpeg;base64,${base64}`,
          prompt: prompt,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          strength: 0.75
        }
      },
      {
        headers: {
          'Authorization': `Token ${replicateToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const prediction = predictionResp.data
    console.log('Prediction created:', prediction.id)

    let outputUrl = null
    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const checkResp = await axios.get(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${replicateToken}`
          }
        }
      )
      
      const status = checkResp.data.status
      console.log(`Attempt ${i + 1}: ${status}`)
      
      if (status === 'succeeded') {
        outputUrl = Array.isArray(checkResp.data.output) 
          ? checkResp.data.output[0] 
          : checkResp.data.output
        break
      }
      
      if (status === 'failed') {
        const errorMsg = checkResp.data.error || 'Unknown error'
        console.error('Generation failed:', errorMsg)
        throw new Error(`AI generation failed: ${errorMsg}`)
      }
    }

    if (!outputUrl) {
      return res.status(500).json({ 
        error: 'Image generation timed out. Please try again.' 
      })
    }

    console.log('Success! Image URL:', outputUrl)
    return res.status(200).json({ imageUrl: outputUrl })

  } catch (err) {
    console.error('Error in zombify handler:', err.message)
    
    let errorMessage = 'Something went wrong'
    
    if (err.response && err.response.status === 401) {
      errorMessage = 'Invalid Replicate API token. Check your environment variables.'
    } else if (err.response && err.response.status === 402) {
      errorMessage = 'Replicate account needs payment. Check your billing at replicate.com.'
    } else if (err.message) {
      errorMessage = err.message
    }
    
    return res.status(500).json({ 
      error: errorMessage,
      details: err.response ? err.response.data : null
    })
  }
}