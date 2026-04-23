import React, { useState } from "react";
import { getImageUrl } from "../../services/adminApi";
import AdSlot from "../ads/AdSlot";

const rashis = [
  {
    name: "मेष राशि",
    letters: "चु, चे, चो, ला, लि, लु, ले, लो, अ",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_1.png"),
    prediction: "आज का दिन आपके लिए शुभ रहेगा। व्यापार में लाभ की संभावना है।"
  },
  {
    name: "वृष राशि",
    letters: "इ, उ, ए, ओ, वा, वि, वु, वे, वो",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_2.png"),
    prediction: "पारिवारिक संबंधों में मधुरता बनी रहेगी। स्वास्थ्य का ध्यान रखें।"
  },
  {
    name: "मिथुन राशि",
    letters: "का, कि, कु, घ, ङ, छ, के, को, ह",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_3.png"),
    prediction: "शैक्षणिक कार्यों में सफलता मिलेगी। नए मित्र बनेंगे।"
  },
  {
    name: "कर्कट राशि",
    letters: "हि, हु, हे, हो, डा, डि, डु, डे, डो",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_4.png"),
    prediction: "आर्थिक स्थिति में सुधार होगा। मानसिक तनाव से मुक्ति मिलेगी।"
  },
  {
    name: "सिंह राशि",
    letters: "मा, मि, मु, मे, मो, टा, टि, टु, टे",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_5.png"),
    prediction: "नौकरी में पदोन्नति के योग बन रहे हैं। सावधानी से काम लें।"
  },
  {
    name: "कन्या राशि",
    letters: "टो, पा, पि, पु, ष, ण, ठ, पे, पो",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_6.png"),
    prediction: "व्यापारिक यात्राएं लाभदायक सिद्ध होंगी। स्वास्थ्य अच्छा रहेगा।"
  },
  {
    name: "तुला राशि",
    letters: "रा, रि, रु, रे, रो, ता, ति, तु, ते",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_7.png"),
    prediction: "प्रेम संबंधों में मधुरता आएगी। सामाजिक कार्यों में सफलता मिलेगी।"
  },
  {
    name: "वृश्चिक राशि",
    letters: "तो, ना, नि, ने, नो, या, यी, यू",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_8.png"),
    prediction: "धन लाभ की संभावना है। किसी पुराने मित्र से मुलाकात होगी।"
  },
  {
    name: "धनु राशि",
    letters: "ये, यो, भा, भि, भू, धा, फा, ढा, भे",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_9.png"),
    prediction: "विद्या प्राप्ति के योग हैं। धार्मिक कार्यों में रुचि बढ़ेगी।"
  },
  {
    name: "मकर राशि",
    letters: "भो, जा, जि, जु, जे, जो, खि, खु, खे, खो, गा, गि",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_10.png"),
    prediction: "संपत्ति के मामलों में लाभ मिलेगा। पारिवारिक सुख प्राप्त होगा।"
  },
  {
    name: "कुम्भ राशि",
    letters: "गु, गे, गो, सा, सि, सु, से, सो, द",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_11.png"),
    prediction: "नए अवसर मिलेंगे। रचनात्मक कार्यों में सफलता मिलेगी।"
  },
  {
    name: "मीन राशि",
    letters: "दि, दू, थ, झ, ञ, दे, दो, चा, चि",
    icon: getImageUrl("https://www.hamropatro.com/images/dummy/ic_sodiac_12.png"),
    prediction: "आध्यात्मिक उन्नति के योग हैं। मानसिक शांति मिलेगी।"
  },
];

