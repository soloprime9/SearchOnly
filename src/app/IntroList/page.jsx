"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SubmitProductForm() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");

  const [tags, setTags] = useState("");
  const [plans, setPlans] = useState([]);

  const [location, setLocation] = useState({ city: "", country: "" });
  const [videoUrl, setVideoUrl] = useState("");

  const [thumbnail, setThumbnail] = useState(null);
  const [gallery, setGallery] = useState(null);

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [appStoreLink, setAppStoreLink] = useState("");
  const [playStoreLink, setPlayStoreLink] = useState("");
  const [chromeExtension, setChromeExtension] = useState("");

  const [social, setSocial] = useState({ twitter: "", github: "", linkedin: "" });

  const [launchDate, setLaunchDate] = useState("");
  const [launchStatus, setLaunchStatus] = useState("live");

  const [token, setToken] = useState(null);

  const router = useRouter();
  const API_BASE = "https://backend-k.vercel.app/product";

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) router.push("/login");
    else setToken(t);
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE}/categories/all`)
      .then(res => setCategories(res.data.categories))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert("No token!");

    const fd = new FormData();

    fd.append("title", title);
    fd.append("description", description);
    fd.append("longDescription", longDescription);

    if (tags)
      fd.append("tags", JSON.stringify(tags.split(",").map(t => ({ name: t.trim() }))));

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
    if (gallery) fd.append("gallery", gallery);

    const res = await axios.post(`${API_BASE}/create`, fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    });

    alert("Product Created!");
    // router.push(`/product/${res.data.product.slug}`);

  };

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-6">Submit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Title */}
        <div>
          <label className="block font-semibold">Product Title</label>
          <input type="text" className="w-full border p-2" 
            value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold">Short Description</label>
          <textarea className="w-full border p-2"
            value={description} onChange={e => setDescription(e.target.value)} required />
        </div>

        {/* Long Description */}
        <div>
          <label className="block font-semibold">Long Description</label>
          <textarea className="w-full border p-2"
            value={longDescription} onChange={e => setLongDescription(e.target.value)} />
        </div>

        {/* Category */}
        <div>
          <label className="block font-semibold">Category</label>
          <select className="w-full border p-2"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}>
            <option value="">-- Select Category --</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <input
            type="text"
            className="w-full border p-2 mt-2"
            placeholder="Or create new category"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block font-semibold">Tags (comma separated)</label>
          <input className="w-full border p-2"
            value={tags} onChange={e => setTags(e.target.value)} />
        </div>

        {/* Video URL */}
        <div>
          <label className="block font-semibold">Video URL</label>
          <input className="w-full border p-2"
            value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block font-semibold">Thumbnail Image</label>
          <input type="file" accept="image/*"
            onChange={e => setThumbnail(e.target.files[0])} />
        </div>

        {/* Gallery */}
        <div>
          <label className="block font-semibold">Gallery Image</label>
          <input type="file" accept="image/*"
            onChange={e => setGallery(e.target.files[0])} />
        </div>

        {/* Website URLs */}
        <div>
          <label className="block font-semibold">Website URL</label>
          <input className="w-full border p-2"
            value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} />
        </div>

        {/* Location */}
        <div>
          <label className="block font-semibold">Location</label>
          <input className="w-full border p-2 mb-2"
            placeholder="City"
            value={location.city}
            onChange={(e) => setLocation({ ...location, city: e.target.value })} />

          <input className="w-full border p-2"
            placeholder="Country"
            value={location.country}
            onChange={(e) => setLocation({ ...location, country: e.target.value })} />
        </div>

        {/* Launch Date */}
        <div>
          <label className="block font-semibold">Launch Date</label>
          <input type="date" className="w-full border p-2"
            value={launchDate} onChange={e => setLaunchDate(e.target.value)} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Submit Product
        </button>

      </form>
    </div>
  );
}
