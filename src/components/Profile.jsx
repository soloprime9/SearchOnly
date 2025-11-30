'use client';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return localStorage.removeItem("token");
      if (decoded.exp * 1000 < Date.now()) localStorage.removeItem("token");
    } catch (err) {
      localStorage.removeItem("token");
      return (window.location.href = "/login");
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view this profile.");
        return;
      }

      const username = window.location.pathname.split("/").pop();
      const loggedUserId = JSON.parse(atob(token.split('.')[1])).UserId;

      try {
        const result = await axios.get(
          `https://backend-k.vercel.app/user/${username}`,
          { headers: { "x-auth-token": token } }
        );

        const data = result.data.Profile;

        // Proper sort (latest first)
        data.posts = [...data.posts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setProfile(data);
        setIsFollowing(data.user.Followers.includes(loggedUserId));
      } catch (err) {
        setError(err.message || "Unable to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  const handleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login to follow users.");

    const loggedUserId = JSON.parse(atob(token.split('.')[1])).UserId;

    try {
      setLoading(true);
      await axios.post(
        `https://backendk-z915.onrender.com/user/follow/${profile.user._id}`,
        {},
        { headers: { "x-auth-token": token } }
      );

      setIsFollowing(!isFollowing);

      setProfile((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          Followers: isFollowing
            ? prev.user.Followers.filter((id) => id !== loggedUserId)
            : [...prev.user.Followers, loggedUserId],
        },
      }));
    } catch (_) {
      alert("Error following user");
    } finally {
      setLoading(false);
    }
  };

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <h1 className="text-3xl font-bold">{error}</h1>
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );

  const { user, posts, OwnerId } = profile;

  return (
    <div className="min-h-screen bg-[#0e0e0f] text-white">

      {/* FIXED PROFILE HEADER – no more cutting */}
      <div className="relative h-20 bg-[#0e0e0f]">
        <div className="absolute left-1/2 bottom-0 translate-y-1/2 -translate-x-1/2">
          <img
            src={user.profilePicture || "/Fondpeace.jpg"}
            className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>
      </div>

      {/* USER INFO */}
      <div className="mt-20 text-center px-4">
        <h1 className="text-3xl font-bold">{user.username}</h1>
        <p className="text-gray-300 mt-2">{user.bio || "No bio added yet."}</p>

        <div className="mt-4">
          {OwnerId ? (
            <a
              href={`/edit/${user.username}`}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-full font-semibold"
            >
              Edit Profile
            </a>
          ) : (
            <button
              onClick={handleFollow}
              disabled={loading}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                isFollowing
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        <div className="flex justify-center gap-10 mt-6">
          <div>
            <p className="text-xl font-bold">{user.Followers.length}</p>
            <span className="text-gray-400 text-sm">Followers</span>
          </div>
          <div>
            <p className="text-xl font-bold">{user.Followings.length}</p>
            <span className="text-gray-400 text-sm">Following</span>
          </div>
        </div>
      </div>

      {/* POSTS GRID — FIXED GAPS, CLEAN RESPONSIVE */}
      <div className=" md:px-2 lg:px-4 mt-10 pb-10">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 ">

          {posts.length > 0 ? (
            posts.map((post) => (
              <a
                key={post._id}
                href={
                  post.media.endsWith(".mp4")
                    ? `/short/${post._id}`
                    : `/post/${post._id}`
                }
                className="group block rounded- overflow-hidden bg-black/20 border border-white/10"
              >
                {post.media.endsWith(".mp4") ? (
                  <video
                    src={post.media}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-40 md:h-52 object-cover"
                  />
                ) : (
                  <img
                    src={post.media}
                    className="w-full h-40 md:h-52 object-cover"
                  />
                )}
              </a>
            ))
          ) : (
            <p className="text-gray-400">No posts yet.</p>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;











// 'use client';
// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import jwt from 'jsonwebtoken';

// const Profile = () => {
//   const [profile, setProfile] = useState(null);
//   const [error, setError] = useState(null);
//   const [isFollowing, setIsFollowing] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [iOwner, setIsOwner] = useState(false);


//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     console.log(token);

//     if (!token) {
//       console.log("Token is not available");
//       // return (window.location.href = "/login");
//     }

//     try {
//       const decoded = jwt.decode(token);
//       console.log("Decoded token data:", decoded);
//       if(!decoded || !decoded.exp){
//         console.log("Token or Exp Missing");
//         localStorage.removeItem("token");
//         // window.location.href = "/login";
//       }  
//       if(decoded.exp * 1000 < Date.now()){
//         console.log("Now Going to Redirect on Login Page");
//         localStorage.removeItem("token");
//         // window.location.href="/login";
//       }
//     } catch (err) {
//       console.log("Invalid Token:", err);
//       localStorage.removeItem("token");
//       // return (window.location.href = "/login");
//     }
//   }, []);
  

  

//   useEffect(() => {
//     const fetchProfile = async () => {
//       const path = window.location.pathname;
//       const username = path.split('/').pop();
//       const token = localStorage.getItem('token');

//       if (!token) {
//         console.log("Token is required");
//         setError("You must be logged in to view this profile.");
//         return;
//       }
//       console.log("Token: ", token);
//       const loggedUserId = JSON.parse(atob(token.split('.')[1])).UserId;
//       console.log("userId: ", loggedUserId);

//       try {
//         const result = await axios.get(`https://backend-k.vercel.app/user/${username}`, {
//           headers: {
//             'x-auth-token': token,
//           },
//         });

//         setProfile(result.data.Profile);
//         console.log(result.data.Profile);

//         const loggedUserId = JSON.parse(atob(token.split('.')[1])).UserId;
//         setIsFollowing(result.data.Profile.user.Followers.includes(loggedUserId));
//         setIsOwner(result.data.Profile.user._id.toString() === loggedUserId);
//       } catch (err) {
//         setError(err.message || "Unable to fetch profile");
//         console.log(err);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const handleFollow = async () => {
//     const token = localStorage.getItem('token');
//     const loggedUserId = JSON.parse(atob(token.split('.')[1])).UserId;

//     if (!token) {
//       alert('You must be logged in to follow users!');
//       return;
//     }

//     try {
//       setLoading(true);
//       const result = await axios.post(
//         `https://backendk-z915.onrender.com/user/follow/${profile.user._id}`,
//         {},
//         {
//           headers: {
//             'x-auth-token': token,
//           },
//         }
//       );

//       setIsFollowing(!isFollowing);
//       setProfile((prevProfile) => ({
//         ...prevProfile,
//         user: {
//           ...prevProfile.user,
//           Followers: isFollowing
//             ? prevProfile.user.Followers.filter((id) => id !== loggedUserId)
//             : [...prevProfile.user.Followers, loggedUserId],
//         },
//       }));
      
//     } catch (err) {
//       console.error(err);
//       alert('Error following the user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (error) {
//     return (
      
//       <div className="flex justify-center items-center h-screen">
//         <h1 className="text-3xl font-bold">{error}</h1>
//       </div>
//     );
//   }

//   if (!profile) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <h1 className="text-3xl font-bold">Loading...</h1>
//       </div>
//     );
//   }

//   const { user, posts, OwnerId } = profile;
 
//   return (
//     <div>

//     <div>
//             <img src="/1.jpg" alt="" className='w-full h-20' />
//           </div>

//     <div className=" mx-auto md:p-2 mt-2">
//       <div className="md:flex grid justify-center  mb-4 sm:p-8">
//         <div className="md:flex grid items-center md:mr-6 md:mt-2">

          
//           <img
//             src={user.profilePicture || "/1.jpg"}
//             alt="Profile"
//             className="w-12 h-12 rounded-full mr-4"
//           />
//           <h1 className="text-2xl font-bold">{user.username}</h1>
//         </div>

//         <div className="md:flex  items-center mr-2">
//           <span className="text-md font-bold mr-4">{user.Followers.length} Followers</span>
//           <span className="text-md font-bold mr-4">{user.Followings.length} Following</span>
//           {OwnerId ? (
//             <button className="px-4 py-2 rounded bg-green-500 text-white">
//               <a href={`/edit/${user.username}`}>Edit Profile</a>
//             </button>
//           ) : (
//             <button
//               onClick={handleFollow}
//               className={`px-4 py-2 rounded text-white text-sm ${isFollowing ? 'bg-red-500' : 'bg-blue-500'}`}
//               disabled={loading}
//             >
//               {loading ? 'Processing..' : isFollowing ? 'Unfollow' : 'Follow'}
//             </button>
//           )}
//         </div>
//       </div>

//       <div className="flex justify-center font-bold md:p-2">{user.bio || "Add about you"}</div>

//       <div className="grid md:grid-cols-4 grid-cols-3 ">
//         {posts && posts.length > 0 ? (
//           posts.map((post, index) => (
//             <div key={index} className="rounded shadow-md">
//               {post.media.endsWith('.mp4') ? ( 
                
//                 <video
//                   src={ post.media}
//                   autoPlay
//                   controls={false}
//                   muted
//                   className="w-full md:h-64 h-44 object-cover border-2 border-white rounded-sm"
//                 />
              
//               ) : (
//                 <img
//                   src={ post.media}
//                   alt="Post"
//                   className="md:w-full w-40 md:h-64 h-44 object-cover border-2 border-white rounded-sm"
//                 />

//               )} 



//             </div>
//           ))
//         ) : (
//           <p className="text-lg font-bold">No posts yet.</p>
//         )}
//       </div>
//     </div>
//         </div>
//   );
// };

// export default Profile;




