"use client";

import React, { useState } from "react";
import { FaTimes, FaGlobe, FaShieldAlt, FaLanguage, FaCheckCircle, FaFileContract } from "react-icons/fa";

// Eighth Schedule languages & accurate statutory notices per DPDP Act Section 5
export const EIGHTH_SCHEDULE_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
];

export const STATUTORY_NOTICES = {
  en: {
    title: "Statutory Privacy Notice (DPDP Act, 2023 - Section 5)",
    subtitle: "Notice accompanying request for citizen personal data by SoSign (Data Fiduciary)",
    fiduciaryLabel: "Data Fiduciary:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), Bengaluru, Karnataka, India",
    sections: [
      {
        heading: "1. Personal Data Collected",
        content: "Name, email address, mobile number, role/designation, digital signatures on petitions, optional Aadhaar DigiLocker verification token, uploaded profile photo, and security logs (IP address, session cookies).",
      },
      {
        heading: "2. Specific Purpose for Processing",
        content: "Authenticating citizen identity, recording voluntary digital petition signatures, presenting citizen concerns to designated authorities, providing statutory fraud prevention, and communicating petition milestone updates.",
      },
      {
        heading: "3. Exercise of Citizen Rights (Chapter III)",
        content: "You have the statutory Right to Access summaries of your data, Right to Correction/Updation, and the Right to Erasure (Section 12) to request permanent deletion of your account and petitions at any time via your profile page.",
      },
      {
        heading: "4. Right to Withdraw Consent (Section 6(4))",
        content: "You may withdraw your consent for non-essential processing (analytics, marketing) at any time through your profile or cookie settings with the same ease as granting it.",
      },
      {
        heading: "5. Grievance Redressal Officer (Section 8(9))",
        content: "Grievance Officer, SoSign, Email: grievance@sosign.in. Statutory resolution within 30 days. Live ticket tracking is available on our contact page.",
      },
      {
        heading: "6. Escalation to Data Protection Board of India (DPBI)",
        content: "Under Section 13(3) of the DPDP Act 2023, if your grievance remains unresolved after 30 days, you have the statutory right to escalate your complaint to the Data Protection Board of India.",
      },
    ],
  },
  hi: {
    title: "सांविधिक गोपनीयता सूचना (डीपीडीपी अधिनियम, 2023 - धारा 5)",
    subtitle: "SoSign (डेटा फिड्यूशरी) द्वारा व्यक्तिगत डेटा संग्रह से पूर्व नागरिक सूचना",
    fiduciaryLabel: "डेटा न्यासी (Data Fiduciary):",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), बेंगलुरु, कर्नाटक, भारत",
    sections: [
      {
        heading: "1. एकत्र किया जाने वाला व्यक्तिगत डेटा",
        content: "नाम, ईमेल पता, मोबाइल नंबर, पद/पदनाम, याचिकाओं पर डिजिटल हस्ताक्षर, आधार डिजिलॉकर सत्यापन टोकन, और सुरक्षा लॉग (आईपी पता, ब्राउज़र कुकीज़)।",
      },
      {
        heading: "2. प्रसंस्करण का विशिष्ट उद्देश्य",
        content: "नागरिक पहचान का सत्यापन, याचिकाओं पर डिजिटल हस्ताक्षर दर्ज करना, संबंधित प्राधिकरणों तक जनहित मुद्दे पहुंचाना, और याचिका विजय की सूचना देना।",
      },
      {
        heading: "3. नागरिक अधिकार (अध्याय III)",
        content: "आपको अपने डेटा का विवरण प्राप्त करने, सुधार करने तथा धारा 12 के तहत अपने प्रोफाइल और याचिकाओं को स्थायी रूप से मिटाने (Erasure/Deletion) का पूर्ण विधिक अधिकार है।",
      },
      {
        heading: "4. सहमति वापस लेने का अधिकार (धारा 6(4))",
        content: "आप किसी भी समय अपनी सहमति (जैसे विपणन या कुकीज़) उसी सरलता से वापस ले सकते हैं जिस सरलता से सहमति दी गई थी।",
      },
      {
        heading: "5. शिकायत निवारण अधिकारी (धारा 8(9))",
        content: "शिकायत अधिकारी, SoSign, ईमेल: grievance@sosign.in. अधिनियम के तहत 30 दिनों में समाधान की गारंटी।",
      },
      {
        heading: "6. भारतीय डेटा संरक्षण बोर्ड (DPBI) को अपील",
        content: "डीपीडीपी अधिनियम की धारा 13(3) के तहत, यदि आपकी शिकायत 30 दिनों में नहीं सुलझती है, तो आप भारत के डेटा संरक्षण बोर्ड से संपर्क कर सकते हैं।",
      },
    ],
  },
  bn: {
    title: "সংবিধিবদ্ধ গোপনীয়তা বিজ্ঞপ্তি (DPDP আইন, ২০২৩ - ধারা ৫)",
    subtitle: "নাগরিকের ব্যক্তিগত তথ্য সংগ্রহের পূর্বে SoSign প্রদত্ত বিজ্ঞপ্তি",
    fiduciaryLabel: "ডেটা ট্রাস্টি:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), বেঙ্গালুরু, ভারত",
    sections: [
      {
        heading: "১. সংগৃহীত ব্যক্তিগত তথ্য",
        content: "নাম, ইমেল ঠিকানা, মোবাইল নম্বর, পদবী, পিটিশনে ডিজিটাল স্বাক্ষর, ঐচ্ছিক আধার ডিজিটালি যাচাইকরণ ও লগ ডেটা।",
      },
      {
        heading: "২. তথ্য ব্যবহারের উদ্দেশ্য",
        content: "নাগরিক পরিচয় যাচাই, পিটিশন সমর্থন নথিভুক্তকরণ এবং নির্দিষ্ট কর্তৃপক্ষের কাছে দাবিপত্র পৌঁছানো।",
      },
      {
        heading: "৩. নাগরিকের অধিকার (অধ্যায় ৩)",
        content: "আপনার তথ্য সংশোধন করার এবং ধারা ১২ অনুযায়ী সমস্ত তথ্য ও পিটিশন মুছে ফেলার (Erasure) সম্পূর্ণ অধিকার রয়েছে।",
      },
      {
        heading: "৪. সম্মতি প্রত্যাহারের অধিকার (ধারা ৬(৪))",
        content: "আপনি যে কোনো সময় আপনার দেওয়া সম্মতি বিনা বাধায় প্রত্যাহার করতে পারেন।",
      },
      {
        heading: "৫. অভিযোগ প্রতিকার আধিকারিক",
        content: "গ্রিভান্স অফিসার, SoSign, ইমেল: grievance@sosign.in। ৩০ দিনের মধ্যে প্রতিকার নিশ্চিত।",
      },
      {
        heading: "৬. ডেটা প্রোটেকশন বোর্ড অফ ইন্ডিয়া (DPBI) তে অভিযোগ",
        content: "ধারা ১৩(৩) এর আওতায় অভিযোগ সমাধান না হলে আপনি ভারতীয় ডেটা প্রোটেকশন বোর্ডের কাছে আবেদন করতে পারেন।",
      },
    ],
  },
  mr: {
    title: "वैधानिक गोपनीयता सूचना (DPDP कायदा, २०२३ - कलम ५)",
    subtitle: "नागरिकांचा वैयक्तिक डेटा गोळा करण्यापूर्वी SoSign द्वारे दिलेली सूचना",
    fiduciaryLabel: "डेटा विश्वस्त:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), बेंगळुरू, भारत",
    sections: [
      {
        heading: "१. गोळा केला जाणारा डेटा",
        content: "नाव, ईमेल, मोबाईल क्रमांक, पदनाम, याचिकांवर डिजिटल स्वाक्षऱ्या, आधार पडताळणी माहिती व सुरक्षा नोंदी.",
      },
      {
        heading: "२. डेटा वापराचा उद्देश",
        content: "ओळख पडताळणी, लोकहिताच्या याचिकांवर स्वाक्षरी नोंदवणे आणि संबंधित प्रशासकीय अधिकाऱ्यांपर्यंत मागणी पोहोचवणे.",
      },
      {
        heading: "३. नागरिकांचे अधिकार (प्रकरण ३)",
        content: "माहिती तपासण्याचा, दुरुस्त करण्याचा आणि कलम १२ अंतर्गत खाते व याचिका कायमस्वरूपी नष्ट (Delete) करण्याचा अधिकार.",
      },
      {
        heading: "४. संमती मागे घेण्याचा अधिकार (कलम ६(४))",
        content: "तुम्ही कधीही दिलेली संमती मागे घेऊ शकता.",
      },
      {
        heading: "५. तक्रार निवारण अधिकारी",
        content: "तक्रार अधिकारी, SoSign, ईमेल: grievance@sosign.in (३० दिवसांत निवारण).",
      },
      {
        heading: "६. भारतीय डेटा संरक्षण मंडळाकडे दाद",
        content: "तक्रार ३० दिवसांत न सुटल्यास कलम १३(३) अन्वये भारतीय डेटा संरक्षण मंडळाकडे दाद मागता येईल.",
      },
    ],
  },
  te: {
    title: "చట్టబద్ధమైన గోప్యతా నోటీసు (DPDP చట్టం, 2023 - సెక్షన్ 5)",
    subtitle: "వ్యక్తిగత డేటా సేకరణకు ముందు SoSign అందించే నోటీసు",
    fiduciaryLabel: "డేటా ఫిడ్యూషియరీ:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), బెంగళూరు, భారతదేశం",
    sections: [
      {
        heading: "1. సేకరించే వ్యక్తిగత డేటా",
        content: "పేరు, ఇమెయిల్, మొబైల్ నంబర్, పిటిషన్లపై డిజిటల్ సంతకాలు, ఆధార్ డిజిలాకర్ ధృవీకరణ వివరాలు.",
      },
      {
        heading: "2. డేటా ప్రాసెసింగ్ ఉద్దేశ్యం",
        content: "పౌరుల గుర్తింపు నిర్ధారణ, పిటిషన్ల నమోదు మరియు ప్రభుత్వ అధికారులకు ప్రజా సమస్యలను చేరవేయడం.",
      },
      {
        heading: "3. పౌరుల హక్కులు (అధ్యాయం III)",
        content: "సెక్షన్ 12 క్రింద మీ ఖాతా మరియు పిటిషన్లను శాశ్వతంగా తొలగించే హక్కు (Right to Erasure) మీకు ఉంది.",
      },
      {
        heading: "4. సమ్మతిని ఉపసంహరించుకునే హక్కు (సెక్షన్ 6(4))",
        content: "మీరు ఇచ్చిన సమ్మతిని ఎప్పుడైనా సులభంగా రద్దు చేసుకోవచ్చు.",
      },
      {
        heading: "5. ఫిర్యాదుల పరిష్కార అధికారి",
        content: "గ్రీవెన్స్ ఆఫీసర్, SoSign, ఇమెయిల్: grievance@sosign.in (30 రోజుల్లో పరిష్కారం).",
      },
      {
        heading: "6. భారత డేటా రక్షణ బోర్డు (DPBI) కు అప్పీల్",
        content: "సెక్షన్ 13(3) క్రింద సమస్య పరిష్కారం కాకపోతే డేటా ప్రొటెక్షన్ బోర్డ్ ఆఫ్ ఇండియాను ఆశ్రయించవచ్చు.",
      },
    ],
  },
  ta: {
    title: "சட்டப்பூர்வ தனியுரிமை அறிவிப்பு (DPDP சட்டம், 2023 - பிரிவு 5)",
    subtitle: "தனிப்பட்ட தரவைச் சேகரிக்கும் முன் SoSign வழங்கும் குடிமக்கள் அறிவிப்பு",
    fiduciaryLabel: "தரவு பொறுப்பாளர்:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), பெங்களூரு, இந்தியா",
    sections: [
      {
        heading: "1. சேகரிக்கப்படும் தனிப்பட்ட தரவு",
        content: "பெயர், மின்னஞ்சல், அலைபேசி எண், மனுக்களில் டிஜிட்டல் கையொப்பங்கள், ஆதார் சரிபார்ப்பு விவரங்கள்.",
      },
      {
        heading: "2. தரவு செயலாக்கத்தின் நோக்கம்",
        content: "குடிமக்கள் அடையாளத்தைச் சரிபார்த்தல், மனு ஆதரவைப் பதிவு செய்தல் மற்றும் உரிய அதிகாரிகளுக்கு அனுப்புதல்.",
      },
      {
        heading: "3. குடிமக்களின் உரிமைகள் (அத்தியாயம் III)",
        content: "பிரிவு 12 இன் கீழ் உங்கள் கணக்கு மற்றும் மனுக்களை நிரந்தரமாக நீக்கும் உரிமை (Right to Erasure) உங்களுக்கு உண்டு.",
      },
      {
        heading: "4. சம்மதத்தைத் திரும்பப் பெறும் உரிமை (பிரிவு 6(4))",
        content: "வழங்கப்பட்ட சம்மதத்தை எந்த நேரத்திலும் எளிதாக திரும்பப் பெறலாம்.",
      },
      {
        heading: "5. குறைதீர்க்கும் அதிகாரி",
        content: "குறைதீர்க்கும் அதிகாரி, SoSign, மின்னஞ்சல்: grievance@sosign.in (30 நாட்களில் தீர்வு).",
      },
      {
        heading: "6. இந்திய தரவு பாதுகாப்பு வாரியத்திற்கு (DPBI) புகார்",
        content: "பிரிவு 13(3) இன் கீழ் உங்கள் புகார் தீர்க்கப்படாவிட்டால், இந்திய தரவு பாதுகாப்பு வாரியத்தை அணுகலாம்.",
      },
    ],
  },
  gu: {
    title: "કાનૂની ગોપનીયતા નોટિસ (DPDP એક્ટ, 2023 - કલમ 5)",
    subtitle: "વ્યક્તિગત ડેટા એકત્રિત કરતા પહેલા SoSign દ્વારા આપવામાં આવેલી નોટિસ",
    fiduciaryLabel: "ડેટા ફિડ્યુશિયરી:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), બેંગલુરુ, ભારત",
    sections: [
      {
        heading: "1. એકત્રિત કરવામાં આવતો ડેટા",
        content: "નામ, ઈમેઈલ, મોબાઈલ નંબર, પિટિશન પર ડિજિટલ હસ્તાક્ષર, આધાર વેરિફિકેશન અને સુરક્ષા લોગ્સ.",
      },
      {
        heading: "2. ડેટા ઉપયોગનો હેતુ",
        content: "નાગરિક ઓળખ ચકાસણી, પિટિશન પર હસ્તાક્ષર નોંધવા અને જવાબદાર સત્તાવાળાઓ સુધી લોકહિતના પ્રશ્નો પહોંચાડવા.",
      },
      {
        heading: "3. નાગરિક અધિકારો (પ્રકરણ III)",
        content: "કલમ 12 હેઠળ તમારું એકાઉન્ટ અને પિટિશનો કાયમી ધોરણે ભૂંસી નાખવાનો (Right to Erasure) અધિકાર.",
      },
      {
        heading: "4. સંમતિ પાછી ખેંચવાનો અધિકાર (કલમ 6(4))",
        content: "તમે આપેલી સંમતિ કોઈપણ સમયે સરળતાથી પાછી ખેંચી શકો છો.",
      },
      {
        heading: "5. ફરિયાદ નિવારણ અધિકારી",
        content: "ફરિયાદ અધિકારી, SoSign, ઈમેઈલ: grievance@sosign.in (30 દિવસમાં નિવારણ).",
      },
      {
        heading: "6. ડેટા પ્રોટેક્શન બોર્ડ ઓફ ઈન્ડિયા (DPBI) સમક્ષ ફરિયાદ",
        content: "કલમ 13(3) હેઠળ જો ફરિયાદ ન ઉકેલાય તો ભારતીય ડેટા પ્રોટેક્શન બોર્ડનો સંપર્ક કરી શકો છો.",
      },
    ],
  },
  kn: {
    title: "ಶಾಸನಬದ್ಧ ಗೌಪ್ಯತಾ ಸೂಚನೆ (DPDP ಕಾಯಿದೆ, 2023 - ಕಲಂ 5)",
    subtitle: "ವೈಯಕ್ತಿಕ ಡೇಟಾ ಸಂಗ್ರಹಣೆಗೆ ಮುನ್ನ SoSign ನೀಡುವ ನಾಗರಿಕ ಸೂಚನೆ",
    fiduciaryLabel: "ಡೇಟಾ ಫಿಡ್ಯೂಶಿಯರಿ:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), ಬೆಂಗಳೂರು, ಭಾರತ",
    sections: [
      {
        heading: "1. ಸಂಗ್ರಹಿಸಲಾಗುವ ಡೇಟಾ",
        content: "ಹೆಸರು, ಇಮೇಲ್, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ಅರ್ಜಿಗಳ ಮೇಲಿನ ಡಿಜಿಟಲ್ ಸಹಿ ಮತ್ತು ಆಧಾರ್ ಪರಿಶೀಲನಾ ವಿವರಗಳು.",
      },
      {
        heading: "2. ಡೇಟಾ ಬಳಕೆಯ ಉದ್ದೇಶ",
        content: "ನಾಗರಿಕರ ಗುರುತಿಸುವಿಕೆ, ಸಾರ್ವಜನಿಕ ಅರ್ಜಿಗಳ ದಾಖಲಾತಿ ಮತ್ತು ಸಂಬಂಧಪಟ್ಟ ಅಧಿಕಾರಿಗಳಿಗೆ ಬೇಡಿಕೆ ಸಲ್ಲಿಸುವುದು.",
      },
      {
        heading: "3. ನಾಗರಿಕರ ಹಕ್ಕುಗಳು (ಅಧ್ಯಾಯ III)",
        content: "ಕಲಂ 12 ರ ಅಡಿಯಲ್ಲಿ ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಅರ್ಜಿಗಳನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿಹಾಕುವ ಹಕ್ಕು (Right to Erasure) ನಿಮಗಿದೆ.",
      },
      {
        heading: "4. ಒಪ್ಪಿಗೆ ಹಿಂಪಡೆಯುವ ಹಕ್ಕು (ಕಲಂ 6(4))",
        content: "ನೀವು ನೀಡಿದ ಒಪ್ಪಿಗೆಯನ್ನು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಹಿಂಪಡೆಯಬಹುದು.",
      },
      {
        heading: "5. ಕುಂದುಕೊರತೆ ನಿವಾರಣಾಧಿಕಾರಿ",
        content: "ಗ್ರೀವೆನ್ಸ್ ಆಫೀಸರ್, SoSign, ಇಮೇಲ್: grievance@sosign.in (30 ದಿನಗಳಲ್ಲಿ ಪರಿಹಾರ).",
      },
      {
        heading: "6. ಭಾರತೀಯ ಡೇಟಾ ರಕ್ಷಣಾ ಮಂಡಳಿಗೆ (DPBI) ದೂರು",
        content: "ಕಲಂ 13(3) ರ ಅಡಿಯಲ್ಲಿ ಸಮಸ್ಯೆ ಇತ್ಯರ್ಥವಾಗದಿದ್ದರೆ ಭಾರತೀಯ ಡೇಟಾ ರಕ್ಷಣಾ ಮಂಡಳಿಗೆ ದೂರು ಸಲ್ಲಿಸಬಹುದು.",
      },
    ],
  },
  ml: {
    title: "നിയമപരമായ സ്വകാര്യതാ അറിയിപ്പ് (DPDP നിയമം, 2023 - വകുപ്പ് 5)",
    subtitle: "വ്യക്തിഗത ഡാറ്റ ശേഖരിക്കുന്നതിന് മുൻപ് SoSign നൽകുന്ന അറിയിപ്പ്",
    fiduciaryLabel: "ഡാറ്റാ ഫിഡ്യൂഷ്യറി:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), ബെംഗളൂരു, ഇന്ത്യ",
    sections: [
      {
        heading: "1. ശേഖരിക്കുന്ന വ്യക്തിഗത വിവരങ്ങൾ",
        content: "പേര്, ഇമെയിൽ, മൊബൈൽ നമ്പർ, ഹർജികളിലെ ഡിജിറ്റൽ ഒപ്പുകൾ, ആധാർ സ്ഥിരീകരണ വിവരങ്ങൾ.",
      },
      {
        heading: "2. വിവരങ്ങൾ ഉപയോഗിക്കുന്നതിന്റെ ഉദ്ദേശ്യം",
        content: "പൗരന്മാരുടെ ഐഡന്റിറ്റി സ്ഥിരീകരിക്കൽ, പൊതുതാൽപ്പര്യ ഹർജികൾ രേഖപ്പെടുത്തൽ, അധികാരികൾക്ക് സമർപ്പിക്കൽ.",
      },
      {
        heading: "3. പൗരന്മാരുടെ അവകാശങ്ങൾ (അധ്യായം III)",
        content: "വകുപ്പ് 12 പ്രകാരം അക്കൗണ്ടും ഹർജികളും പൂർണ്ണമായി മായ്ച്ചുകളയാൻ (Right to Erasure) അവകാശമുണ്ട്.",
      },
      {
        heading: "4. സമ്മതം പിൻവലിക്കാനുള്ള അവകാശം (വകുപ്പ് 6(4))",
        content: "നൽകിയ സമ്മതം ഏതുസമയത്തും പിൻവലിക്കാൻ സാധിക്കും.",
      },
      {
        heading: "5. പരാതി പരിഹാര ഉദ്യോഗസ്ഥൻ",
        content: "ഗ്രീവൻസ് ഓഫീസർ, SoSign, ഇമെയിൽ: grievance@sosign.in (30 ദിവസത്തിനകം പരിഹാരം).",
      },
      {
        heading: "6. ഡാറ്റാ പ്രൊട്ടക്ഷൻ ബോർഡ് ഓഫ് ഇന്ത്യയിലേക്ക് (DPBI) പരാതി",
        content: "വകുപ്പ് 13(3) പ്രകാരം പരാതി പരിഹരിച്ചില്ലെങ്കിൽ ഡാറ്റാ പ്രൊട്ടക്ഷൻ ബോർഡിനെ സമീപിക്കാം.",
      },
    ],
  },
  pa: {
    title: "ਕਾਨੂੰਨੀ ਗੁਪਤਤਾ ਨੋਟਿਸ (DPDP ਐਕਟ, 2023 - ਧਾਰਾ 5)",
    subtitle: "ਨਿੱਜੀ ਡੇਟਾ ਇਕੱਠਾ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ SoSign ਦੁਆਰਾ ਦਿੱਤਾ ਨੋਟਿਸ",
    fiduciaryLabel: "ਡੇਟਾ ਫਿਡਿਊਸ਼ਰੀ:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), ਬੈਂਗਲੁਰੂ, ਭਾਰਤ",
    sections: [
      {
        heading: "1. ਇਕੱਤਰ ਕੀਤਾ ਡੇਟਾ",
        content: "ਨਾਮ, ਈਮੇਲ, ਮੋਬਾਈਲ ਨੰਬਰ, ਪਟੀਸ਼ਨਾਂ ਉੱਤੇ ਡਿਜੀਟਲ ਦਸਤਖਤ, ਆਧਾਰ ਪੁਸ਼ਟੀ ਵੇਰਵੇ.",
      },
      {
        heading: "2. ਡੇਟਾ ਵਰਤੋਂ ਦਾ ਉਦੇਸ਼",
        content: "ਨਾਗਰਿਕ ਪਛਾਣ ਦੀ ਪੁਸ਼ਟੀ, ਲੋਕ ਹਿੱਤ ਪਟੀਸ਼ਨਾਂ ਦੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਤੇ ਸੰਬੰਧਿਤ ਅਧਿਕਾਰੀਆਂ ਨੂੰ ਮੰਗ ਪੱਤਰ ਪਹੁੰਚਾਉਣਾ.",
      },
      {
        heading: "3. ਨਾਗਰਿਕਾਂ ਦੇ ਅਧਿਕਾਰ (ਅਧਿਆਇ III)",
        content: "ਧਾਰਾ 12 ਅਧੀਨ ਆਪਣਾ ਖਾਤਾ ਅਤੇ ਪਟੀਸ਼ਨਾਂ ਪੱਕੇ ਤੌਰ ਤੇ ਮਿਟਾਉਣ (Right to Erasure) ਦਾ ਅਧਿਕਾਰ.",
      },
      {
        heading: "4. ਸਹਿਮਤੀ ਵਾਪਸ ਲੈਣ ਦਾ ਅਧਿਕਾਰ (ਧਾਰਾ 6(4))",
        content: "ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਆਪਣੀ ਸਹਿਮਤੀ ਵਾਪਸ ਲੈ ਸਕਦੇ ਹੋ.",
      },
      {
        heading: "5. ਸ਼ਿਕਾਇਤ ਨਿਵਾਰਣ ਅਧਿਕਾਰੀ",
        content: "ਸ਼ਿਕਾਇਤ ਅਧਿਕਾਰੀ, SoSign, ਈਮੇਲ: grievance@sosign.in (30 ਦਿਨਾਂ ਵਿੱਚ ਨਿਪਟਾਰਾ).",
      },
      {
        heading: "6. ਭਾਰਤੀ ਡੇਟਾ ਸੁਰੱਖਿਆ ਬੋਰਡ (DPBI) ਨੂੰ ਸ਼ਿਕਾਇਤ",
        content: "ਧਾਰਾ 13(3) ਅਧੀਨ ਜੇਕਰ ਸ਼ਿਕਾਇਤ ਦਾ ਨਿਪਟਾਰਾ ਨਾ ਹੋਵੇ ਤਾਂ ਡੇਟਾ ਪ੍ਰੋਟੈਕਸ਼ਨ ਬੋਰਡ ਨਾਲ ਸੰਪਰਕ ਕਰੋ.",
      },
    ],
  },
  or: {
    title: "ବୈଧାନିକ ଗୋପନୀୟତା ନୋଟିସ୍ (DPDP ଆଇନ, ୨୦୨୩ - ଧାରା ୫)",
    subtitle: "ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ସଂଗ୍ରହ ପୂର୍ବରୁ SoSign ଦ୍ୱାରା ପ୍ରଦତ୍ତ ନୋଟିସ୍",
    fiduciaryLabel: "ଡାଟା ଫିଡ୍ୟୁସିଆରୀ:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), ବେଙ୍ଗାଲୁରୁ, ଭାରତ",
    sections: [
      {
        heading: "୧. ସଂଗୃହୀତ ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ",
        content: "ନାମ, ଇମେଲ୍, ମୋବାଇଲ୍ ନମ୍ବର, ପିଟିସନ୍ ଉପରେ ଡିଜିଟାଲ୍ ଦସ୍ତଖତ, ଆଧାର ଯାଞ୍ଚ ବିବରଣୀ।",
      },
      {
        heading: "୨. ତଥ୍ୟ ବ୍ୟବହାରର ଉଦ୍ଦେଶ୍ୟ",
        content: "ନାଗରିକ ପରିଚୟ ନିଶ୍ଚିତକରଣ, ପିଟିସନ୍ ସମର୍ଥନ ରେକର୍ଡ ଏବଂ କର୍ତ୍ତୃପକ୍ଷଙ୍କ ନିକଟରେ ଦାବି ଉପସ୍ଥାପନ।",
      },
      {
        heading: "୩. ନାଗରିକଙ୍କ ଅଧିକାର (ଅଧ୍ୟାୟ III)",
        content: "ଧାରା ୧୨ ଅନୁଯାୟୀ ଆପଣଙ୍କ ଆକାଉଣ୍ଟ ଏବଂ ପିଟିସନକୁ ସମ୍ପୂର୍ଣ୍ଣ ବିଲୋପ (Right to Erasure) କରିବାର ଅଧିକାର।",
      },
      {
        heading: "୪. ସମ୍ମତି ପ୍ରତ୍ୟାହାର ଅଧିକାର (ଧାରା ୬(୪))",
        content: "ଆପଣ ଯେକୌଣସି ସମୟରେ ପ୍ରଦତ୍ତ ସମ୍ମତି ସହଜରେ ପ୍ରତ୍ୟାହାର କରିପାରିବେ।",
      },
      {
        heading: "୫. ଅଭିଯୋଗ ନିବାରଣ ଅଧିକାରୀ",
        content: "ଅଭିଯୋଗ ଅଧିକାରୀ, SoSign, ଇମେଲ୍: grievance@sosign.in (୩୦ ଦିନରେ ସମାଧାନ)।",
      },
      {
        heading: "୬. ଭାରତୀୟ ଡାଟା ସୁରକ୍ଷା ବୋର୍ଡ (DPBI) କୁ ଅଭିଯୋଗ",
        content: "ଧାରା ୧୩(୩) ଅନୁଯାୟୀ ସମାଧାନ ନହେଲେ ଭାରତୀୟ ଡାଟା ସୁରକ୍ଷା ବୋର୍ଡକୁ ଆବେଦନ କରିପାରିବେ।",
      },
    ],
  },
  ur: {
    title: "قانونی پرائیویسی نوٹس (DPDP ایکٹ، 2023 - دفعہ 5)",
    subtitle: "ذاتی ڈیٹا جمع کرنے سے قبل SoSign کی جانب سے قانونی نوٹس",
    fiduciaryLabel: "ڈیٹا فڈیوbodyA:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), بنگلورو، بھارت",
    sections: [
      {
        heading: "1. اکٹھا کیا جانے والا ذاتی ڈیٹا",
        content: "نام، ای میل، موبائل نمبر، پٹیشنز پر ڈیجیٹل دستخط، اور آدھار تصدیقی معلومات۔",
      },
      {
        heading: "2. ڈیٹا پروسیسنگ کا مقصد",
        content: "شہری کی شناخت کی تصدیق، عوامی مسائل کو حکام تک پہنچانا، اور پٹیشن کی پیش رفت بتانا۔",
      },
      {
        heading: "3. شہریوں کے حقوق (باب III)",
        content: "دفعہ 12 کے تحت اپنا اکاؤنٹ اور پٹیشنز مستقل طور پر حذف (Right to Erasure) کروانے کا قانونی حق۔",
      },
      {
        heading: "4. رضامندی واپس لینے کا حق (دفعہ 6(4))",
        content: "آپ کسی بھی وقت اپنی رضامندی آسانی سے واپس لے سکتے ہیں۔",
      },
      {
        heading: "5. شکایات کے ازالے کا افسر",
        content: "شکایات افسر، SoSign، ای میل: grievance@sosign.in (30 دنوں میں حل)۔",
      },
      {
        heading: "6. ڈیٹا پروٹیکشن بورڈ آف انڈیا (DPBI) سے رجوع",
        content: "دفعہ 13(3) کے تحت اگر شکایت حل نہ ہو تو ہندوستانی ڈیٹا پروٹیکشن بورڈ سے رابطہ کریں۔",
      },
    ],
  },
  as: {
    title: "আইনগত গোপনীয়তা জাননী (DPDP আইন, ২০২৩ - দফা ৫)",
    subtitle: "ব্যক্তিগত তথ্য সংগ্ৰহৰ পূৰ্বে SoSign দ্বাৰা প্ৰদত্ত জাননী",
    fiduciaryLabel: "তথ্য ট্রাষ্টী:",
    fiduciaryValue: "SoSign (LEO MEO IT Solution), বেংগালুৰু, ভাৰত",
    sections: [
      {
        heading: "১. সংগ্ৰহ কৰা ব্যক্তিগত তথ্য",
        content: "নাম, ইমেইল, মোবাইল নম্বৰ, আৱেদনত ডিজিটেল স্বাক্ষৰ আৰু প্ৰয়োজনীয় প্ৰমাণীকৰণ তথ্য।",
      },
      {
        heading: "২. তথ্য প্ৰক্ৰিয়াকৰণৰ উদ্দেশ্য",
        content: "নাগৰিকৰ পৰিচয় পৰীক্ষণ আৰু জনস্বাৰ্থৰ দাবী সংশ্লিষ্ট কৰ্তৃপক্ষৰ ওচৰলৈ প্ৰেৰণ কৰা।",
      },
      {
        heading: "৩. নাগৰিকৰ অধিকাৰ (অধ্যায় ৩)",
        content: "দফা ১২ ৰ অধীনত নিজৰ একাউণ্ট আৰু আৱেদনসমূহ চিৰদিনৰ বাবে মচি পেলোৱাৰ (Right to Erasure) সম্পূৰ্ণ অধিকাৰ।",
      },
      {
        heading: "৪. সন্মতি প্ৰত্যাহাৰৰ অধিকাৰ (দফা ৬(৪))",
        content: "আপুনি যিকোনো সময়তে দিয়া সন্মতি প্ৰত্যাহাৰ কৰিব পাৰে।",
      },
      {
        heading: "৫. অভিযোগ নিবাৰণ বিষয়া",
        content: "অভিযোগ বিষয়া, SoSign, ইমেইল: grievance@sosign.in (৩০ দিনৰ ভিতৰত সমাধান)।",
      },
      {
        heading: "৬. ভাৰতীয় তথ্য সুৰক্ষা ব'ৰ্ড (DPBI) ত অভিযোগ",
        content: "দফা ১৩(৩) ৰ অধীনত সমস্যা সমাধান নহ'লে ভাৰতীয় তথ্য সুਰক্ষা ব'ৰ্ডৰ কাষ চাপিব পাৰে।",
      },
    ],
  },
};

