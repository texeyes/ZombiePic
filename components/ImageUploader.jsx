import { useState } from 'react'
import axios from 'axios'

export default function ImageUploader({ onResult, onProcessing }) {
  const [file, setFile] = useState(null)
  const [style, setStyle] = useState('classic')

  async function handleSubmit(e){
    e.preventDefault()
    if(!file) return alert('Please pick a photo')
    onProcessing(true)

    const fd = new FormData()
    fd.append('photo', file)
    fd.append('style', style)

    try{
      const res = await axios.post('/api/zombify', fd, { headers: {'Content-Type': 'multipart/form-data'} })
      const { imageUrl } = res.data
      onResult(imageUrl)
    }catch(err){
      console.error(err)
      alert('Something went wrong. Check console.')
    }finally{
      onProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg">
      <label className="block text-sm mb-2">Upload a selfie</label>
      <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0])} className="mb-4" />

      <label className="block text-sm mb-2">Zombie Style</label>
      <select value={style} onChange={(e)=>setStyle(e.target.value)} className="mb-4 w-full p-2 rounded bg-gray-700">
        <option value="classic">Classic Undead</option>
        <option value="cartoon">Cartoon Zombie</option>
        <option value="survivor">Apocalypse Survivor</option>
      </select>

      <div className="flex gap-3">
        <button className="px-4 py-2 bg-green-600 rounded" type="submit">Zombify Me</button>
        <button type="button" className="px-4 py-2 border rounded" onClick={()=>alert('Pro tip: tag a friend and challenge them!')}>Challenge a Friend</button>
      </div>
    </form>
  )
}
