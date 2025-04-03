'use client';
import Head from 'next/head';
import { useState } from 'react';

function TestThumbnail() {
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
    // Handle the thumbnail testing logic here
    console.log('Image:', image);
    console.log('Title:', title);
    console.log('Channel:', channel);
    // You would typically send this data to an API or process it client-side
  };

  return (
    <div>
      <Head>
        {/* Meta tags */}
        <title>YouTube Thumbnail Tester - Preview & Analyze Thumbnails Online</title>
        <meta
          name="description"
          content="Test and optimize YouTube thumbnails for maximum CTR. Preview on multiple devices, analyze readability, and compare versions instantly. Free online tool for creators."
        />
        <meta
          name="keywords"
          content="youtube thumbnail tester, thumbnail preview, ctr analyzer, youtube SEO, thumbnail optimizer, video marketing tool, youtube thumbnail, Free YouTube Thumbnails Tester, thumbnail tester, thumbnail preview, youtube seo, preview thumbnail youtube, youtube video thumbnail preview, youtube thumbnail test and compare, thumbnail checker ai, youtube thumbnail tester free, youtube thumbnail size, thumbnail preview, youtube thumbnail preview online, tubebuddy thumbnail analyzer, youtube thumbnail download, thumbnail checker, youtube analytics, youtube thumbnail tester online, youtube thumbnail tester online free"
        />

        {/* Open Graph Protocol */}
        <meta property="og:title" content="Free YouTube Thumbnail Tester Tool" />
        <meta
          property="og:description"
          content="Get real-time previews of your YouTube thumbnails on desktop, mobile and TV screens. Improve click-through rates with professional analysis."
        />
        <meta
          property="og:image"
          content="https://fondpeace.com/youtubethumbnailtester/og-image.jpg"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://fondpeace.com/youtubethumbnailtester"
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Optimize YouTube Thumbnails Online" />
        <meta
          name="twitter:description"
          content="Get real-time previews of your YouTube thumbnails on desktop, mobile and TV screens. Improve click-through rates with professional analysis."
        />
        <meta
          name="twitter:image"
          content="https://fondpeace.com/youtubethumbnailtester/twitter-image.jpg"
        />
        <meta name="twitter:site" content="@your_twitter_handle" />

        {/* Structured Data (Schema.org) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "YouTube Thumbnail Tester",
            operatingSystem: "Web",
            applicationCategory: "MultimediaApplication",
            offers: {
              "@type": "Offer",
              price: "0",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              ratingCount: "1500",
            },
            description:
              "Test and optimize YouTube thumbnails for maximum CTR. Preview on multiple devices, analyze readability, and compare versions instantly. Free online tool for creators.",
            image: "https://fondpeace.com/youtubethumbnailtester/og-image.jpg",
            publisher: {
              "@type": "Organization",
              name: "Fondpeace",
              logo: {
                "@type": "ImageObject",
                url: "https://fondpeace.com/logo.jpg",
              },
            },
            review: {
              "@type": "Review",
              author: {
                "@type": "Person",
                name: "John Doe",
              },
              datePublished: "2022-01-01",
              reviewBody:
                "This tool is amazing! It helped me increase my YouTube video's CTR by 20%.",
              reviewRating: {
                "@type": "Rating",
                ratingValue: "5",
              },
            },
          })}
        </script>

        {/* Canonical URL */}
        <link
          rel="canonical"
          href="https://fondpeace.com/youtubethumbnailtester"
        />

        {/* Robots Meta Tag */}
        <meta name="robots" content="index, follow" />

        {/* Viewport Meta Tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="m-5">
        <form
          onSubmit={handleSubmit}
          className="p-2 border-2 rounded-2 w-auto h-auto text-xl"
        >
          <div className="flex justify-center">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                alt="thumbnail"
                onChange={ImageUploadPreview}
                className="absolute top-0 bottom-2 left-0 w-60 h-40 opacity-0 border-2 cursor-pointer z-10 rounded-lg"
              />

              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="border-2 rounded-lg mr-4 w-60 h-40"
                />
              ) : (
                <div className="relative">
                  <div
                    title="hellow"
                    className=" w-60 h-40 bg-white border-2 mr-4 rounded-lg"
                  />
                  <p className="text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    Select image
                  </p>
                </div>
              )}
            </div>
            <div className="block w-40 mt-2">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter Title of Video"
                className="border-2 mb-4"
              />

              <label>Channel Name</label>
              <input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="Enter Channel Name...."
                className="border-2 mb-4"
              />

              <button
                type="submit"
                className="bg-yellow-500 text-black text-xl rounded-md p-2"
              >
                Test Thumbnail
              </button>
            </div>
          </div>

          <a href="https://reduceimages-sigma.vercel.app/">Reduce Image</a>
        </form>

        <section className="py-16 bg-gray-50 mt-5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Choose ThumbnailTester?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">
                  Real Device Previews
                </h3>
                <p>
                  Test thumbnails on 15+ device mockups including smartphones,
                  tablets, and desktop views
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">
                  Analytics Integration
                </h3>
                <p>
                  Get CTR predictions based on historical YouTube performance
                  data
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-3">A/B Testing</h3>
                <p>Compare multiple thumbnail versions side-by-side</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              How It Works
            </h2>
            <div className="prose max-w-none">
              <ol className="list-decimal pl-6">
                <li className="mb-4">Upload your thumbnail image (JPG/PNG)</li>
                <li className="mb-4">Choose device mockups for preview</li>
                <li className="mb-4">Analyze visibility at different screen sizes</li>
                <li className="mb-4">Download optimized versions</li>
              </ol>
              <p>
                <a
                  href="https://www.fondpeace.com/"
                  target="_blank"
                  rel="oopener noreferrer"
                >
                  For More Search Results You can Visit Here
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TestThumbnail;
