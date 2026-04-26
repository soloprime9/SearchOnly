import React from 'react';

const DosaBlog = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-orange-500 py-12 px-6 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            डोसा और मसाला डोसा: एक परफेक्ट गाइड
          </h1>
          <div className="h-1 w-24 bg-white mx-auto rounded-full opacity-75"></div>
        </div>

        <div className="p-6 md:p-12 space-y-8 text-gray-800">
          
          {/* Introduction */}
          <section>
            <p className="text-lg md:text-xl leading-relaxed text-gray-600 italic border-l-4 border-orange-400 pl-4">
              डोसा भारतीय खाना पकाने की दुनिया में एक बेहद लोकप्रिय व्यंजन है, खासकर दक्षिण भारत में। यह एक पतला, कुरकुरा पैनकेक होता है जो चावल और उड़द की दाल के घोल से बनता है। वहीं मसाला डोसा डोसे का एक स्वादिष्ट संस्करण है, जिसमें मसालेदार आलू की भरावन होती है। इस ब्लॉग में हम डोसा और मसाला डोसा के बारे में विस्तार से जानेंगे, इन्हें बनाने की विधि, और किन गलतियों से बचना चाहिए ताकि आपका डोसा परफेक्ट बन सके।
            </p>
          </section>

          {/* Definitions */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
              <h2 className="text-2xl font-bold text-orange-700 mb-3">डोसा क्या है?</h2>
              <p className="leading-relaxed">
                डोसा एक फर्मेंटेड बैटर से बनाया जाता है, जिसमें चावल और उड़द की दाल होती है। इसे तवे पर पतला फैलाकर दोनों तरफ से सुनहरा और कुरकुरा बनाया जाता है। डोसे का स्वाद नींबू जैसा खट्टा और हल्का मीठा होता है क्योंकि बैटर को फर्मेंट किया जाता है। यह आमतौर पर नारियल की चटनी और सांभर के साथ परोसा जाता है।
              </p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100">
              <h2 className="text-2xl font-bold text-yellow-700 mb-3">मसाला डोसा क्या है?</h2>
              <p className="leading-relaxed">
                मसाला डोसा डोसे का एक प्रकार है जिसमें आलू की मसालेदार भरावन डोसे के अंदर भरी जाती है। आलू का मिश्रण सरसों के बीज, हल्दी, हरी मिर्च, करी पत्ते और प्याज के साथ पकाया जाता है, जिससे इसे एक ज़ायकेदार और सजीव स्वाद मिलता है। मसाला डोसा खाने में अधिक फुल और स्वादिष्ट होता है।
              </p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Recipes Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center underline decoration-orange-500 underline-offset-8">
              डोसा और मसाला डोसा बनाने की विधि
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-orange-600 mb-4 flex items-center">
                    <span className="mr-2">🥣</span> डोसा बैटर के लिए सामग्री:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>1 कप चावल (इडली या परबॉयल्ड चावल)</li>
                    <li>1/3 कप उड़द की दाल</li>
                    <li>1/2 छोटा चम्मच मेथी के बीज</li>
                    <li>स्वादानुसार नमक</li>
                    <li>पानी आवश्यकतानुसार</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-orange-600 mb-4 flex items-center">
                    <span className="mr-2">🥔</span> मसाला भरावन के लिए सामग्री:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>3-4 उबले और मैश किए हुए आलू</li>
                    <li>1 टेबलस्पून तेल</li>
                    <li>1 छोटा चम्मच सरसों के बीज</li>
                    <li>1-2 हरी मिर्च, बारीक कटी हुई</li>
                    <li>कुछ करी पत्ते</li>
                    <li>1/2 छोटा चम्मच हल्दी पाउडर</li>
                    <li>1 छोटा प्याज, बारीक कटा हुआ (वैकल्पिक)</li>
                    <li>स्वादानुसार नमक</li>
                    <li>ताजा धनिया पत्ती सजावट के लिए</li>
                  </ul>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-orange-200 pb-1">बैटर बनाने की विधि:</h3>
                  <ol className="list-decimal list-outside ml-5 space-y-3 text-gray-700">
                    <li>चावल, उड़द दाल और मेथी के बीज को अलग-अलग धोकर 4-6 घंटे या रात भर भिगो दें।</li>
                    <li>उड़द दाल और मेथी के बीज को थोड़ा पानी डालकर मिक्सर में चिकना और फूला हुआ पीस लें।</li>
                    <li>चावल को मोटा-मोटी पीसें और उड़द दाल के बैटर में मिलाएं।</li>
                    <li>बैटर को ढककर गर्म जगह पर 8-12 घंटे के लिए फर्मेंट होने दें।</li>
                    <li>फर्मेंटेशन के बाद नमक डालकर हल्का मिलाएं।</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-orange-200 pb-1">मसाला भरावन की विधि:</h3>
                  <ol className="list-decimal list-outside ml-5 space-y-2 text-gray-700">
                    <li>तवा में तेल गरम करें, सरसों के बीज डालें और चटकने दें।</li>
                    <li>करी पत्ते, हरी मिर्च और प्याज डालकर सुनहरा भूरा होने तक भूनें।</li>
                    <li>हल्दी पाउडर और नमक डालें।</li>
                    <li>मैश किए हुए आलू डालकर अच्छी तरह मिलाएं।</li>
                    <li>धनिया पत्ती डालकर गैस बंद करें।</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Final Step */}
            <div className="bg-orange-100 p-6 rounded-xl border-2 border-dashed border-orange-300">
               <h3 className="text-xl font-bold text-orange-800 mb-3 text-center text-uppercase">पकाने की अंतिम प्रक्रिया</h3>
               <ol className="list-decimal list-inside space-y-2 font-medium text-orange-900">
                  <li>तवा गरम करें और हल्का तेल लगाएं।</li>
                  <li>एक करछुल भर बैटर लेकर तवे पर घुमाते हुए पतला फैलाएं।</li>
                  <li>किनारों पर थोड़ा तेल या घी डालें।</li>
                  <li>मध्यम आंच पर पकाएं जब तक कि डोसे के किनारे ऊपर उठने लगें।</li>
                  <li>मसाला डोसा के लिए, आलू की भरावन डालकर मोड़ लें और गरमागरम परोसें।</li>
               </ol>
            </div>
          </section>

          {/* Mistakes to Avoid */}
          <section className="bg-red-50 p-6 md:p-8 rounded-2xl border border-red-100">
            <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
              ⚠️ किन गलतियों से बचें?
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "फर्मेंटेशन", desc: "बिना फर्मेंटेशन के डोसा सख्त और स्वादहीन होगा।" },
                { title: "बैटर की कंसिस्टेंसी", desc: "बहुत पतला होने पर टूटेगा, गाढ़ा होने पर फैलेगा नहीं।" },
                { title: "तवे का तापमान", desc: "ज्यादा गर्म तवा डोसे को जला सकता है।" },
                { title: "तेल का प्रयोग", desc: "तेल चिपकाने से रोकता है और कुरकुरापन देता है।" },
                { title: "मसाले का समय", desc: "आधे पक जाने पर ही मसाला डालें ताकि नमी न सोखे।" },
                { title: "स्वाद का संतुलन", desc: "आलू का मसाला न ज्यादा तीखा हो न बेस्वाद।" }
              ].map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                  <strong className="text-red-600 block mb-1">{item.title}:</strong>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tips Section */}
          <section className="bg-green-50 p-6 rounded-2xl border border-green-100">
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
              💡 विशेष टिप्स
            </h2>
            <ul className="grid md:grid-cols-2 gap-4">
              <li className="flex items-start"><span className="text-green-500 mr-2">✔</span> कास्ट-आयरन तवा का इस्तेमाल करें।</li>
              <li className="flex items-start"><span className="text-green-500 mr-2">✔</span> कुरकुरापन बढ़ाने के लिए चुटकी भर बेकिंग सोडा डालें।</li>
              <li className="flex items-start"><span className="text-green-500 mr-2">✔</span> स्वास्थ्य के लिए बाजरा या ओट्स मिलाएं।</li>
              <li className="flex items-start"><span className="text-green-500 mr-2">✔</span> नारियल और पुदीने की चटनी के साथ परोसें।</li>
            </ul>
          </section>

          {/* Conclusion */}
          <footer className="bg-gray-800 text-white p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">निष्कर्ष</h2>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              डोसा और मसाला डोसा बनाना एक कला है जो सही तकनीक और धैर्य मांगती है। बैटर का सही फर्मेंटेशन, तवे का तापमान और मसाले का संतुलन ही इसे परफेक्ट बनाते हैं। इस गाइड की मदद से आप घर पर स्वादिष्ट और कुरकुरे डोसे आसानी से बना सकते हैं। अपने परिवार के साथ इसका आनंद लें!
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default DosaBlog;

