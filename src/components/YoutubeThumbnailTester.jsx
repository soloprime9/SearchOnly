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
    <div className="m-5">
      {/* Your full interactive form and layout exactly as you had it */}
      <form
        onSubmit={handleSubmit}
        className="p-2 border-2 rounded-2 w-auto h-auto text-xl"
      >
        {/* image preview, input fields, etc. */}
      </form>

      {/* Other content sections (Why Choose..., How It Works...) */}
    </div>
  );
}
