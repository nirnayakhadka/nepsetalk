import React, { useState } from 'react';
import { Mail, ShieldCheck, Send, CheckCircle, Facebook, Twitter, Youtube, Instagram, Phone, MessageSquare } from 'lucide-react';

const NewsletterCTA = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle subscription logic here
        setSubscribed(true);
        setTimeout(() => {
            setSubscribed(false);
            setEmail('');
            setPhone('');
        }, 3000);
    };

    return (
        <section id='contact' className="px-2 sm:px-3 lg:px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
            <div className="mx-auto w-full max-w-[90%]">
                {/* Main Newsletter Section */}
                <div className="bg-white  rounded-lg shadow-lg overflow-hidden mb-6">
                    {/* Header with Red Background */}
                    <div className="bg-green-600  text-white py-4 px-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">समाचार पत्रिका</h2>
                                    <p className="text-sm text-white/90">Newsletter Subscription</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium">Live Updates</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 md:p-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Left Side - Description */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
                                        दैनिक समाचार अपडेट प्राप्त गर्नुहोस्
                                    </h3>
                                    <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                        नेप्सेटकको समाचार पत्रिकामा सदस्यता लिनुहोस् र दैनिक बजार विश्लेषण,
                                        आर्थिक समाचार, र महत्वपूर्ण घटनाक्रमहरू सीधै आफ्नो इमेलमा प्राप्त गर्नुहोस्।
                                    </p>
                                </div>

                                {/* Benefits List */}
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">दैनिक बजार विश्लेषण र समाचार</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">महत्वपूर्ण आर्थिक अपडेटहरू</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">निःशुल्क र सुरक्षित सेवा</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-700">कुनै स्प्याम नहुने ग्यारेन्टी</span>
                                    </div>
                                </div>

                                {/* Trust Indicators */}
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                                        <span>सुरक्षित</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span>प्रमाणित</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-red-600" />
                                        <span>१०,०००+ सदस्य</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side - Subscription Form */}
                            <div className="bg-gradient-to-br from-blue-50 to-red-50 rounded-lg p-6  border-blue-200">
                                {subscribed ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-10 h-10 text-white" />
                                        </div>
                                        <h4 className="text-2xl font-bold text-gray-900 mb-2">धन्यवाद!</h4>
                                        <p className="text-gray-700">तपाईंको सदस्यता सफलतापूर्वक दर्ता भयो।</p>
                                    </div>
                                ) : (
                                    <>
                                        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Send className="w-5 h-5 text-red-600" />
                                            सदस्यता लिनुहोस्
                                        </h4>
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    इमेल ठेगाना
                                                </label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="example@email.com"
                                                        required
                                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    मोबाइल नम्बर (वैकल्पिक)
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        placeholder="९८XXXXXXXX"
                                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 text-gray-900"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                            >
                                                <Send className="w-5 h-5" />
                                                सदस्यता लिनुहोस्
                                            </button>
                                        </form>
                                        <p className="text-xs text-gray-600 mt-4 text-center">
                                            सदस्यता लिएपछि, तपाईंले हाम्रो गोपनीयता नीति स्वीकार गर्नुभएको मानिन्छ।
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media & Contact Section */}
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Social Media Links */}
                    <div className="bg-white border-2 border-blue-600 rounded-lg p-5">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                            सामाजिक सञ्जाल
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <a href="#" className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                                <Facebook className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-gray-700">Facebook</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                                <Twitter className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-gray-700">Twitter</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group">
                                <Youtube className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-gray-700">YouTube</span>
                            </a>
                            <a href="#" className="flex items-center gap-2 p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group">
                                <Instagram className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-gray-700">Instagram</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Contact */}
                    <div className="bg-white border-2 border-green-600 rounded-lg p-5">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-green-600" />
                            सम्पर्क
                        </h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded-lg">
                                    <Phone className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">फोन</p>
                                    <p className="text-sm font-semibold text-gray-900">९८०-XXXXXXX</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">इमेल</p>
                                    <p className="text-sm font-semibold text-gray-900">smartcarewebcenter@gmail.com</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter Stats */}
                    <div className="bg-green-600 text-white rounded-lg p-5">
                        <h4 className="text-lg font-bold mb-4">हाम्रो समाचार पत्रिका</h4>
                        <div className="space-y-4">
                            <div>
                                <p className="text-3xl font-bold mb-1">१०,०००+</p>
                                <p className="text-sm text-white/90">सक्रिय सदस्यहरू</p>
                            </div>
                            <div className="border-t border-white/20 pt-4">
                                <p className="text-3xl font-bold mb-1">दैनिक</p>
                                <p className="text-sm text-white/90">समाचार अपडेट</p>
                            </div>
                            <div className="border-t border-white/20 pt-4">
                                <p className="text-3xl font-bold mb-1">२४/७</p>
                                <p className="text-sm text-white/90">समर्थन सेवा</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterCTA;