const Rashifal = () => {
  const [selectedRashi, setSelectedRashi] = useState(rashis[0]);
  const [activeTab, setActiveTab] = useState("daily");

  const dailyHoroscope = {
    date: "दिसंबर 20, 2024",
    auspiciousTime: "सुबह 10:00 - 11:30 AM",
    moonPosition: "वृष राशि में",
    specialEvent: "पुष्य नक्षत्र"
  };

  const weeklyPredictions = [
    { day: "सोमवार", prediction: "सप्ताह की शुरुआत अच्छी रहेगी" },
    { day: "मंगलवार", prediction: "व्यापार में लाभ के योग" },
    { day: "बुधवार", prediction: "शैक्षणिक सफलता मिलेगी" },
    { day: "गुरुवार", prediction: "धार्मिक कार्यों में सफलता" },
    { day: "शुक्रवार", prediction: "पारिवारिक सुख की प्राप्ति" },
    { day: "शनिवार", prediction: "सावधानी बरतने की आवश्यकता" },
    { day: "रविवार", prediction: "आराम और मनोरंजन का दिन" }
  ];

  return (
    <div id="rashifal" className="flex flex-col lg:flex-row max-w-[90%] mx-auto sm:p-6  min-h-auto">
      {/* Left Side - Rashi Grid */}
      <div className="flex-1 lg:pr-0 lg:mb-0 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">राशिफल</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {rashis.map((rashi, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-3 sm:p-4 flex flex-col items-center justify-center text-center hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${selectedRashi.name === rashi.name ? 'border-yellow-500' : 'border-transparent'
                }`}
              onClick={() => setSelectedRashi(rashi)}
            >
              <img
                src={rashi.icon}
                alt={rashi.name}
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mb-2 sm:mb-3 object-contain"
              />
              <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-800 mb-1 sm:mb-2">{rashi.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{rashi.letters}</p>
              <div className="w-6 sm:w-8 h-1 bg-white rounded-full mb-1 sm:mb-2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Detailed Content */}
      <div className="w-full lg:w-1/3 lg:ml-6 lg:mt-0 mt-6">
        {/* Selected Rashi Details */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 border border-gray-200 mb-4 sm:mb-6">
          <div className="flex items-center mb-4">
            <img
              src={selectedRashi.icon}
              alt={selectedRashi.name}
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mr-3 sm:mr-4"
            />
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{selectedRashi.name}</h2>
              <p className="text-sm sm:text-base text-gray-600">{selectedRashi.letters}</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">आज का भविष्यफल</h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{selectedRashi.prediction}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
              <span className="font-semibold text-blue-800 text-xs sm:text-sm">लकी नंबर:</span>
              <p className="text-blue-600 text-xs sm:text-sm">7, 14, 21</p>
            </div>
            <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
              <span className="font-semibold text-green-800 text-xs sm:text-sm">लकी कलर:</span>
              <p className="text-green-600 text-xs sm:text-sm">लाल, सुनहरा</p>
            </div>
          </div>
        </div>

        {/* Tabs for Daily/Weekly */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 border border-gray-200 mb-4 sm:mb-6">
          <div className="flex border-b border-gray-200 mb-4">
            <button
              className={`flex-1 py-2 font-semibold text-sm sm:text-base ${activeTab === "daily"
                  ? "text-yellow-600 border-b-2 border-yellow-600"
                  : "text-gray-600"
                }`}
              onClick={() => setActiveTab("daily")}
            >
              दैनिक राशिफल
            </button>
            <button
              className={`flex-1 py-2 font-semibold text-sm sm:text-base ${activeTab === "weekly"
                  ? "text-yellow-600 border-b-2 border-yellow-600"
                  : "text-gray-600"
                }`}
              onClick={() => setActiveTab("weekly")}
            >
              साप्ताहिक भविष्यफल
            </button>
          </div>

          {activeTab === "daily" && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">आज का विशेष</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700 text-xs sm:text-sm">आज की तारीख:</span>
                  <span className="text-gray-600 text-xs sm:text-sm text-right">{dailyHoroscope.date}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
                  <span className="font-medium text-yellow-700 text-xs sm:text-sm">शुभ मुहूर्त:</span>
                  <span className="text-yellow-600 text-xs sm:text-sm text-right">{dailyHoroscope.auspiciousTime}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-700 text-xs sm:text-sm">चंद्रमा की स्थिति:</span>
                  <span className="text-blue-600 text-xs sm:text-sm text-right">{dailyHoroscope.moonPosition}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-700 text-xs sm:text-sm">विशेष योग:</span>
                  <span className="text-purple-600 text-xs sm:text-sm text-right">{dailyHoroscope.specialEvent}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "weekly" && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">इस सप्ताह का भविष्यफल</h3>
              <div className="space-y-2 sm:space-y-3">
                {weeklyPredictions.map((day, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-start p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700 text-xs sm:text-sm min-w-16 sm:min-w-20">{day.day}:</span>
                      <span className="text-gray-600 text-xs sm:text-sm flex-1">{day.prediction}</span>
                    </div>
                    {(index + 1) % 3 === 0 && <AdSlot position="infeed" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Tips */}
        <div className="h-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl shadow-md sm:shadow-lg p-4 sm:p-6 text-white">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">💫 आज का विशेष सुझाव</h3>
          <p className="text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
            सूर्य को जल अर्पित करें और मंत्र 'ॐ सूर्याय नम:' का जाप करें।
          </p>
          <div className="flex items-center">
            <span className="bg-white text-orange-500 px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm">
              शुभकामनाएं!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rashifal;