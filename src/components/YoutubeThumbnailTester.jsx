'use client';
import { useState } from 'react';
 
export default function TestThumbnail() {
  const [image, setImage] = useState('');
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('');

  const ImageUploadPreview = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage('');
      setPreview(null);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Image:', image);
    console.log('Title:', title);
    console.log('Channel:', channel);
  };

  return (
     <main className="m-5">
        <header className="bg-white shadow-sm">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <h1>
                  <a href="/" className="text-2xl font-bold text-red-600">
                    YouTube Thumbnail Tester
                  </a>
                </h1>
              </div>
              <div className="hidden md:flex space-x-8">
                <a href="/features" className="text-gray-700 hover:text-red-600">Features</a>
                <a href="/blog" className="text-gray-700 hover:text-red-600">Blog</a>
                <a href="/tools" className="text-gray-700 hover:text-red-600">Tools</a>
                <a href="/contact" className="text-gray-700 hover:text-red-600">Contact</a>
              </div>
            </div>
          </nav>
        </header>

        {/* Thumbnail Upload Form */}
        <section>
          <form onSubmit={handleSubmit} className="p-4 border rounded-lg mt-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={ImageUploadPreview}
                  className="absolute w-60 h-40 opacity-0 cursor-pointer z-10"
                />
                {preview ? (
                  <img src={preview} alt="Thumbnail Preview" className="w-60 h-40 border rounded" />
                ) : (
                  <div className="w-60 h-40 bg-white border flex items-center justify-center rounded">
                    <p>Select Image</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <label>
                  Title
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Video Title"
                    className="w-full border p-2 rounded"
                  />
                </label>
                <label>
                  Channel Name
                  <input
                    type="text"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    placeholder="Enter Channel Name"
                    className="w-full border p-2 rounded"
                  />
                </label>
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded">
                  Test Thumbnail
                </button>
                <a href="https://reduceimages-sigma.vercel.app/" className="text-blue-600 hover:underline">
                  Reduce Image Size
                </a>
              </div>
            </div>
          </form>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6">Why Use Our YouTube Thumbnail Tester?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">Real Device Previews</h3>
                <p>Test thumbnails on desktop, mobile, tablets, and smart TVs.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">CTR Predictions</h3>
                <p>Use our analytics-based predictions to choose winning thumbnails.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">A/B Comparison</h3>
                <p>Compare multiple thumbnails to see which one performs better.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-6">How to Use</h2>
            <ol className="list-decimal pl-6 space-y-3">
              <li>Upload a thumbnail image (JPG/PNG).</li>
              <li>Preview how it appears on mobile, desktop, and TV.</li>
              <li>Test different versions for CTR comparison.</li>
              <li>Download the optimized thumbnail if needed.</li>
            </ol>
            <p className="mt-4">
              <a href="https://fondpeace.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Visit Fondpeace for more tools & resources.
              </a>
            </p>
          </div>
        </section>
      </main>
  );
}