export default function DpdpMultilingualNoticeModal({ isOpen, onClose, initialLanguage = "en" }) {
  const [selectedLang, setSelectedLang] = useState(initialLanguage);

  if (!isOpen) return null;

  const currentNotice = STATUTORY_NOTICES[selectedLang] || STATUTORY_NOTICES.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-5 border border-indigo-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#3650AD] flex items-center justify-center text-xl shadow-sm shrink-0">
              <FaShieldAlt />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-gray-900">
                  DPDP Act Statutory Privacy Notice
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  8th Schedule
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Notice in Indian Languages under Section 5(3) of DPDP Act 2023
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Language Selector Pills */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FaLanguage className="text-[#3650AD]" />
            <span>Select Eighth Schedule Language (भाषा चुनें):</span>
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-gray-50 rounded-2xl border border-gray-200">
            {EIGHTH_SCHEDULE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang.code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  selectedLang === lang.code
                    ? "bg-[#3650AD] text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-[10px] opacity-75 font-normal">({lang.name})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notice Content Card */}
        <div className="p-4 bg-gradient-to-br from-indigo-50/40 via-white to-pink-50/30 rounded-2xl border border-indigo-100 space-y-4 text-xs text-gray-800">
          <div>
            <h4 className="font-bold text-sm text-[#1a1a2e] mb-0.5">
              {currentNotice.title}
            </h4>
            <p className="text-[11px] text-gray-500">
              {currentNotice.subtitle}
            </p>
          </div>

          <div className="p-2.5 bg-white/80 rounded-xl border border-gray-200 text-[11px]">
            <span className="font-bold text-gray-700">{currentNotice.fiduciaryLabel}</span>{" "}
            <span className="text-gray-900 font-medium">{currentNotice.fiduciaryValue}</span>
          </div>

          <div className="space-y-3 pt-1">
            {currentNotice.sections.map((sec, idx) => (
              <div key={idx} className="space-y-1">
                <h5 className="font-bold text-gray-900 text-[11px] flex items-center gap-1.5">
                  <FaCheckCircle className="text-emerald-600 text-[10px] shrink-0" />
                  <span>{sec.heading}</span>
                </h5>
                <p className="text-gray-600 leading-relaxed pl-4">
                  {sec.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
          <span className="text-[11px] text-gray-400 italic">
            Notice Version: 2026.1-DPDP • Compliant with Indian Law
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#3650AD] hover:bg-blue-800 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
