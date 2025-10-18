import { useState } from 'react'
import ImageUploader from '../components/ImageUploader'

export default function Home() {
  const [resultUrl, setResultUrl] = useState(null)
  const [processing, setProcessing] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <header className="text-center mb-8">
        <h1 className="text-4xl header-logo">ZombiePic.com</h1>
        <p className="mt-2 text-gray-300">Turn yourself undead — AI-powered. Share for Halloween!</p>
      </header>

      <main className="w-full max-w-2xl">
        <ImageUploader onResult={(url)=>setResultUrl(url)} onProcessing={(v)=>setProcessing(v)} />

        {processing && (
          <div className="mt-6 p-4 bg-gray-900 rounded-lg text-center">Processing your undead portrait... Please wait</div>
        )}

        {resultUrl && (
          <div className="mt-6 bg-gray-900 p-4 rounded-lg text-center">
            <img src={resultUrl} alt="zombie result" className="mx-auto max-h-96" />
            <div className="mt-3 flex items-center justify-center gap-3">
              <a className="px-4 py-2 bg-green-600 rounded" href={resultUrl} download>Download</a>
              <button className="px-4 py-2 border rounded" onClick={()=>{
                if(navigator.share){
                  navigator.share({title:'My ZombiePic', url: resultUrl}).catch(()=>{})
                } else {
                  // fallback: copy to clipboard
                  navigator.clipboard && navigator.clipboard.writeText(resultUrl).then(()=>alert('Link copied to clipboard'))
                }
              }}>Share</button>
            </div>
            <div className="mt-2 watermark">ZombiePic.com • #MyZombieSelf</div>
          </div>
        )}

        <footer className="mt-8 text-center text-sm text-gray-400">Made for Halloween — images are ephemeral and deleted after 24h.</footer>
      </main>
    </div>
  )
}
