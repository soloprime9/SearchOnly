"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "@/Introcomponents/Footer";

export default function SubmitProductForm() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [tags, setTags] = useState("");

  const [location, setLocation] = useState({ city: "", country: "" });

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [appStoreLink, setAppStoreLink] = useState("");
  const [playStoreLink, setPlayStoreLink] = useState("");
  const [chromeExtension, setChromeExtension] = useState("");

  const [social, setSocial] = useState({
    twitter: "",
    facebook: "",
    linkedin: "",
    youtube: "",
    instagram: "",
    discord: "",
    github: ""
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [videoUrl, setVideoUrl] = useState("");

  const [launchDate, setLaunchDate] = useState("");
  const [launchStatus, setLaunchStatus] = useState("live");
  const [progress, setProgress] = useState(0);

  const [token, setToken] = useState(null);

  const router = useRouter();
  const API_BASE = "https://list-back-nine.vercel.app";

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) router.push("/login");
    else setToken(t);
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE}/categories/all`)
      .then((res) => setCategories(res.data.categories))
      .catch(console.error);
  }, []);

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);

    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("No token!");

    const fd = new FormData();

    fd.append("title", title);
    fd.append("description", description);
    fd.append("longDescription", longDescription);

    if (tags)
      fd.append(
        "tags",
        JSON.stringify(tags.split(",").map((t) => ({ name: t.trim() })))
      );

    fd.append("videoUrl", videoUrl);

    fd.append("websiteUrl", websiteUrl);
    fd.append("appStoreLink", appStoreLink);
    fd.append("playStoreLink", playStoreLink);
    fd.append("chromeExtension", chromeExtension);

    fd.append("social", JSON.stringify(social));
    fd.append("launchDate", launchDate);
    fd.append("launchStatus", launchStatus);

    if (location.city || location.country)
      fd.append("location", JSON.stringify(location));

    if (selectedCategory) fd.append("categoryId", selectedCategory);
    if (newCategory) fd.append("newCategory", newCategory);

    if (thumbnail) fd.append("thumbnail", thumbnail);

    const res = await axios.post(`${API_BASE}/create`, fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (ev) => {
        const percent = Math.round((ev.loaded * 100) / ev.total);
        setProgress(percent);
      }
    });

    alert("Product Created!");
    // router.push(`/product/${res.data.product.slug}`);
  };

  return (
    <div>

      {/* ===== HEADER ===== */}
       <header className="w-full top-0 left-0 pb-2 z-50 bg-white shadow-md">
  <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-4 flex items-center justify-between h-6">
    
    <h1 className="font-extrabold px-2 text-blue-600 text-lg sm:text-xl md:text-2xl">
      <Link href="/IntroList" className="hover:text-blue-700 transition-colors duration-300">
        IntroList
      </Link>
    </h1>

  </div>
</header>

    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-6">Submit Product</h1>

      {progress > 0 && (
        <div className="w-full bg-gray-300 rounded-full h-3 mb-4">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <input
          type="text"
          placeholder="Product title"
          className="w-full border p-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Description */}
        <textarea
          className="w-full border p-2"
          placeholder="Short Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Long Description */}
        <textarea
          className="w-full border p-2"
          placeholder="Long detailed description"
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
        />

        {/* Category */}
        <select
          className="w-full border p-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">
            -- Select Category --
          </option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Or create new category"
          className="w-full border p-2"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        {/* Tags */}
        <input
          className="w-full border p-2"
          value={tags}
          placeholder="Tags (comma)"
          onChange={(e) => setTags(e.target.value)}
        />

        {/* Thumbnail */}
        <div>
          <label>Thumbnail</label>
          <input type="file" accept="image/*" onChange={handleThumbnail} required />

          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              className="w-full max-h-64 object-cover mt-3 rounded-lg"
            />
          )}
        </div>

        {/* Links */}
        <input
          className="w-full border p-2"
          placeholder="Website"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Play Store"
          value={playStoreLink}
          onChange={(e) => setPlayStoreLink(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="App Store"
          value={appStoreLink}
          onChange={(e) => setAppStoreLink(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Chrome Extension"
          value={chromeExtension}
          onChange={(e) => setChromeExtension(e.target.value)}
        />

        {/* Social */}
        {Object.keys(social).map((key) => (
          <input
            key={key}
            className="w-full border p-2"
            placeholder={key}
            value={social[key]}
            onChange={(e) =>
              setSocial({ ...social, [key]: e.target.value })
            }
          />
        ))}

        {/* Location */}
        <input
          className="w-full border p-2"
          placeholder="City"
          value={location.city}
          onChange={(e) => setLocation({ ...location, city: e.target.value })}
        />

        <input
          className="w-full border p-2"
          placeholder="Country"
          value={location.country}
          onChange={(e) =>
            setLocation({ ...location, country: e.target.value })
          }
        />

        <input
          type="date"
          className="w-full border p-2"
          value={launchDate}
          onChange={(e) => setLaunchDate(e.target.value)}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Submit Product
        </button>
      </form>
    </div>

      <Footer />
    </div>
  );
}
