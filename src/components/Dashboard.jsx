"use client";

import {
  useEffect,
  useState,
} from "react";

export default function Dashboard() {

  const [stats, setStats] =
    useState(null);

  useEffect(() => {

    fetch(
      "https://backend-k.vercel.app/api/pwa/stats"
    )
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      });

  }, []);

  if (!stats)
    return (
      <div className="p-10">
        Loading...
      </div>
    );

  return (

    <div className="p-6 max-w-7xl mx-auto">

      <h1 className="text-4xl font-bold mb-8">
        PWA Analytics Dashboard
      </h1>



      {/* CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <Card
          title="Total Installs"
          value={stats.totalInstalls}
        />

        <Card
          title="Today Installs"
          value={stats.todayInstalls}
        />

        <Card
          title="Popup Views"
          value={stats.popupShown}
        />

        <Card
          title="Install Clicks"
          value={stats.installClicks}
        />

        <Card
          title="Active Users"
          value={stats.activeUsers}
        />

        <Card
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
        />

        <Card
          title="Total Events"
          value={stats.totalEvents}
        />

      </div>




      {/* TOP DEVICES */}

      <div className="mt-10 bg-white p-5 rounded-2xl shadow">

        <h2 className="text-2xl font-bold mb-4">
          Top Devices
        </h2>

        {stats.topDevices.map(
          (item) => (

            <div
              key={item._id}
              className="flex justify-between border-b py-2"
            >

              <span>
                {item._id}
              </span>

              <span>
                {item.count}
              </span>

            </div>
          )
        )}

      </div>




      {/* TOP OS */}

      <div className="mt-10 bg-white p-5 rounded-2xl shadow">

        <h2 className="text-2xl font-bold mb-4">
          Top Operating Systems
        </h2>

        {stats.topOS.map(
          (item) => (

            <div
              key={item._id}
              className="flex justify-between border-b py-2"
            >

              <span className="truncate">
                {item._id}
              </span>

              <span>
                {item.count}
              </span>

            </div>
          )
        )}

      </div>




      {/* RECENT INSTALLS */}

      <div className="mt-10 bg-white p-5 rounded-2xl shadow overflow-auto">

        <h2 className="text-2xl font-bold mb-4">
          Recent Installs
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-2">
                Device
              </th>

              <th className="text-left py-2">
                OS
              </th>

              <th className="text-left py-2">
                Browser
              </th>

              <th className="text-left py-2">
                Time
              </th>

            </tr>

          </thead>

          <tbody>

            {stats.recentInstalls.map(
              (item) => (

                <tr
                  key={item._id}
                  className="border-b"
                >

                  <td className="py-3">
                    {item.device}
                  </td>

                  <td className="py-3 truncate max-w-[200px]">
                    {item.os}
                  </td>

                  <td className="py-3 truncate max-w-[300px]">
                    {item.browser}
                  </td>

                  <td className="py-3">
                    {
                      new Date(
                        item.createdAt
                      ).toLocaleString()
                    }
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}



function Card({
  title,
  value,
}) {

  return (

    <div className="bg-white shadow rounded-2xl p-5">

      <p className="text-gray-500">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>

    </div>
  );
}
