import React from 'react';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    const footerSections = [
        {
            title: "हाम्रो बारे",
            links: [
                { name: "हाम्रो परिचय", href: "#" },
                { name: "सम्पादकीय टोली", href: "#" },
                { name: "सम्पर्क", href: "#" },
                { name: "विज्ञापन", href: "#" },
                { name: "गोपनीयता नीति", href: "#" },
                { name: "विज्ञापन", href: "#" },
                { name: "गोपनीयता नीति", href: "#" },
                { name: "गोपनीयता नीति", href: "#" }
            ]
        },
        {
            title: "समाचार श्रेणीहरू",
            links: [
                { name: "राजनीति", href: "#" },
                { name: "अर्थ / व्यापार", href: "#" },
                { name: "समाज / परिवेश", href: "#" },
                { name: "खेलकुद", href: "#" },
                { name: "प्रविधि", href: "#" },
                { name: "समाज / परिवेश", href: "#" },
                { name: "खेलकुद", href: "#" },
                { name: "प्रविधि", href: "#" }
            ]
        },
        {
            title: "सामग्रीहरू",
            links: [
                { name: "विशेष रिपोर्ट", href: "#" },
                { name: "अन्तर्वार्ता", href: "#" },
                { name: "विचार / ब्लग", href: "#" },
                { name: "फोटो फिचर", href: "#" },
                { name: "भिडियो रिपोर्ट", href: "#" },
                { name: "विचार / ब्लग", href: "#" },
                { name: "फोटो फिचर", href: "#" },
                { name: "भिडियो रिपोर्ट", href: "#" }
            ]
        }
    ];

    const contactInfo = [
        { icon: MapPin, text: "काठमाडौं, नेपाल" },
        { icon: Phone, text: "+९७७ १-४२३४५६७" },
        { icon: Mail, text: "info@nepsetalk.com" }
    ];

    const socialLinks = [
        { icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-white-600" },
        { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-white-400" },
        { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-pink-600" }
    ];

    return (
        <footer className="bg-[#130c4b] relative overflow-hidden">
            {/* Background Pattern */}
            {/* <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div> */}

            {/* Main Footer Content */}
            <div className="relative z-10 max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col items-start space-y-6">
                            {/* Logo */}
                            <div className="mb-4">
                                <img
                                    src="https://nepsetalk.com/wp-content/themes/landing_page/images/nepsetalk-logo.png"
                                    alt="NepseTalk Logo"
                                    className="bg-white p-2 rounded-2xl h-16 lg:h-20 w-auto transition-transform hover:scale-105 duration-300"
                                />
                            </div>

                            {/* Tagline */}
                            <p className="text-white font-semibold text-base sm:text-lg leading-relaxed max-w-md">
                                नेपालको प्रमुख अनलाइन समाचार पोर्टल। तपाईंको विश्वसनीय समाचार स्रोत।
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-3 mt-4">
                                {contactInfo.map((item, index) => (
                                    <div key={index} className="flex items-center text-white hover:text-white-600 transition-colors duration-200 group">
                                        <item.icon className="w-4 h-4 mr-3 text-white-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-base sm:text-lg font-semibold">{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Social Links */}
                            <div className="flex space-x-4 mt-6">
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 ${social.color} hover:text-white transition-all duration-300 transform hover:scale-110 hover:rotate-12 shadow-sm`}
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    {footerSections.map((section, index) => (
                        <div key={index} className="lg:col-span-1">
                            <h3 className="text-base sm:text-lg font-semibold text-white mb-6 relative inline-block">
                                {section.title}
                                {/* <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-white-500 transform -translate-y-1"></span> */}
                            </h3>
                            <ul className="space-y-4">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a
                                            href={link.href}
                                            className="flex items-center text-white font-semibold hover:text-yellow-500 transition-all duration-200 group text-xs sm:text-sm lg:text-base"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-3 text-white  group-hover:translate-x-1 transition-transform duration-200"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Newsletter Subscription */}
                <div className="mt-10 pt-5 border-t border-gray-200">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="flex-1 text-center lg:text-left">
                            <h4 className="text-lg sm:text-xl font-semibold text-white mb-2">
                                ताजा समाचार इमेलमा प्राप्त गर्नुहोस्
                            </h4>
                            <p className="text-sm sm:text-base text-white">
                                दैनिक समाचार, विश्लेषण र अपडेटहरू सिधै तपाईंको इनबक्समा।
                            </p>
                        </div>
                        <div className="flex-1 w-full max-w-md">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="तपाईंको इमेल ठेगाना"
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                                />
                                <button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-white-600 to-white-700 text-white rounded-lg font-medium hover:from-white-700 hover:to-white-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                                    सब्सक्राइब गर्नुहोस्
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 border-t border-gray-200 bg-orange-700 backdrop-blur-sm">
                <div className="lg:max-w-[90%] mx-auto py-4 sm:py-6 px-4">
                    <div className="flex flex-col md:flex-row justify-center md:justify-between items-center gap-3 sm:gap-4">
                        <p className="text-white text-sm sm:text-base lg:text-lg text-center md:text-left">
                            © २०२५ नेप्सटक - नेपाली न्युज पोर्टल। सबै अधिकार सुरक्षित।
                        </p>

                        <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6 text-sm sm:text-base lg:text-lg text-white">
                            <a href="#" className="hover:text-white-600 transition-colors duration-200">
                                Terms
                            </a>
                            <a href="#" className="hover:text-white-600 transition-colors duration-200">
                                Privacy
                            </a>
                            <a href="#" className="hover:text-white-600 transition-colors duration-200">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-10 left-10 w-16 h-16 bg-white-200 rounded-full opacity-30"></div>
        </footer>
    );
};

export default Footer;