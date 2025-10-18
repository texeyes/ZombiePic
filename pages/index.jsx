import { useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [style, setStyle] = useState('classic')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setResult(null)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a photo first')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('photo', selectedFile)
      formData.append('style', style)

      const response = await axios.post('/api/zombify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000
      })

      setResult(response.data.imageUrl)

    } catch (err) {
      console.error('Upload error:', err)
      
      let errorMessage = 'Something went wrong. Please try again.'
      
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The image might be too large.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setStyle('classic')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-green-500 mb-4">
            ZombiePic.com
          </h1>
          <p className="text-xl text-gray-400">
            Turn yourself undead — AI-powered. Share for Halloween!
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 shadow-2xl">
          
          {!result ? (
            <div>
              <div className="mb-6">
                <label className="block mb-4 text-center">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 cursor-pointer hover:border-green-500 transition">
                    {preview ? (
                      <div>
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="max-h-64 mx-auto rounded mb-4"
                        />
                        <p className="text-gray-400">Click to change photo</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xl mb-2">Upload a selfie</p>
                        <p className="text-gray-400 text-sm">Click or tap to select a photo</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-lg mb-3 text-center">Choose Your Zombie Style</label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setStyle('classic')}
                    className={`p-4 rounded-lg border-2 transition ${
                      style === 'classic' 
                        ? 'border-green-500 bg-green-900' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-3xl mb-2">🧟</div>
                    <div className="font-semibold">Classic</div>
                    <div className="text-xs text-gray-400">Horror movie style</div>
                  </button>
                  
                  <button
                    onClick={() => setStyle('cartoon')}
                    className={`p-4 rounded-lg border-2 transition ${
                      style === 'cartoon' 
                        ? 'border-green-500 bg-green-900' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-3xl mb-2">🎃</div>
                    <div className="font-semibold">Cartoon</div>
                    <div className="text-xs text-gray-400">Fun & playful</div>
                  </button>
                  
                  <button
                    onClick={() => setStyle('survivor')}
                    className={`p-4 rounded-lg border-2 transition ${
                      style === 'survivor' 
                        ? 'border-green-500 bg-green-900' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-3xl mb-2">💀</div>
                    <div className="font-semibold">Survivor</div>
                    <div className="text-xs text-gray-400">Post-apocalyptic</div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedFile || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition text-lg"
                >
                  {loading ? 'Creating Your Zombie...' : 'Zombify Me'}
                </button>
                
                <button
                  onClick={() => alert('Challenge feature coming soon!')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition text-lg"
                >
                  Challenge a Friend
                </button>
              </div>

              {loading && (
                <div className="mt-6 text-center">
                  <div className="animate-pulse text-green-500 mb-2">
                    <div className="text-4xl mb-4">🧟‍♂️</div>
                    Processing your undead portrait... Please wait
                  </div>
                  <p className="text-sm text-gray-500">This may take 30-60 seconds</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-green-500 mb-6">
                Your Zombie Transformation!
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Original</p>
                  <img 
                    src={preview} 
                    alt="Original" 
                    className="w-full rounded-lg"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Zombified</p>
                  <img 
                    src={result} 
                    alt="Zombie result" 
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <a
                  href={result}
                  download="my-zombie-pic.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Download
                </a>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Made for Halloween — images are ephemeral and deleted after 24h.</p>
        </div>
      </div>
    </div>
  )
}