// src/components/ReelsFeedWrapper.jsx
'use client'; // यह महत्वपूर्ण है!

import dynamic from "next/dynamic";
import React from 'react';

// ReelsFeed को केवल Client Side पर लोड करें (SSR को रोकें)
const ReelsFeed = dynamic(() => import("./ReelsFeed"), { 
    ssr: false 
});

export default function ReelsFeedWrapper(props) {
    // ReelsFeed को केवल क्लाइंट पर रेंडर किया जाएगा
    return <ReelsFeed {...props} />;
}
