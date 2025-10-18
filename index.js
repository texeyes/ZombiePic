import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    const res = await axios.post('/api/zombify', formData);
    setImage(res.data.image);
    setLoading(false);
  };

  return (
    <main style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '2rem' }}>
      <h1>🧟‍♂️ ZombiePic</h1>
      <p>Upload a photo and watch AI zombify it!</p>
      <input type="file" onChange={handleUpload} accept="image/*" />
      {loading && <p>Converting to zombie...</p>}
      {image && <img src={image} alt="Zombie" style={{ width: '300px', marginTop: '1rem' }} />}
    </main>
  );
}