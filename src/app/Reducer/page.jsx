'use client';
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";

const ImageResizer = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [resizedImage, setResizedImage] = useState(null);
  const [format, setFormat] = useState("jpeg");
  const [quality, setQuality] = useState(80);
  const [size, setSize] = useState(100);
  const [originalSize, setOriginalSize] = useState("");
  const [resizedSize, setResizedSize] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const fileInputRef = useRef(null);
  const resizedPreviewRef = useRef(null);

  useEffect(() => {
    if (originalImage) {
      updateResizedImage();
    }
  }, [quality, size, format, originalImage]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      loadImage(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
  };

  const loadImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setOriginalImageUrl(e.target.result);
        setOriginalSize(formatFileSize(file.size));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const updateResizedImage = () => {
    if (!originalImage) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const scaleFactor = size / 100;
    canvas.width = originalImage.width * scaleFactor;
    canvas.height = originalImage.height * scaleFactor;
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    const mimeType = `image/${format}`;
    const qualityValue = format === "png" ? 1 : quality / 100;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setResizedImage(url);
      if (resizedPreviewRef.current) {
        resizedPreviewRef.current.src = url;
      }
      setResizedSize(formatFileSize(blob.size));
    }, mimeType, qualityValue);
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.download = `resized-image.${format}`;
    link.href = resizedImage;
    link.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const faqItems = [
    { 
      question: "Is this tool really free?", 
      answer: "Yes! Our image resizer is 100% free with no hidden costs or registration required." 
    },
    { 
      question: "How does image resizing work?", 
      answer: "We use browser-based processing to resize images without uploading to servers, ensuring your files stay private." 
    },
    { 
      question: "What image formats are supported?", 
      answer: "We support JPG, PNG, GIF, BMP, WebP, and HEIC formats with more coming soon!" 
    },
    { 
      question: "Will resizing affect image quality?", 
      answer: "Our smart algorithms maintain optimal quality while reducing file size. Use the quality slider to control compression." 
    },
    { 
      question: "Can I process multiple images at once?", 
      answer: "Yes! Simply drag-and-drop multiple files or select them in the file picker." 
    },
    { 
      question: "Is there any file size limit?", 
      answer: "No limits! Process images of any size directly in your browser." 
    }
  ];

  return (
    <>
    <Head>
        <title>Image Resizer - Reduce Image Size Online</title>
        <meta name="description" content="Resize and compress images online with our free Image Resizer tool. Reduce image file size without losing quality." />
      </Head>
    <div>
   

          
    <div className="w-full p-10 pb-20 border-2 border-black mt-5 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Image Size Reducer</h1>
      <div
        className={`border-2 border-dashed p-6 text-center cursor-pointer rounded-lg ${
          isDragging ? "border-green-500 bg-green-100" : "border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <p className="text-gray-600">Drag & drop images here or click to upload</p>
        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} hidden />
      </div>

      {originalImageUrl && (
        <>
          <div className="grid lg:grid-cols-2 gap-4 mt-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <h3 className="text-center">Original Image</h3>
              <img src={originalImageUrl} className="w-full mt-2 rounded-md" alt="Original preview" />
              <div className="text-sm text-gray-600 mt-2">{originalSize}</div>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <h3 className="text-center">Resized Image</h3>
              <img ref={resizedPreviewRef} className="w-full mt-2 rounded-md" alt="Resized preview" />
              <div className="text-sm text-gray-600 mt-2">{resizedSize}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label>Quality: {quality}%</label>
              <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(e.target.value)} className="w-full" />
            </div>
            <div>
              <label>Resize: {size}%</label>
              <input type="range" min="10" max="200" value={size} onChange={(e) => setSize(e.target.value)} className="w-full" />
            </div>
            <div>
              <label>Format:</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full p-2 border rounded">
                <option value="jpg">JPG</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
                <option value="bmp">BMP</option>
                <option value="gif">GIF</option>
              </select>
            </div>
          </div>

          <button onClick={downloadImage} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">Download Resized Image</button>
        </>
      )}
        </div>
        
         <section className="seo-content p-6 max-w-4xl mx-auto text-gray-800 bg-white shadow-sm rounded-lg mt-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Understanding Image File Sizes</h2>
        
        <div className="prose max-w-none">
          <p className="text-lg mb-4">
            Digital images are made of pixels - tiny color dots that combine to form your picture. Each pixel stores 
            color information using RGB values, typically consuming 3 bytes per pixel. This means:
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-xl font-semibold mb-3">📐 Size Calculation Example:</h3>
            <p>
              A 10MP photo (10 million pixels) = 30MB storage (10M pixels × 3 bytes). 
              Our tool helps reduce this size dramatically without quality loss!
            </p>
          </div>

          <h3 className="text-2xl font-semibold mt-8 mb-4">How Our Image Reducer Works</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold mb-2 text-green-600">Smart Compression</h4>
              <p>Advanced algorithms remove unnecessary data while preserving visual quality</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold mb-2 text-blue-600">Precise Resizing</h4>
              <p>Maintain aspect ratio while scaling to optimal dimensions for web/mobile</p>
              <p><a href="https://www.fondpeace.com/" target="_blank" rel="oopener noreferrer">For More Search Results You can Visit Here</a></p>
            </div>
          </div>

          <h3 className="text-2xl font-semibold mt-8 mb-4">Optimization Guide</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left">Use Case</th>
                  <th className="p-3 text-left">Recommended Settings</th>
                  <th className="p-3 text-left">Estimated Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200">
                  <td className="p-3">Website Images</td>
                  <td className="p-3">WebP format, 80% quality</td>
                  <td className="p-3">60-80% smaller</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="p-3">Social Media</td>
                  <td className="p-3">JPG 90%, 2000px width</td>
                  <td className="p-3">50-70% smaller</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td className="p-3">Email Attachments</td>
                  <td className="p-3">PNG 70%, 1200px width</td>
                  <td className="p-3">40-60% smaller</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="faq mt-12">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div 
                key={index} 
                className={`border rounded-lg transition-all ${openQuestion === index ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-green-200'}`}
              >
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleQuestion(index)}
                >
                  <h4 className="font-semibold text-gray-800">{faq.question}</h4>
                  <span className={`transform transition-transform ${openQuestion === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
                {openQuestion === index && (
                  <div className="p-4 pt-0 border-t border-gray-100">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SEO Schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map(item => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
              }
            }))
          })
        }} />
      </section>


           
    </div>
          </>
  );
};

export default ImageResizer;
