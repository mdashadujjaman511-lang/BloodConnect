/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Droplets, 
  MessageSquare, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreVertical,
  Activity,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User as UserIcon,
  Phone,
  Heart,
  Scale,
  Stethoscope,
  Edit2,
  Save,
  X,
  Camera,
  ChevronRight,
  ChevronLeft,
  Menu,
  Building2,
  Shield,
  Trash2,
  Send,
  Map,
  Navigation,
  Locate,
  Hospital,
  Trophy,
  ShieldCheck,
  Facebook,
  Youtube,
  Twitter
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { auth, db, storage, signInWithGoogle, handleFirestoreError, OperationType, loginWithEmail, signUpWithEmail, updateUserProfile } from './services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, setDoc, where, addDoc, serverTimestamp, deleteDoc, getDocs, getDoc } from 'firebase/firestore';

// Mock Data
const stats = [
  { label: 'Total Donors', value: '12,450', change: '+12%', icon: Users, color: 'text-blue-600' },
  { label: 'Active Requests', value: '156', change: '+5%', icon: Droplets, color: 'text-red-600' },
  { label: 'Blood Banks', value: '42', change: '0%', icon: MapPin, color: 'text-green-600' },
  { label: 'Successful Donations', value: '8,920', change: '+18%', icon: CheckCircle2, color: 'text-purple-600' },
];

const donationData = [
  { name: 'Jan', donations: 400 },
  { name: 'Feb', donations: 300 },
  { name: 'Mar', donations: 600 },
  { name: 'Apr', donations: 800 },
  { name: 'May', donations: 500 },
  { name: 'Jun', donations: 900 },
  { name: 'Jul', donations: 700 },
  { name: 'Aug', donations: 650 },
  { name: 'Sep', donations: 850 },
  { name: 'Oct', donations: 950 },
  { name: 'Nov', donations: 750 },
  { name: 'Dec', donations: 1000 },
];

const bloodStockData = [
  { group: 'A+', stock: 45 },
  { group: 'A-', stock: 12 },
  { group: 'B+', stock: 38 },
  { group: 'B-', stock: 8 },
  { group: 'O+', stock: 52 },
  { group: 'O-', stock: 5 },
  { group: 'AB+', stock: 15 },
  { group: 'AB-', stock: 3 },
];

const recentRequests = [
  { id: 1, patient: 'Rahim Ahmed', group: 'O+', location: 'Dhaka Medical College', urgency: 'Critical', time: '10m ago' },
  { id: 2, patient: 'Sumaiya Akter', group: 'A-', location: 'Evercare Hospital', urgency: 'Urgent', time: '25m ago' },
  { id: 3, patient: 'Karim Ullah', group: 'B+', location: 'Square Hospital', urgency: 'Normal', time: '1h ago' },
];

const translations = {
  English: {
    dashboard: 'Dashboard',
    donors: 'Donors',
    requests: 'Requests',
    banks: 'Blood Banks',
    ai: 'Bondhu AI',
    admin: 'Admin Panel',
    superAdmin: 'Super Admin',
    donorLabel: 'Donor',
    settings: 'Settings',
    logout: 'Logout',
    search: 'Search donors, requests, hospitals...',
    totalDonors: 'Total Donors',
    activeRequests: 'Active Requests',
    totalRequests: 'Total Requests',
    bloodBanks: 'Blood Banks',
    successfulDonations: 'Successful Donations',
    systemOverview: 'System Overview',
    realTimeStats: 'Real-time statistics for RoktoBondhon ecosystem.',
    createCampaign: 'Create Campaign',
    donationTrends: 'Donation Trends',
    bloodInventory: 'Blood Group Inventory',
    urgentRequests: 'Urgent Blood Requests',
    viewAll: 'View All',
    patient: 'Patient',
    group: 'Group',
    location: 'Location',
    urgency: 'Urgency',
    time: 'Time',
    action: 'Action',
    contactPatient: 'Contact Patient',
    medicalHistory: 'Medical History',
    diseases: 'Diseases',
    medications: 'Medications',
    none: 'None',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email Address',
    password: 'Password',
    name: 'Full Name',
    or: 'OR',
    loginWithGoogle: 'Login with Google',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    createAccount: 'Create Account',
    completeProfile: 'Complete Profile',
    step: 'Step',
    next: 'Next',
    previous: 'Previous',
    division: 'Division',
    district: 'District',
    area: 'Area',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    select: 'Select',
    profileCreating: 'Creating profile...',
    complete: 'Complete',
    medicalHistoryLabel: 'Any diseases? (if any)',
    medicationsLabel: 'Taking any medications?',
    diseasesPlaceholder: 'e.g. Hypertension, Diabetes...',
    medicationsPlaceholder: 'Enter medication names...',
    adminPanel: 'Admin Control Panel',
    manageUsers: 'Manage all users, donors, and blood requests.',
    totalUsers: 'Total Users',
    activeDonors: 'Active Donors',
    userManagement: 'User Management',
    user: 'User',
    role: 'Role',
    wait: 'Please wait...',
    comingSoon: 'Coming Soon',
    aiGreeting: 'Hello! I am Bondhu, your AI assistant. How can I help you manage the RoktoBondhon ecosystem today?',
    aiDemoMode: 'I am currently in demo mode. In the full version, I can help you search for donors, analyze blood stock trends, and moderate requests using the Gemini API.',
    aiAssistant: 'Bondhu AI Assistant',
    online: 'Online',
    aiPlaceholder: 'Ask Bondhu about donors, stock, or requests...',
    createCampaignTitle: 'Create Blood Campaign',
    createCampaignDesc: 'Organize a blood donation drive in your area.',
    campaignTitleLabel: 'Campaign Title',
    campaignTitlePlaceholder: 'e.g. Dhaka University Blood Drive',
    campaignLocationLabel: 'Location',
    campaignLocationPlaceholder: 'e.g. Dhaka University Campus',
    campaignDateLabel: 'Date',
    campaignDescriptionLabel: 'Description',
    campaignDescriptionPlaceholder: 'Tell people about the campaign...',
    createCampaignBtn: 'Create Campaign',
    map: 'Map',
    radius: 'Search Radius',
    km: 'km',
    distance: 'Distance',
    travelTime: 'Travel Time',
    call: 'Call',
    navigate: 'Navigate',
    acceptRequest: 'Accept Request',
    findDonor: 'Find Blood Donor',
    leaderboard: 'Leaderboard',
    callAmbulance: 'Call Ambulance',
    back: 'Back',
    createRequest: 'Create Request',
    requestBlood: 'Request Blood',
    patientName: 'Patient Name',
    bagsNeeded: 'Bags Needed',
    hospitalName: 'Hospital Name',
    urgencyLevel: 'Urgency Level',
    critical: 'Critical',
    urgent: 'Urgent',
    normal: 'Normal',
    donorProfile: 'Donor Profile',
    sendRequest: 'Send Request',
    requestSent: 'Request sent successfully!',
    requestError: 'Failed to send request.',
    message: 'Message',
    messagePlaceholder: 'Write a message to the donor...',
    totalDonorsFound: 'Total donors found',
    bloodGroupFilter: 'Blood Group',
    districtFilter: 'District',
    donationDateFilter: 'Date of Blood Donation',
    donorTypeFilter: 'Donor Type',
    searchDonors: 'Search Donors',
    all: 'All',
    home: 'Home',
    aboutUs: 'About Us',
    addBloodRequest: 'Add Blood Request',
    smsTo: 'SMS to',
    aboutTitle: 'About RoktoBondhon',
    aboutSubtitle: 'Connecting Hearts, Saving Lives',
    aboutDescription: 'RoktoBondhon is a non-profit initiative dedicated to bridging the gap between blood donors and those in urgent need. Our mission is to ensure that no life is lost due to the unavailability of blood.',
    ourMission: 'Our Mission',
    missionOne: 'To create an accessible community of voluntary blood donors.',
    missionTwo: 'To provide a seamless platform for finding blood donors in real-time.',
    missionThree: 'To raise awareness about the importance of regular blood donation.',
    whyChooseUs: 'Why Choose Us?',
    featureOne: 'Verified Donors',
    featureOneDesc: 'We ensure our donor database is reliable and active.',
    featureTwo: 'Real-time Requests',
    featureTwoDesc: 'Urgent requests reach potential donors instantly.',
    featureThree: 'Privacy First',
    featureThreeDesc: 'We value your privacy and handle data with care.',
    community: 'Community',
    communityFeed: 'Community Feed',
    newPost: 'New Post',
    postPlaceholder: 'Share your blood donation experience or any blood-related info...',
    postWithPhoto: 'Post with Photo',
    uploadPhoto: 'Upload Photo',
    post: 'Post',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
    noPosts: 'No posts yet. Be the first to post!',
    imageURL: 'Image URL (optional)',
    notifications: 'Notifications',
    noNotifications: 'No notifications yet.',
    newBloodRequest: 'New Blood Request',
    receivedRequest: 'You have received a new blood donation request from',
    receivedRequests: 'Received Requests',
    sentRequests: 'Sent Requests',
    noReceivedRequests: 'You haven\'t received any direct donor requests yet.',
    noSentRequests: 'You haven\'t sent any direct donor requests yet.',
    markAllRead: 'Mark all as read',
    unread: 'Unread',
  },
  Bangla: {
    dashboard: 'ড্যাশবোর্ড',
    donors: 'দাতা',
    requests: 'অনুরোধ',
    banks: 'ব্লাড ব্যাংক',
    ai: 'বন্ধু এআই',
    admin: 'অ্যাডমিন প্যানেল',
    superAdmin: 'সুপার অ্যাডমিন',
    donorLabel: 'দাতা',
    settings: 'সেটিংস',
    logout: 'লগআউট',
    search: 'দাতা, অনুরোধ, হাসপাতাল খুঁজুন...',
    totalDonors: 'মোট দাতা',
    activeRequests: 'সক্রিয় অনুরোধ',
    totalRequests: 'মোট অনুরোধ',
    bloodBanks: 'ব্লাড ব্যাংক',
    successfulDonations: 'সফল দান',
    systemOverview: 'সিস্টেম ওভারভিউ',
    realTimeStats: 'রক্তবন্ধন ইকোসিস্টেমের রিয়েল-টাইম পরিসংখ্যান।',
    createCampaign: 'ক্যাম্পেইন তৈরি করুন',
    donationTrends: 'দানের প্রবণতা',
    bloodInventory: 'রক্তের গ্রুপের ইনভেন্টরি',
    urgentRequests: 'জরুরী রক্তের অনুরোধ',
    viewAll: 'সব দেখুন',
    patient: 'রোগী',
    group: 'গ্রুপ',
    location: 'অবস্থান',
    urgency: 'জরুরী অবস্থা',
    time: 'সময়',
    action: 'অ্যাকশন',
    contactPatient: 'রোগীর সাথে যোগাযোগ করুন',
    viewLocation: 'অবস্থান দেখুন',
    markCompleted: 'সম্পন্ন হিসেবে চিহ্নিত করুন',
    darkMode: 'ডার্ক মোড',
    language: 'ভাষা',
    notifications: 'বিজ্ঞপ্তি',
    appPreferences: 'অ্যাপ পছন্দসমূহ',
    dangerZone: 'বিপজ্জনক অঞ্চল',
    deleteAccount: 'অ্যাকাউন্ট মুছে ফেলুন',
    pushNotifications: 'পুশ বিজ্ঞপ্তি',
    getNotified: 'আপনার এলাকার জরুরী রক্তের অনুরোধ সম্পর্কে বিজ্ঞপ্তি পান।',
    useDarkTheme: 'অ্যাপ্লিকেশনের জন্য একটি ডার্ক থিম ব্যবহার করুন।',
    chooseLanguage: 'আপনার পছন্দের ভাষা চয়ন করুন।',
    myProfile: 'আমার প্রোফাইল',
    editProfile: 'এডিট প্রোফাইল',
    cancel: 'বাতিল',
    save: 'সেভ করুন',
    saving: 'সেভ হচ্ছে...',
    bloodGroup: 'রক্তের গ্রুপ',
    status: 'স্ট্যাটাস',
    eligible: 'যোগ্য',
    notEligible: 'অযোগ্য',
    available: 'উপলব্ধ',
    interestedInDonating: 'রক্তদানে আগ্রহী?',
    totalDonations: 'মোট রক্তদান',
    times: 'বার',
    logDonation: 'রেকর্ড করুন',
    lastDonation: 'শেষ রক্তদান',
    never: 'কখনো না',
    personalInfo: 'ব্যক্তিগত তথ্য',
    phone: 'ফোন নম্বর',
    dob: 'জন্ম তারিখ',
    gender: 'লিঙ্গ',
    weight: 'ওজন',
    medicalHistory: 'চিকিৎসা ইতিহাস',
    diseases: 'রোগ',
    medications: 'ওষুধ',
    none: 'নেই',
    login: 'লগইন',
    signup: 'সাইন আপ',
    email: 'ইমেইল ঠিকানা',
    password: 'পাসওয়ার্ড',
    bloodGroupFilter: 'রক্তের গ্রুপ',
    districtFilter: 'জেলা',
    donationDateFilter: 'রক্তদানের তারিখ',
    donorTypeFilter: 'দাতার ধরন',
    searchDonors: 'দাতা খুঁজুন',
    all: 'সব',
    name: 'পুরো নাম',
    or: 'অথবা',
    loginWithGoogle: 'Google দিয়ে লগইন',
    noAccount: 'অ্যাকাউন্ট নেই?',
    hasAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    createAccount: 'অ্যাকাউন্ট তৈরি করুন',
    wait: 'অপেক্ষা করুন...',
    completeProfile: 'প্রোফাইল সম্পন্ন করুন',
    step: 'ধাপ',
    next: 'পরবর্তী',
    previous: 'পূর্ববর্তী',
    division: 'বিভাগ',
    district: 'জেলা',
    area: 'এলাকা',
    male: 'পুরুষ',
    female: 'মহিলা',
    other: 'অন্যান্য',
    select: 'নির্বাচন করুন',
    profileCreating: 'প্রোফাইল তৈরি হচ্ছে...',
    complete: 'সম্পন্ন করুন',
    medicalHistoryLabel: 'কোনো রোগ আছে কি? (যদি থাকে)',
    medicationsLabel: 'বর্তমানে কোনো ঔষধ খাচ্ছেন?',
    diseasesPlaceholder: 'উদা: উচ্চ রক্তচাপ, ডায়াবেটিস...',
    medicationsPlaceholder: 'ঔষধের নাম লিখুন...',
    adminPanel: 'অ্যাডমিন কন্ট্রোল প্যানেল',
    manageUsers: 'সব ব্যবহারকারী, দাতা এবং রক্তের অনুরোধ পরিচালনা করুন।',
    totalUsers: 'মোট ব্যবহারকারী',
    activeDonors: 'সক্রিয় দাতা',
    userManagement: 'ব্যবহারকারী ব্যবস্থাপনা',
    user: 'ব্যবহারকারী',
    role: 'ভূমিকা',
    comingSoon: 'শীঘ্রই আসছে',
    aiGreeting: 'হ্যালো! আমি বন্ধু, আপনার এআই সহকারী। আজ আপনাকে রক্তবন্ধন ইকোসিস্টেম পরিচালনায় আমি কীভাবে সাহায্য করতে পারি?',
    aiDemoMode: 'আমি বর্তমানে ডেমো মোডে আছি। পূর্ণ সংস্করণে, আমি আপনাকে দাতা খুঁজতে, রক্তের স্টকের প্রবণতা বিশ্লেষণ করতে এবং জেমিনি এপিআই ব্যবহার করে অনুরোধগুলি মডারেট করতে সাহায্য করতে পারি।',
    aiAssistant: 'বন্ধু এআই সহকারী',
    online: 'অনলাইন',
    aiPlaceholder: 'দাতা, স্টক বা অনুরোধ সম্পর্কে বন্ধুকে জিজ্ঞাসা করুন...',
    createCampaignTitle: 'রক্তদান ক্যাম্পেইন তৈরি করুন',
    createCampaignDesc: 'আপনার এলাকায় একটি রক্তদান ড্রাইভ আয়োজন করুন।',
    campaignTitleLabel: 'ক্যাম্পেইন শিরোনাম',
    campaignTitlePlaceholder: 'উদা: ঢাকা বিশ্ববিদ্যালয় রক্তদান ড্রাইভ',
    campaignLocationLabel: 'অবস্থান',
    campaignLocationPlaceholder: 'উদা: ঢাকা বিশ্ববিদ্যালয় ক্যাম্পাস',
    campaignDateLabel: 'তারিখ',
    campaignDescriptionLabel: 'বর্ণনা',
    campaignDescriptionPlaceholder: 'ক্যাম্পেইন সম্পর্কে মানুষকে জানান...',
    createCampaignBtn: 'ক্যাম্পেইন তৈরি করুন',
    map: 'ম্যাপ',
    radius: 'অনুসন্ধানের ব্যাসার্ধ',
    km: 'কিমি',
    distance: 'দূরত্ব',
    travelTime: 'ভ্রমণের সময়',
    call: 'কল',
    navigate: 'নেভিগেট',
    acceptRequest: 'অনুরোধ গ্রহণ করুন',
    findDonor: 'রক্তদাতা খুঁজুন',
    leaderboard: 'লিডারবোর্ড',
    callAmbulance: 'অ্যাম্বুলেন্স ডাকুন',
    back: 'ফিরে যান',
    createRequest: 'অনুরোধ তৈরি করুন',
    requestBlood: 'রক্তের অনুরোধ',
    patientName: 'রোগীর নাম',
    bagsNeeded: 'প্রয়োজনীয় ব্যাগ',
    hospitalName: 'হাসপাতালের নাম',
    urgencyLevel: 'জরুরী অবস্থা',
    critical: 'সংকটজনক',
    urgent: 'জরুরী',
    normal: 'স্বাভাবিক',
    donorProfile: 'দাতার প্রোফাইল',
    sendRequest: 'অনুরোধ পাঠান',
    requestSent: 'অনুরোধ সফলভাবে পাঠানো হয়েছে!',
    requestError: 'অনুরোধ পাঠাতে ব্যর্থ হয়েছে।',
    message: 'বার্তা',
    messagePlaceholder: 'দাতার জন্য একটি বার্তা লিখুন...',
    totalDonorsFound: 'সর্বমোট দাতা পাওয়া গেছে',
    home: 'হোম',
    aboutUs: 'আমাদের সম্পর্কে',
    addBloodRequest: 'রক্তের অনুরোধ দিন',
    smsTo: 'এসএমএস করুন',
    aboutTitle: 'রক্তবন্ধন সম্পর্কে',
    aboutSubtitle: 'হৃদয় দিয়ে হৃদয়কে জুড়ে জীবন বাঁচাই',
    aboutDescription: 'রক্তবন্ধন একটি অলাভজনক উদ্যোগ যা রক্তদাতা এবং যাদের জরুরী রক্তের প্রয়োজন তাদের মধ্যে সেতুবন্ধন তৈরির জন্য কাজ করে। আমাদের লক্ষ্য হলো রক্তের অভাবে যেন কোনো প্রাণ না হারায় তা নিশ্চিত করা।',
    ourMission: 'আমাদের লক্ষ্য',
    missionOne: 'স্বেচ্ছায় রক্তদাতাদের একটি সহজলভ্য সম্প্রদায় তৈরি করা।',
    missionTwo: 'রিয়েল-টাইমে রক্তদাতা খোঁজার জন্য একটি নিরবচ্ছিন্ন প্ল্যাটফর্ম প্রদান করা।',
    missionThree: 'নিয়মিত রক্তদানের গুরুত্ব সম্পর্কে সচেতনতা বৃদ্ধি করা।',
    whyChooseUs: 'কেন আমাদের বেছে নেবেন?',
    featureOne: 'যাচাইকৃত দাতা',
    featureOneDesc: 'আমরা নিশ্চিত করি যে আমাদের দাতা ডাটাবেস নির্ভরযোগ্য এবং সক্রিয়।',
    featureTwo: 'রিয়েল-টাইম অনুরোধ',
    featureTwoDesc: 'জরুরী অনুরোধগুলো তাৎক্ষণিকভাবে সম্ভাব্য দাতাদের কাছে পৌঁছায়।',
    featureThree: 'গোপনীয়তা রক্ষা',
    featureThreeDesc: 'আমরা আপনার গোপনীয়তাকে মূল্যায়ন করি এবং যত্ন সহকারে তথ্য পরিচালনা করি।',
    community: 'কমিউনিটি',
    communityFeed: 'কমিউনিটি ফিড',
    newPost: 'নতুন পোস্ট',
    postPlaceholder: 'আপনার রক্তদানের অভিজ্ঞতা বা রক্ত বিষয়ক তথ্য শেয়ার করুন...',
    postWithPhoto: 'ছবিসহ পোস্ট',
    uploadPhoto: 'ছবি আপলোড',
    post: 'পোস্ট',
    like: 'লাইক',
    comment: 'কমেন্ট',
    share: 'শেয়ার',
    noPosts: 'এখনো কোনো পোস্ট নেই। প্রথম পোস্টটি আপনিই করুন!',
    imageURL: 'ছবির লিঙ্ক (ঐচ্ছিক)',
    noNotifications: 'এখনো কোনো নোটিফিকেশন নেই।',
    newBloodRequest: 'নতুন রক্তের অনুরোধ',
    receivedRequest: 'আপনি একটি নতুন রক্তদানের অনুরোধ পেয়েছেন ',
    receivedRequests: 'প্রাপ্ত অনুরোধসমূহ',
    sentRequests: 'প্রেরিত অনুরোধসমূহ',
    noReceivedRequests: 'আপনি এখনও কোনো সরাসরি অনুরোধ পাননি।',
    noSentRequests: 'আপনি এখনও কাউকে সরাসরি অনুরোধ পাঠাননি।',
    markAllRead: 'সবগুলো পড়া হয়েছে হিসেবে চিহ্নিত করুন',
    unread: 'অপঠিত',
  }
};

function TopNav({ t, language, activeTab, setActiveTab, user, unreadCount }: { t: any, language: string, activeTab: string, setActiveTab: (tab: string) => void, user: any, unreadCount: number }) {
  return (
    <div className="w-full shrink-0 flex flex-col z-[100] relative">
      {/* Top Small Bar */}
      <div className="w-full bg-blood-red text-white py-2 px-4 md:px-8 flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
        <div className="flex items-center gap-4">
          <a href="https://www.facebook.com/md.mahadi.hasan.278404" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity"><Facebook className="w-4 h-4 fill-white border border-white rounded-full p-0.5" /></a>
          <a href="https://www.youtube.com/@MdMahadiHasan-eb8xo" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity"><Youtube className="w-4 h-4" /></a>
          <a href="#" className="hover:opacity-80 transition-opacity"><Twitter className="w-4 h-4 fill-white" /></a>
        </div>
        <div className="text-xs font-bold tracking-wider">
          {t.smsTo} 01608171029
        </div>
      </div>
      
      {/* Main Nav Bar */}
      <div className="w-full bg-blood-red text-white py-4 px-4 md:px-8 flex items-center justify-between gap-4 shadow-xl">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart className="text-white w-6 h-6 fill-white/80" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            {language === 'Bangla' ? 'ব্লাডকানেক্ট' : 'BloodConnect'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          <button className={cn("font-bold hover:text-red-100 transition-colors uppercase text-sm tracking-wide", activeTab === 'dashboard' ? "underline underline-offset-8" : "")} onClick={() => setActiveTab('dashboard')}>{t.home}</button>
          <button className={cn("font-bold hover:text-red-100 transition-colors uppercase text-sm tracking-wide", activeTab === 'community' ? "underline underline-offset-8" : "")} onClick={() => setActiveTab('community')}>{t.community}</button>
          <button className={cn("font-bold hover:text-red-100 transition-colors uppercase text-sm tracking-wide", activeTab === 'about' ? "underline underline-offset-8" : "")} onClick={() => setActiveTab('about')}>{t.aboutUs}</button>
          <button className={cn("font-bold hover:text-red-100 transition-colors uppercase text-sm tracking-wide", activeTab === 'donors' ? "underline underline-offset-8" : "")} onClick={() => setActiveTab('donors')}>{t.donors}</button>
          <button className={cn("font-bold hover:text-red-100 transition-colors uppercase text-sm tracking-wide", activeTab === 'requests' ? "underline underline-offset-8" : "")} onClick={() => setActiveTab('requests')}>{t.addBloodRequest}</button>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-white p-2 hover:bg-white/10 rounded-full transition-colors relative" onClick={() => setActiveTab('notifications')}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-white text-blood-red text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border border-blood-red/20 shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <div className="h-4 w-[1px] bg-white/30 mx-2 hidden sm:block"></div>
          {!user ? (
            <div className="flex items-center gap-4">
              <button className="text-white font-bold hover:text-red-100 transition-colors text-sm uppercase">{t.signup}</button>
              <button className="text-white font-bold hover:text-red-100 transition-colors text-sm uppercase">{t.login}</button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setActiveTab('profile')}
            >
              <div className="w-8 h-8 rounded-full border-2 border-white/50 overflow-hidden bg-white/10">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <span className="hidden sm:block font-bold text-sm truncate max-w-[100px]">{user.displayName || 'Me'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profileUid, setProfileUid] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [campaignData, setCampaignData] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    description: '',
    selectedFile: null as File | null,
    previewURL: '',
    photoURL: ''
  });

  const handleCreateCampaign = async () => {
    if (!campaignData.title || !campaignData.location || !campaignData.date) return;
    setIsUploading(true);
    try {
      let finalPhotoURL = '';
      if (campaignData.selectedFile) {
        const fileRef = ref(storage, `campaigns/${Date.now()}_${campaignData.selectedFile.name}`);
        const uploadResult = await uploadBytes(fileRef, campaignData.selectedFile);
        finalPhotoURL = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'campaigns'), {
        title: campaignData.title,
        location: campaignData.location,
        date: campaignData.date,
        time: campaignData.time,
        description: campaignData.description,
        photoURL: finalPhotoURL,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: 'upcoming'
      });
      setShowCampaignModal(false);
      setCampaignData({ title: '', location: '', date: '', time: '', description: '', selectedFile: null, previewURL: '', photoURL: '' });
      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
      handleFirestoreError(err, OperationType.CREATE, 'campaigns');
    }
  };
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postData, setPostData] = useState<{
    content: string;
    imageURL: string;
    selectedFile: File | null;
    previewURL: string;
  }>({
    content: '',
    imageURL: '',
    selectedFile: null,
    previewURL: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const handleCreatePost = async () => {
    if (!postData.content) return;
    setIsUploading(true);
    try {
      let finalImageURL = postData.imageURL;

      if (postData.selectedFile) {
        const fileRef = ref(storage, `posts/${user.uid}/${Date.now()}_${postData.selectedFile.name}`);
        const uploadResult = await uploadBytes(fileRef, postData.selectedFile);
        finalImageURL = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'posts'), {
        authorUid: user.uid,
        authorName: userData?.name || user.displayName || 'Anonymous',
        authorPhoto: userData?.photoURL || user.photoURL || '',
        content: postData.content,
        imageURL: finalImageURL,
        likes: [],
        commentsCount: 0,
        createdAt: serverTimestamp()
      });
      setShowPostModal(false);
      setPostData({ content: '', imageURL: '', selectedFile: null, previewURL: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'posts');
    } finally {
      setIsUploading(false);
    }
  };
  const [requestData, setRequestData] = useState({
    patient: '',
    bloodGroup: '',
    location: '',
    bags: 1,
    urgency: 'Normal',
    phone: ''
  });

  const handleCreateRequest = async () => {
    if (!requestData.patient || !requestData.bloodGroup || !requestData.location || !requestData.phone) return;
    try {
      await addDoc(collection(db, 'requests'), {
        ...requestData,
        requesterUid: user.uid,
        createdAt: serverTimestamp(),
        status: 'active'
      });

      // Notify all relevant donors
      const donorsSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'donor'), where('bloodGroup', '==', requestData.bloodGroup)));
      const notificationPromises = donorsSnapshot.docs.map(donorDoc => 
        addDoc(collection(db, 'notifications'), {
          recipientUid: donorDoc.id,
          title: t.newBloodRequest,
          body: `${requestData.patient} needs ${requestData.bloodGroup} blood at ${requestData.location}`,
          type: 'request',
          relatedId: 'requests', // Or link to the specific request
          isRead: false,
          createdAt: serverTimestamp()
        })
      );
      await Promise.all(notificationPromises);

      setShowRequestModal(false);
      setRequestData({ patient: '', bloodGroup: '', location: '', bags: 1, urgency: 'Normal', phone: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'requests');
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // @ts-ignore
  window.showToast = showToast;

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [language, setLanguage] = useState<'English' | 'Bangla'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'English' | 'Bangla') || 'Bangla';
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = translations[language];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Check if super admin
        if (user.email === 'mdashadujjaman511@gmail.com') {
          setIsAdmin(true);
        }

        // Fetch user profile data
        const userRef = doc(db, 'users', user.uid);
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            if (data.role === 'admin') setIsAdmin(true);
          } else {
            setUserData(null);
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUserData(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [language]);

  // Notification listener
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notifications'),
      where('recipientUid', '==', user.uid),
      where('isRead', '==', false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.docs.length);
      // Optional: Auto-toast on new notification
      snap.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.createdAt && (Date.now() - data.createdAt.toMillis() < 10000)) {
            showToast(data.title);
          }
        }
      });
    });
    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen bg-bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blood-red"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav t={t} language={language} activeTab={activeTab} setActiveTab={setActiveTab} user={null} unreadCount={0} />
        <LoginView t={t} />
      </div>
    );
  }

  // If user is logged in but has no profile data, show registration
  if (!userData && activeTab !== 'registration') {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNav t={t} language={language} activeTab={activeTab} setActiveTab={setActiveTab} user={user} unreadCount={unreadCount} />
        <RegistrationView onComplete={() => setActiveTab('dashboard')} t={t} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans text-text-primary overflow-hidden">
      <TopNav t={t} language={language} activeTab={activeTab} setActiveTab={setActiveTab} user={user} unreadCount={unreadCount} />
      <div className="flex flex-1 overflow-hidden">
        {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2",
              toast.type === 'success' ? "bg-green-500 text-white" : "bg-blood-red text-white"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 glass-card border-r-0 flex flex-col m-4 rounded-3xl transition-transform duration-300 lg:translate-x-0 cursor-default",
        isSidebarOpen ? "translate-x-0" : "-translate-x-[120%]"
      )}>
        <div className="px-6 pt-6 pb-2 flex items-center justify-end">
          <button 
            className="lg:hidden p-2 text-text-secondary hover:bg-white/10 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
          <NavItem 
            icon={LayoutDashboard} 
            label={t.dashboard} 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={Users} 
            label={t.community} 
            active={activeTab === 'community'} 
            onClick={() => { setActiveTab('community'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={Map} 
            label={t.map} 
            active={activeTab === 'map'} 
            onClick={() => { setActiveTab('map'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={UserIcon} 
            label={t.myProfile} 
            active={activeTab === 'profile'} 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={Users} 
            label={t.donors} 
            active={activeTab === 'donors'} 
            onClick={() => { setActiveTab('donors'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={Droplets} 
            label={t.requests} 
            active={activeTab === 'requests'} 
            onClick={() => { setActiveTab('requests'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={MapPin} 
            label={t.banks} 
            active={activeTab === 'banks'} 
            onClick={() => { setActiveTab('banks'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={Bell} 
            label={t.notifications} 
            active={activeTab === 'notifications'} 
            onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={MessageSquare} 
            label={t.ai} 
            active={activeTab === 'ai'} 
            onClick={() => { setActiveTab('ai'); setIsSidebarOpen(false); }} 
          />
          {isAdmin && (
            <NavItem 
              icon={Settings} 
              label={t.admin} 
              active={activeTab === 'admin'} 
              onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }} 
            />
          )}
        </nav>

        <div className="p-4 border-t border-glass-border space-y-2">
          {userData && (
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-xl mb-2">
              <span className="text-xs font-medium text-text-secondary">{t.available}</span>
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'users', user.uid), { isAvailable: !userData.isAvailable });
                  } catch (err) {
                    handleFirestoreError(err, OperationType.UPDATE, 'users');
                  }
                }}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-colors",
                  userData.isAvailable ? "bg-green-500" : "bg-gray-600"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  userData.isAvailable ? "right-1" : "left-1"
                )}></div>
              </button>
            </div>
          )}
          <NavItem 
            icon={Settings} 
            label={t.settings} 
            active={activeTab === 'settings'} 
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} 
          />
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 glass-card border-none flex items-center justify-between px-4 lg:px-8 m-4 mb-0 rounded-2xl shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              className="lg:hidden p-2 text-text-secondary hover:bg-white/10 rounded-lg shrink-0"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            {activeTab !== 'dashboard' && (
              <button 
                className="p-2 text-text-secondary hover:bg-white/10 rounded-lg flex items-center gap-2 transition-all shrink-0"
                onClick={() => setActiveTab('dashboard')}
              >
                <ChevronLeft className="w-6 h-6" />
                <span className="text-sm font-medium hidden sm:block">{t.back}</span>
              </button>
            )}
            <div className="relative hidden sm:block w-40 md:w-96 flex-shrink">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input 
                type="text" 
                placeholder={t.search} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-glass-border rounded-lg text-sm focus:ring-2 focus:ring-blood-red outline-none transition-all placeholder:text-text-secondary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setActiveTab('notifications')}
              className="p-2 text-text-secondary hover:bg-white/10 rounded-lg relative transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blood-red rounded-full border-2 border-bg-dark"></span>}
            </button>
            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-glass-border cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="text-right hidden xs:block">
                <p className="text-xs sm:text-sm font-semibold truncate max-w-[100px]">{userData?.name || user.displayName || 'User'}</p>
                <p className={cn("text-[8px] sm:text-[10px] font-bold uppercase tracking-widest", isAdmin ? "text-blood-red" : "text-text-secondary")}>
                  {isAdmin ? t.superAdmin : (userData?.bloodGroup || t.donorLabel)}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-glass-border">
                <img 
                  src={userData?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${userData?.name || user.displayName || 'User'}&background=random`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className={cn("flex-1 overflow-y-auto pt-4", activeTab === 'map' ? "p-0" : "p-4 lg:p-8")}>
          {activeTab === 'dashboard' && <DashboardView onCreateCampaign={() => setShowCampaignModal(true)} t={t} searchQuery={searchQuery} setActiveTab={setActiveTab} isAdmin={isAdmin} setSelectedCampaign={setSelectedCampaign} language={language} />}
          {activeTab === 'community' && <CommunityFeedView t={t} onNewPost={() => setShowPostModal(true)} isAdmin={isAdmin} />}
          {activeTab === 'about' && <AboutUsView t={t} />}
          {activeTab === 'map' && <MapView t={t} language={language} />}
          {activeTab === 'profile' && <ProfileView userData={profileUid === user.uid ? userData : null} userId={profileUid || user.uid} t={t} language={language} isAdmin={isAdmin} />}
          {activeTab === 'donors' && <DonorsView t={t} searchQuery={searchQuery} userData={userData} />}
          {activeTab === 'requests' && <RequestsView t={t} searchQuery={searchQuery} onCreateRequest={() => setShowRequestModal(true)} />}
          {activeTab === 'notifications' && <NotificationsView t={t} setActiveTab={setActiveTab} setProfileUid={setProfileUid} />}
          {activeTab === 'leaderboard' && <LeaderboardView t={t} />}
          {activeTab === 'banks' && <BloodBanksView t={t} searchQuery={searchQuery} />}
          {activeTab === 'ai' && <AIView t={t} />}
          {activeTab === 'admin' && <AdminPanelView t={t} />}
          {activeTab === 'donations' && <DonationsView t={t} user={user} userData={userData} />}
          {activeTab === 'settings' && (
            <SettingsView 
              userData={userData} 
              userId={user.uid} 
              darkMode={darkMode} 
              setDarkMode={setDarkMode} 
              language={language} 
              setLanguage={setLanguage}
              t={t}
              setActiveTab={setActiveTab}
            />
          )}
        </div>

        {/* Campaign Modal */}
        {showCampaignModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCampaignModal(false)}
          >
            <div 
              className="glass-card w-full max-w-md p-0 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 pb-4 relative">
                <button 
                  onClick={() => setShowCampaignModal(false)}
                  className="absolute right-6 top-6 text-text-secondary hover:text-text-primary transition-colors z-50"
                >
                  <X className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold mb-2">{t.createCampaignTitle}</h3>
                <p className="text-text-secondary text-sm">{t.createCampaignDesc}</p>
              </div>
              
              <div className="p-8 pt-4 overflow-y-auto">
                <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.campaignTitleLabel}</label>
                  <input 
                    type="text" 
                    value={campaignData.title}
                    onChange={(e) => setCampaignData({...campaignData, title: e.target.value})}
                    placeholder={t.campaignTitlePlaceholder} 
                    className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.campaignLocationLabel}</label>
                  <input 
                    type="text" 
                    value={campaignData.location}
                    onChange={(e) => setCampaignData({...campaignData, location: e.target.value})}
                    placeholder={t.campaignLocationPlaceholder} 
                    className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.campaignDateLabel}</label>
                    <input 
                      type="date" 
                      value={campaignData.date}
                      onChange={(e) => setCampaignData({...campaignData, date: e.target.value})}
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.time}</label>
                    <input 
                      type="time" 
                      value={campaignData.time}
                      onChange={(e) => setCampaignData({...campaignData, time: e.target.value})}
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.campaignDescriptionLabel}</label>
                  <textarea 
                    value={campaignData.description}
                    onChange={(e) => setCampaignData({...campaignData, description: e.target.value})}
                    placeholder={t.campaignDescriptionPlaceholder} 
                    className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red min-h-[100px]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Campaign Photo</label>
                  <label className="flex items-center gap-2 w-full bg-bg-dark border border-glass-border rounded-xl px-4 py-3 text-sm cursor-pointer hover:border-blood-red/50 transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCampaignData({...campaignData, selectedFile: file, previewURL: URL.createObjectURL(file)});
                        }
                      }}
                      className="hidden" 
                    />
                    <span className="text-text-secondary">{campaignData.selectedFile ? campaignData.selectedFile.name : 'Choose a file'}</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Donation Details</label>
                  <p className="text-sm text-text-primary bg-bg-dark border border-glass-border rounded-xl px-4 py-3">
                    Bkash/Nagad: 01608171029
                  </p>
                </div>
                
                <button 
                  onClick={handleCreateCampaign}
                  className="w-full bg-blood-red text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-900/40 mt-4"
                >
                  {t.createCampaignBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-md p-8 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in duration-300">
              <button 
                onClick={() => setShowRequestModal(false)}
                className="absolute right-6 top-6 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold mb-2">{t.requestBlood}</h3>
              <p className="text-text-secondary text-sm mb-6">{language === 'Bangla' ? 'জরুরী রক্তের জন্য অনুরোধ ফর্মটি পূরণ করুন।' : 'Fill out the form to request blood urgently.'}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.patientName}</label>
                  <input 
                    type="text" 
                    value={requestData.patient}
                    onChange={(e) => setRequestData({...requestData, patient: e.target.value})}
                    placeholder={language === 'Bangla' ? 'রোগীর নাম লিখুন' : 'Enter patient name'} 
                    className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.bloodGroup}</label>
                    <select 
                      value={requestData.bloodGroup}
                      onChange={(e) => setRequestData({...requestData, bloodGroup: e.target.value})}
                      className="w-full bg-bg-dark border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red text-text-primary"
                    >
                      <option value="" className="bg-bg-dark">{t.select}</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                        <option key={g} value={g} className="bg-bg-dark">{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.bagsNeeded}</label>
                    <input 
                      type="number" 
                      min="1"
                      value={requestData.bags}
                      onChange={(e) => setRequestData({...requestData, bags: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.hospitalName}</label>
                  <input 
                    type="text" 
                    value={requestData.location}
                    onChange={(e) => setRequestData({...requestData, location: e.target.value})}
                    placeholder={language === 'Bangla' ? 'হাসপাতালের নাম ও এলাকা' : 'Hospital name and area'} 
                    className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.phone}</label>
                    <input 
                      type="tel" 
                      value={requestData.phone}
                      onChange={(e) => setRequestData({...requestData, phone: e.target.value})}
                      placeholder="017XXXXXXXX" 
                      className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-text-secondary mb-1">{t.urgencyLevel}</label>
                    <select 
                      value={requestData.urgency}
                      onChange={(e) => setRequestData({...requestData, urgency: e.target.value})}
                      className="w-full bg-bg-dark border border-glass-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red text-text-primary"
                    >
                      <option value="Normal" className="bg-bg-dark">{t.normal}</option>
                      <option value="Urgent" className="bg-bg-dark">{t.urgent}</option>
                      <option value="Critical" className="bg-bg-dark">{t.critical}</option>
                    </select>
                  </div>
                </div>
                
                <button 
                  onClick={handleCreateRequest}
                  className="w-full bg-blood-red text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all shadow-lg shadow-red-900/40 mt-4"
                >
                  {t.createRequest}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Post Modal */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300">
              <button 
                onClick={() => setShowPostModal(false)}
                className="absolute right-6 top-6 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-bold mb-2">{t.newPost}</h3>
              <p className="text-text-secondary text-sm mb-6">{language === 'Bangla' ? 'কমিউনিটির সাথে আপনার বার্তা শেয়ার করুন।' : 'Share your thoughts with the community.'}</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-blood-red/20">
                    <img 
                      src={userData?.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${userData?.name || user.displayName || 'User'}&background=random`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{userData?.name || user.displayName || 'User'}</p>
                  </div>
                </div>

                <textarea 
                  value={postData.content}
                  onChange={(e) => setPostData({...postData, content: e.target.value})}
                  placeholder={t.postPlaceholder}
                  className="w-full bg-white/5 border border-glass-border rounded-2xl px-4 py-4 text-sm outline-none focus:ring-2 focus:ring-blood-red min-h-[150px] resize-none text-text-primary"
                />

                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase text-text-secondary">
                    {t.uploadPhoto}
                  </label>
                  
                  {postData.previewURL ? (
                    <div className="relative rounded-2xl overflow-hidden border border-glass-border aspect-video group shadow-xl">
                      <img src={postData.previewURL} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => setPostData({...postData, selectedFile: null, previewURL: ''})}
                        className="absolute top-3 right-3 bg-black/60 p-2 rounded-full text-white hover:bg-black/80 backdrop-blur-sm transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => document.getElementById('post-image-upload')?.click()}
                      className="border-2 border-dashed border-glass-border rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 hover:border-blood-red/50 transition-all group lg:min-h-[200px]"
                    >
                      <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-blood-red/10 transition-all">
                        <Camera className="w-8 h-8 text-text-secondary group-hover:text-blood-red" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-text-primary mb-1">{t.uploadPhoto}</p>
                        <p className="text-xs text-text-secondary">{language === 'Bangla' ? 'গ্যালারি থেকে ছবি নির্বাচন করুন' : 'Choose a photo from gallery'}</p>
                      </div>
                      <input 
                        id="post-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPostData({
                              ...postData,
                              selectedFile: file,
                              previewURL: URL.createObjectURL(file)
                            });
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleCreatePost}
                  disabled={!postData.content || isUploading}
                  className="w-full bg-blood-red text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl shadow-red-900/40 mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      {t.post}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  </div>
  );
}

function RegistrationView({ onComplete, t }: { onComplete: () => void, t: any }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName || '',
    phone: auth.currentUser?.email?.endsWith('@rokto.com') ? auth.currentUser.email.split('@')[0] : '',
    bloodGroup: '',
    dob: '',
    gender: '',
    weight: '',
    division: '',
    district: '',
    area: '',
    diseases: '',
    medications: '',
    photoURL: auth.currentUser?.photoURL || '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      await setDoc(userRef, {
        uid: auth.currentUser!.uid,
        email: auth.currentUser!.email,
        name: formData.name,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        dob: formData.dob,
        gender: formData.gender,
        weight: Number(formData.weight),
        location: {
          division: formData.division,
          district: formData.district,
          area: formData.area,
          latitude: formData.latitude ? Number(formData.latitude) : null,
          longitude: formData.longitude ? Number(formData.longitude) : null
        },
        medicalHistory: {
          diseases: formData.diseases,
          medications: formData.medications
        },
        photoURL: formData.photoURL,
        isAvailable: true,
        totalDonations: 0,
        lastDonationDate: null,
        role: 'donor',
        createdAt: new Date().toISOString()
      });
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4 py-12">
      <div className="glass-card p-8 rounded-[40px] shadow-2xl max-w-2xl w-full border border-glass-border/50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blood-red/5 blur-[100px] rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t.completeProfile}</h1>
              <p className="text-text-secondary text-sm">{t.step} {step} / 3</p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("w-8 h-1.5 rounded-full transition-all", i <= step ? "bg-blood-red" : "bg-white/10")}></div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.name}</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                    placeholder={t.name}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.phone}</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                    placeholder="017XXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.bloodGroup}</label>
                  <select 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red text-text-primary"
                  >
                    <option value="" className="bg-bg-dark">{t.select}</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(g => (
                      <option key={g} value={g} className="bg-bg-dark">{g}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.dob}</label>
                  <input 
                    type="date" 
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">Photo URL (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.photoURL || ''}
                    onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="bg-blood-red text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition-all"
                >
                  {t.next} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.gender}</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red text-text-primary"
                  >
                    <option value="" className="bg-bg-dark">{t.select}</option>
                    <option value="Male" className="bg-bg-dark">{t.male}</option>
                    <option value="Female" className="bg-bg-dark">{t.female}</option>
                    <option value="Other" className="bg-bg-dark">{t.other}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.weight} (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                    placeholder="e.g. 65"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.division}</label>
                  <input 
                    type="text" 
                    value={formData.division}
                    onChange={(e) => setFormData({...formData, division: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                    placeholder="e.g. Dhaka"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.district}</label>
                  <input 
                    type="text" 
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                    placeholder="e.g. Dhaka"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.area}</label>
                  <input 
                    type="text" 
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                    placeholder="e.g. Mirpur-10"
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-secondary ml-1 uppercase">
                      Exact Location (Lat/Lng)
                    </label>
                    <button 
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setFormData({
                              ...formData,
                              latitude: pos.coords.latitude.toString(),
                              longitude: pos.coords.longitude.toString()
                            });
                          });
                        }
                      }}
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Locate className="w-3 h-3" /> Get Current Location
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" 
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                      placeholder="Latitude"
                      step="any"
                    />
                    <input 
                      type="number" 
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red"
                      placeholder="Longitude"
                      step="any"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="text-text-secondary px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white/5 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> {t.previous}
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="bg-blood-red text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition-all"
                >
                  {t.next} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.medicalHistoryLabel}</label>
                  <textarea 
                    value={formData.diseases}
                    onChange={(e) => setFormData({...formData, diseases: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red min-h-[100px]"
                    placeholder={t.diseasesPlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary ml-1 uppercase">{t.medicationsLabel}</label>
                  <textarea 
                    value={formData.medications}
                    onChange={(e) => setFormData({...formData, medications: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-glass-border rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blood-red min-h-[100px]"
                    placeholder={t.medicationsPlaceholder}
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setStep(2)}
                  className="text-text-secondary px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white/5 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> {t.previous}
                </button>
                <button 
                  onClick={handleRegister}
                  disabled={loading}
                  className="bg-blood-red text-white px-10 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-red-900/40 disabled:opacity-50"
                >
                  {loading ? t.profileCreating : t.complete}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileView({ userData, userId, t, language, isAdmin }: { userData: any, userId: string, t: any, language: string, isAdmin: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(userData);
  const [loading, setLoading] = useState(!userData);

  useEffect(() => {
    if (userData) {
      setData(userData);
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', userId), (snap) => {
      setData({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [userData, userId]);

  const [editData, setEditData] = useState(data);

  useEffect(() => {
    setEditData(data);
  }, [data]);

  const [uploadingImage, setUploadingImage] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("আপনার ইমেজ সাইজটি ২ মেগাবাইটের বেশি। দয়া করে ২ মেগাবাইটের কম সাইজের ছোট ইমেজ আপলোড করুন।");
      return;
    }

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `profiles/${userId}/avatar_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditData(prev => ({...prev, photoURL: url}));
    } catch (err) {
      console.error("Error uploading image: ", err);
      alert("ছবিটি আপলোড হতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRateDonor = async (rating: number) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), { rating });
      setData(prev => ({...prev, rating }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Create a clean object with only allowed fields to update
      const updatePayload = {
        name: editData.name,
        phone: editData.phone,
        bloodGroup: editData.bloodGroup,
        dob: editData.dob,
        gender: editData.gender,
        weight: Number(editData.weight),
        location: {
          ...editData.location,
          latitude: editData.location?.latitude ? Number(editData.location.latitude) : null,
          longitude: editData.location?.longitude ? Number(editData.location.longitude) : null
        },
        medicalHistory: editData.medicalHistory,
        socialLinks: {
          facebook: editData.socialLinks?.facebook || '',
          whatsapp: editData.socialLinks?.whatsapp || ''
        },
        photoURL: editData.photoURL,
        totalDonations: editData.totalDonations,
        lastDonationDate: editData.lastDonationDate
      };
      
      await updateDoc(doc(db, 'users', userId), updatePayload);
      setData({...data, ...updatePayload}); // Locally update data state
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogDonation = async () => {
    if (!isEligible()) return;
    setLoading(true);
    try {
      const newTotal = (userData.totalDonations || 0) + 1;
      const newDate = new Date().toISOString();
      await updateDoc(doc(db, 'users', userId), {
        totalDonations: newTotal,
        lastDonationDate: newDate,
        isAvailable: false
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    } finally {
      setLoading(false);
    }
  };

  const isEligible = () => {
    if (!data.lastDonationDate) return true;
    const lastDate = new Date(data.lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 90; // 3 months
  };

  if (loading) return <div className="text-center py-20 text-text-secondary">{t.wait}</div>;
  if (!data || !editData) return <div className="text-center py-20 text-blood-red">Error loading profile data. Please try again.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{data.id === userId ? t.myProfile : data.name}</h2>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-glass-border"
          >
            <Edit2 className="w-4 h-4" /> {t.editProfile}
          </button>
        ) : (
      <div className="flex gap-2">
            <button 
              onClick={() => { setIsEditing(false); setEditData(data); }}
              className="px-4 py-2 rounded-xl text-text-secondary hover:bg-white/5"
            >
              {t.cancel}
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-blood-red hover:bg-red-700 px-6 py-2 rounded-xl text-white font-bold transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? t.saving : t.save}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="glass-card p-8 rounded-3xl text-center space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <div className={`w-full h-full rounded-full overflow-hidden border-4 border-blood-red/20 shadow-2xl ${uploadingImage ? 'opacity-50' : ''}`}>
              <img src={editData?.photoURL || data?.photoURL || `https://ui-avatars.com/api/?name=${data?.name}&background=random`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {isEditing && data?.id === userId && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full flex flex-col items-center gap-1">
                <label className="cursor-pointer bg-blood-red hover:bg-red-700 text-white text-[10px] px-3 py-1 rounded-full whitespace-nowrap transition-colors shadow-lg">
                  {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          <div>
            {isEditing ? (
              <input 
                type="text" 
                value={editData.name || ''}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="w-full bg-white/5 border border-glass-border rounded-xl px-3 py-2 text-xl font-bold text-center outline-none focus:ring-1 focus:ring-blood-red mb-2"
              />
            ) : (
              <h3 className="text-xl font-bold">{data.name}</h3>
            )}
            <p className="text-text-secondary text-sm">{data.email}</p>
            {/* Rating Display */}
            <div className="mt-2 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => isAdmin && handleRateDonor(star)}
                  className={cn(
                    "text-xl transition-all",
                    star <= (data.rating || 0) ? "text-yellow-400" : "text-gray-600",
                    isAdmin ? "cursor-pointer hover:scale-110" : "cursor-default"
                  )}
                >
                  ★
                </button>
              ))}
              {isAdmin && <span className="text-xs text-text-secondary ml-2">(Admin Only)</span>}
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <div className="px-4 py-2 bg-blood-red/10 border border-blood-red/20 rounded-xl">
              <p className="text-[10px] text-blood-red font-bold uppercase">{t.bloodGroup}</p>
              {isEditing ? (
                <select
                  value={editData.bloodGroup || ''}
                  onChange={(e) => setEditData({...editData, bloodGroup: e.target.value})}
                  className="bg-transparent text-xl font-bold text-blood-red outline-none cursor-pointer"
                >
                  <option value="" className="bg-bg-dark">Select</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(g => (
                    <option key={g} value={g} className="bg-bg-dark text-white">{g}</option>
                  ))}
                </select>
              ) : (
                <p className="text-xl font-bold text-blood-red">{data.bloodGroup}</p>
              )}
            </div>
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-[10px] text-green-400 font-bold uppercase">{t.status}</p>
              <p className="text-xl font-bold text-green-400">{isEligible() ? t.eligible : t.notEligible}</p>
            </div>
          </div>
          {data.id === userId && (
          <div className="pt-4 border-t border-glass-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-secondary">{t.interestedInDonating}</span>
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'users', userId), { isAvailable: !data.isAvailable });
                  } catch (err) {
                    handleFirestoreError(err, OperationType.UPDATE, 'users');
                  }
                }}
                className={cn(
                  "w-12 h-6 rounded-full relative transition-colors",
                  data.isAvailable ? "bg-green-500" : "bg-gray-600"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  data.isAvailable ? "right-1" : "left-1"
                )}></div>
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4 relative group">
              <div className="p-3 bg-blood-red/10 rounded-xl">
                <Droplets className="text-blood-red w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-secondary">{t.totalDonations}</p>
                {isEditing ? (
                  <input 
                    type="number" 
                    value={editData.totalDonations || 0}
                    onChange={(e) => setEditData({...editData, totalDonations: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-glass-border rounded-lg px-2 py-1 text-xl font-bold mt-1 outline-none focus:ring-1 focus:ring-blood-red"
                  />
                ) : (
                  <p className="text-xl font-bold">{data.totalDonations || 0} {t.times}</p>
                )}
              </div>
              {!isEditing && isEligible() && (
                <button 
                  onClick={handleLogDonation}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blood-red text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-lg shadow-red-900/40 hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {t.logDonation}
                </button>
              )}
            </div>
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Calendar className="text-blue-400 w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-secondary">{t.lastDonation}</p>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={editData.lastDonationDate ? editData.lastDonationDate.split('T')[0] : ''}
                    onChange={(e) => setEditData({...editData, lastDonationDate: e.target.value ? new Date(e.target.value).toISOString() : null})}
                    className="w-full bg-white/5 border border-glass-border rounded-lg px-2 py-1 text-sm font-bold mt-1 outline-none focus:ring-1 focus:ring-blood-red"
                  />
                ) : (
                  <p className="text-xl font-bold">{data.lastDonationDate ? new Date(data.lastDonationDate).toLocaleDateString() : t.never}</p>
                )}
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="glass-card p-8 rounded-3xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoItem icon={Phone} label={t.phone} value={isEditing ? (editData.phone || '') : (data.phone || '')} isEditing={isEditing} onChange={(v) => setEditData({...editData, phone: v})} />
              <InfoItem icon={Calendar} label={t.dob} value={isEditing ? (editData.dob || '') : (data.dob || '')} isEditing={isEditing} onChange={(v) => setEditData({...editData, dob: v})} type="date" />
              <InfoItem icon={Users} label={t.gender} value={isEditing ? (editData.gender || '') : (data.gender || '')} isEditing={isEditing} onChange={(v) => setEditData({...editData, gender: v})} />
              <InfoItem icon={Scale} label={t.weight} value={isEditing ? (editData.weight || '') : `${data.weight || ''} ${language === 'Bangla' ? 'কেজি' : 'kg'}`} isEditing={isEditing} onChange={(v) => setEditData({...editData, weight: v})} type="number" />
              <InfoItem icon={MapPin} label={t.division} value={isEditing ? (editData.location?.division || '') : (data.location?.division || '')} isEditing={isEditing} onChange={(v) => setEditData({...editData, location: {...(editData.location || {}), division: v}})} />
              <InfoItem icon={MapPin} label={t.district} value={isEditing ? (editData.location?.district || '') : (data.location?.district || '')} isEditing={isEditing} onChange={(v) => setEditData({...editData, location: {...(editData.location || {}), district: v}})} />
              <InfoItem icon={MapPin} label={t.area} value={isEditing ? (editData.location?.area || '') : (data.location?.area || '')} isEditing={isEditing} onChange={(v) => setEditData({...editData, location: {...(editData.location || {}), area: v}})} />
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-secondary uppercase">Exact Location (Map)</h4>
                  {isEditing && (
                    <button 
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setEditData({
                              ...editData,
                              location: {
                                ...(editData.location || {}),
                                latitude: pos.coords.latitude.toString(),
                                longitude: pos.coords.longitude.toString()
                              }
                            });
                          });
                        }
                      }}
                      className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Locate className="w-3 h-3" /> Get Current Location
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InfoItem icon={MapPin} label={language === 'Bangla' ? 'অক্ষাংশ (Latitude)' : 'Latitude'} value={isEditing ? (editData.location?.latitude || '') : (data.location?.latitude || '')} isEditing={isEditing} onChange={(v) => setEditData({...editData, location: {...(editData.location || {}), latitude: v}})} type="number" />
                  <InfoItem icon={MapPin} label={language === 'Bangla' ? 'দ্রাঘিমাংশ (Longitude)' : 'Longitude'} value={isEditing ? (editData.location?.longitude || '') : (data.location?.longitude || '')} isEditing={isEditing} onChange={(v) => setEditData({...editData, location: {...(editData.location || {}), longitude: v}})} type="number" />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-glass-border space-y-6">
              {/* Social Links Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blood-red">
                  <h4 className="font-bold">Social Links</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-text-secondary uppercase">Facebook Profile URL</p>
                    {isEditing ? (
                      <input 
                        type="url"
                        value={editData.socialLinks?.facebook || ''}
                        onChange={(e) => setEditData({...editData, socialLinks: {...(editData.socialLinks || {}), facebook: e.target.value}})}
                        className="w-full bg-white/5 border border-glass-border rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-blood-red"
                        placeholder="https://facebook.com/..."
                      />
                    ) : (
                      <a href={data.socialLinks?.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">{data.socialLinks?.facebook || 'Not added'}</a>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-secondary uppercase">WhatsApp Number</p>
                    {isEditing ? (
                      <input 
                        type="tel"
                        value={editData.socialLinks?.whatsapp || ''}
                        onChange={(e) => setEditData({...editData, socialLinks: {...(editData.socialLinks || {}), whatsapp: e.target.value}})}
                        className="w-full bg-white/5 border border-glass-border rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-blood-red"
                        placeholder="+880..."
                      />
                    ) : (
                      <p className="text-sm">{data.socialLinks?.whatsapp || 'Not added'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical History Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blood-red">
                  <Stethoscope className="w-5 h-5" />
                  <h4 className="font-bold">{t.medicalHistory}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-xs text-text-secondary uppercase">{t.diseases}</p>
                    {isEditing ? (
                      <textarea 
                        value={editData.medicalHistory?.diseases || ''}
                        onChange={(e) => setEditData({...editData, medicalHistory: {...(editData.medicalHistory || {}), diseases: e.target.value}})}
                        className="w-full bg-white/5 border border-glass-border rounded-xl p-3 text-sm min-h-[80px] outline-none focus:ring-1 focus:ring-blood-red"
                      />
                    ) : (
                      <p className="text-sm">{data.medicalHistory?.diseases || t.none}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-secondary uppercase">{t.medications}</p>
                    {isEditing ? (
                      <textarea 
                        value={editData.medicalHistory?.medications || ''}
                        onChange={(e) => setEditData({...editData, medicalHistory: {...(editData.medicalHistory || {}), medications: e.target.value}})}
                        className="w-full bg-white/5 border border-glass-border rounded-xl p-3 text-sm min-h-[80px] outline-none focus:ring-1 focus:ring-blood-red"
                      />
                    ) : (
                      <p className="text-sm">{data.medicalHistory?.medications || t.none}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Received Requests Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blood-red/10 rounded-xl flex items-center justify-center">
            <Mail className="text-blood-red w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t.receivedRequests}</h3>
            <p className="text-xs text-text-secondary">{language === 'Bangla' ? 'দাতাদের কাছে সরাসরি পাঠানো অনুরোধগুলো এখানে দেখা যাবে।' : 'Requests sent directly to you as a donor.'}</p>
          </div>
        </div>
        
        <ReceivedRequestsList userId={userId} t={t} />
      </div>

      {/* Sent Requests Section */}
      <div className="space-y-6 pt-8 border-t border-glass-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Send className="text-blue-400 w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{t.sentRequests}</h3>
            <p className="text-xs text-text-secondary">{language === 'Bangla' ? 'আপনার পাঠানো অনুরোধগুলোর বর্তমান অবস্থা এখানে দেখুন।' : 'View the status of requests you have sent to donors.'}</p>
          </div>
        </div>
        
        <SentRequestsList userId={userId} t={t} />
      </div>
    </div>
  );
}

function SentRequestsList({ userId, t }: { userId: string, t: any }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'direct_requests'),
      where('requesterId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  if (loading) return <div className="text-center py-10 text-text-secondary">{t.wait}</div>;

  if (requests.length === 0) {
    return (
      <div className="glass-card p-12 rounded-[2.5rem] text-center border-dashed border-2">
        <Send className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-10" />
        <p className="text-text-secondary font-medium">{t.noSentRequests}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {requests.map((req) => (
        <div key={req.id} className="glass-card p-6 rounded-[2rem] border border-glass-border hover:border-blue-500/30 transition-all relative">
        {/* Requested From (Requester sees Donor Details) */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-400">
            {req.donorName?.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-sm">To: {req.donorName}</h4>
            <div className="text-[10px] text-text-secondary flex gap-2">
              <span>📞 {req.donorPhone}</span>
              <span>📍 {req.donorLocation?.area}, {req.donorLocation?.district}</span>
            </div>
          </div>
        </div>
      {/* Delete and Other Buttons */}
        <button 
          onClick={async () => {
            if (confirm('Are you sure you want to delete this request?')) {
              await deleteDoc(doc(db, 'direct_requests', req.id));
            }
          }}
          className="absolute top-4 right-16 p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <span className={cn(
          "text-[8px] font-black uppercase px-2 py-1 rounded-full absolute top-4 right-4",
          req.status === 'pending' ? "bg-orange-500/20 text-orange-400" :
          req.status === 'accepted' ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
        )}>
          {req.status}
        </span>
        <p className="text-xs text-text-secondary italic mb-4">"{req.message}"</p>
        </div>
      ))}
    </div>
  );
}

function ReceivedRequestsList({ userId, t }: { userId: string, t: any }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'direct_requests'),
      where('donorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  if (loading) return <div className="text-center py-10 text-text-secondary">{t.wait}</div>;

  if (requests.length === 0) {
    return (
      <div className="glass-card p-12 rounded-[2.5rem] text-center border-dashed border-2">
        <Mail className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-10" />
        <p className="text-text-secondary font-medium">{t.noReceivedRequests}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {requests.map((req) => (
        <div key={req.id} className="glass-card p-6 rounded-[2rem] border border-glass-border hover:border-blood-red/30 transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blood-red/10 flex items-center justify-center font-bold text-blood-red">
                {req.requesterName?.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm">{req.requesterName}</h4>
                <div className="text-[10px] text-text-secondary flex gap-2">
                  <span>📞 {req.requesterPhone}</span>
                  <span>📍 {req.requesterLocation?.area}, {req.requesterLocation?.district}</span>
                </div>
              </div>
            </div>
            <span className={cn(
              "text-[8px] font-black uppercase px-2 py-1 rounded-full",
              req.status === 'pending' ? "bg-orange-500/20 text-orange-400" :
              req.status === 'accepted' ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
            )}>
              {req.status}
            </span>
            <button 
              onClick={async () => {
                if (confirm('Are you sure you want to delete this request?')) {
                  try {
                    await deleteDoc(doc(db, 'direct_requests', req.id));
                  } catch (err) {
                    console.error("Error deleting request:", err);
                    alert("Failed to delete request. Please try again.");
                  }
                }
              }}
              className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-text-secondary line-clamp-3 mb-4 italic">"{req.message}"</p>
          {req.status === 'pending' && (
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'direct_requests', req.id), { status: 'accepted' });
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="flex-1 py-2 bg-green-500 text-white text-[10px] font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-900/20"
              >
                Accept
              </button>
              <button 
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'direct_requests', req.id), { status: 'declined' });
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="flex-1 py-2 bg-white/5 text-text-secondary text-[10px] font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DonorsView({ t, searchQuery: globalSearchQuery, userData }: { t: any, searchQuery: string, userData: any }) {
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState<any | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  
  const [filters, setFilters] = useState({
    bloodGroup: '',
    district: '',
    donationDate: '',
    donorType: 'All'
  });

  const districts = [
    "Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail",
    "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira",
    "Bogra", "Joypurhat", "Naogaon", "Natore", "Chapai Nawabganj", "Pabna", "Rajshahi", "Sirajganj",
    "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon",
    "Barguna", "Barisal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur",
    "Bandarban", "Brahmanbaria", "Chandpur", "Chittagong", "Comilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati",
    "Habiganj", "Moulvibazar", "Sunamganj", "Sylhet",
    "Jamalpur", "Mymensingh", "Netrokona", "Sherpur"
  ].sort();

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'donor'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const donorList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDonors(donorList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredDonors = donors.filter(donor => {
    const matchesGlobalSearch = !globalSearchQuery || 
      donor.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      donor.bloodGroup.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      donor.location?.district?.toLowerCase().includes(globalSearchQuery.toLowerCase());

    const matchesBloodGroup = !filters.bloodGroup || donor.bloodGroup === filters.bloodGroup;
    const matchesDistrict = !filters.district || donor.location?.district?.trim().toLowerCase() === filters.district.trim().toLowerCase();
    
    // Simple date match (just checking if they donated on that date for now, or if it's a placeholder)
    const matchesDate = !filters.donationDate || (donor.lastDonationDate && donor.lastDonationDate.startsWith(filters.donationDate));
    
    const matchesType = filters.donorType === 'All' || 
      (filters.donorType === 'Available' && donor.isAvailable === true) ||
      (filters.donorType === 'Unavailable' && donor.isAvailable === false) ||
      (filters.donorType === donor.bloodGroup);

    return matchesGlobalSearch && matchesBloodGroup && matchesDistrict && matchesDate && matchesType;
  });

  const handleSendDirectRequest = async () => {
    if (!selectedDonor || !requestMessage.trim()) return;
    setSendingRequest(true);
    try {
      const requestRef = await addDoc(collection(db, 'direct_requests'), {
        donorId: selectedDonor.id,
        donorName: selectedDonor.name,
        donorPhone: selectedDonor.phone,
        donorLocation: selectedDonor.location,
        requesterId: auth.currentUser?.uid,
        requesterName: auth.currentUser?.displayName || 'Anonymous',
        requesterPhone: userData.phone,
        requesterLocation: userData.location,
        message: requestMessage,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Send Notification to Donor
      await addDoc(collection(db, 'notifications'), {
        recipientUid: selectedDonor.id,
        title: t.newBloodRequest,
        body: `${t.receivedRequest} ${auth.currentUser?.displayName || 'Anonymous'}`,
        type: 'request',
        relatedId: requestRef.id,
        isRead: false,
        createdAt: serverTimestamp()
      });

      // @ts-ignore
      window.showToast(t.requestSent);
      setRequestMessage('');
      setSelectedDonor(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'direct_requests');
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-text-secondary">{t.wait}</div>;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-blood-red dark:text-red-400 uppercase ml-1">{t.bloodGroupFilter}</label>
            <select 
              value={filters.bloodGroup}
              onChange={(e) => setFilters({...filters, bloodGroup: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-glass-border rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blood-red transition-all appearance-none"
            >
              <option value="" className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">Select</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(g => (
                <option key={g} value={g} className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">{g}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-blood-red dark:text-red-400 uppercase ml-1">{t.districtFilter}</label>
            <select 
              value={filters.district}
              onChange={(e) => setFilters({...filters, district: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-glass-border rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blood-red transition-all appearance-none"
            >
              <option value="" className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">Select</option>
              {districts.map(d => (
                <option key={d} value={d} className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">{d}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-blood-red dark:text-red-400 uppercase ml-1">{t.donationDateFilter}</label>
            <input 
              type="date"
              value={filters.donationDate}
              onChange={(e) => setFilters({...filters, donationDate: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-glass-border rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blood-red transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-blood-red dark:text-red-400 uppercase ml-1">{t.donorTypeFilter}</label>
            <select 
              value={filters.donorType}
              onChange={(e) => setFilters({...filters, donorType: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-glass-border rounded-xl text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blood-red transition-all"
            >
              <option value="All" className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">{t.all}</option>
              <option value="Available" className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">{t.available}</option>
              <option value="Unavailable" className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">{t.notEligible}</option>
              <option value="A+" className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">A+</option>
              <option value="B+" className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">B+</option>
              <option value="O+" className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">O+</option>
              <option value="AB+" className="bg-white dark:bg-bg-dark text-gray-900 dark:text-white">AB+</option>
            </select>
          </div>

          <button 
            className="bg-blood-red text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 active:scale-95"
          >
            {t.searchDonors}
          </button>
        </div>
      </div>

      {/* Header Bar matching image */}
      <div className="bg-blood-red text-white px-6 py-4 rounded-lg shadow-md font-bold text-lg">
        {t.totalDonorsFound} {filteredDonors.length}.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDonors.map(donor => (
          <div 
            key={donor.id} 
            onClick={() => setSelectedDonor(donor)}
            className="bg-white dark:bg-bg-dark p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-glass-border hover:shadow-xl hover:shadow-blood-red/10 transition-all cursor-pointer flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 group"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 relative">
              <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-blood-red/10 group-hover:border-blood-red/40 transition-colors">
                <img 
                  src={donor.photoURL || `https://ui-avatars.com/api/?name=${donor.name}&background=random`} 
                  alt={donor.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blood-red rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {donor.bloodGroup}
              </div>
            </div>
            <div className="space-y-2 flex-1 w-full min-w-0">
              <div className="flex items-center w-full gap-2">
                <span className="text-gray-400 dark:text-text-secondary w-16 sm:w-20 text-xs sm:text-sm font-medium flex-shrink-0">Name</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg truncate">{donor.name}</span>
              </div>
              <div className="flex items-center w-full gap-2">
                <span className="text-gray-400 dark:text-text-secondary w-16 sm:w-20 text-xs sm:text-sm font-medium flex-shrink-0">Group</span>
                <span className="font-bold text-blood-red text-sm sm:text-lg truncate">{donor.bloodGroup}</span>
              </div>
              <div className="flex items-center w-full gap-2">
                <span className="text-gray-400 dark:text-text-secondary w-16 sm:w-20 text-xs sm:text-sm font-medium flex-shrink-0">District</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg truncate">{donor.location?.district || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Donor Profile Modal */}
      {selectedDonor && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          onClick={() => setSelectedDonor(null)}
        >
          <div 
            className="bg-white/90 dark:bg-bg-dark/90 w-full max-w-lg p-8 rounded-[32px] shadow-2xl relative animate-in fade-in zoom-in duration-300 border border-white/20 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedDonor(null)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-3xl bg-red-100 flex items-center justify-center text-blood-red font-bold text-3xl border-2 border-blood-red/20 shadow-inner">
                {selectedDonor.bloodGroup}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDonor.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {selectedDonor.location?.area}, {selectedDonor.location?.district}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/50 dark:border-white/10">
                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">ফোন</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedDonor.phone || 'N/A'}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/50 dark:border-white/10">
                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">শেষ রক্তদান</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedDonor.lastDonationDate ? selectedDonor.lastDonationDate.split('T')[0] : 'N/A'}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/50 dark:border-white/10">
                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">মোট রক্তদান</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{`${selectedDonor.totalDonations || 0} বার`}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/50 dark:border-white/10">
                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">ওজন</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedDonor.weight ? `${selectedDonor.weight} kg` : 'N/A'}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/50 dark:border-white/10">
                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">লিঙ্গ</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedDonor.gender || 'N/A'}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/50 dark:border-white/10">
                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">স্ট্যাটাস</p>
                <p className={cn("text-sm font-bold", selectedDonor.isAvailable ? "text-green-600" : "text-red-600")}>
                  {selectedDonor.isAvailable ? (t.available || 'Available') : (t.notEligible || 'Unavailable')}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-2">চিকিৎসা ইতিহাস</p>
              <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-white/50 dark:border-white/10 text-sm text-gray-700 dark:text-gray-300">
                {(selectedDonor.medicalHistory?.diseases || selectedDonor.medicalHistory?.medications) 
                  ? `${selectedDonor.medicalHistory.diseases || ''}${selectedDonor.medicalHistory.diseases && selectedDonor.medicalHistory.medications ? ', ' : ''}${selectedDonor.medicalHistory.medications || ''}`
                  : 'কোনো তথ্য নেই'}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-white/10">
              <h4 className="font-bold text-gray-900 dark:text-white">{typeof t.sendRequest === 'string' ? t.sendRequest : 'Send Request'}</h4>
              <textarea 
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={typeof t.messagePlaceholder === 'string' ? t.messagePlaceholder : 'Write your message...'}
                className="w-full bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blood-red min-h-[100px] text-gray-900 dark:text-white"
              />
              <button 
                onClick={handleSendDirectRequest}
                disabled={sendingRequest || !requestMessage.trim()}
                className="w-full bg-blood-red text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 disabled:opacity-50"
              >
                {sendingRequest ? (typeof t.wait === 'string' ? t.wait : 'Sending...') : (typeof t.sendRequest === 'string' ? t.sendRequest : 'Send Request')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequestsView({ t, searchQuery, onCreateRequest }: { t: any, searchQuery: string, onCreateRequest: () => void }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(requestList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'requests');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredRequests = requests.filter(req => 
    req.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 text-text-secondary">{t.wait}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.requests}</h2>
          <span className="text-sm text-text-secondary">{filteredRequests.length} {t.activeRequests}</span>
        </div>
        <button 
          onClick={onCreateRequest}
          className="bg-blood-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/40"
        >
          <Plus className="w-4 h-4" />
          {t.createRequest}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRequests.map(req => (
          <div key={req.id} className="glass-card p-6 rounded-2xl shadow-lg border-l-4 border-blood-red">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blood-red/10 flex items-center justify-center text-blood-red font-bold border border-blood-red/20">
                  {req.bloodGroup}
                </div>
                <div>
                  <h3 className="font-bold">{req.patient}</h3>
                  <p className="text-xs text-text-secondary">{req.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</p>
                </div>
              </div>
              <span className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                req.urgency === 'Critical' ? "bg-red-500/20 text-red-400 border border-red-500/30" : 
                req.urgency === 'Urgent' ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              )}>
                {req.urgency}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <MapPin className="w-4 h-4" /> {req.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock className="w-4 h-4" /> {req.time || 'Needed ASAP'}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => window.location.href = `tel:${req.phone}`}
                className="flex-1 bg-blood-red text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> {t.contactPatient}
              </button>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.location)}`, '_blank')}
                className="px-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center justify-center"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardView({ t }: { t: any }) {
  const [topDonors, setTopDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'donor'),
      orderBy('totalDonations', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTopDonors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center py-20 text-text-secondary">{t.wait}</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-4">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-3xl font-bold">{t.leaderboard}</h2>
        <p className="text-text-secondary">Celebrating our most dedicated life-savers.</p>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden shadow-2xl border border-glass-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-text-secondary text-xs uppercase tracking-widest">
                <th className="px-8 py-6 font-bold">Rank</th>
                <th className="px-8 py-6 font-bold">Donor</th>
                <th className="px-8 py-6 font-bold">Blood Group</th>
                <th className="px-8 py-6 font-bold text-right">Donations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {topDonors.map((donor, i) => (
                <tr key={donor.id} className={cn(
                  "hover:bg-white/5 transition-colors group",
                  i === 0 ? "bg-yellow-500/5" : i === 1 ? "bg-slate-400/5" : i === 2 ? "bg-amber-600/5" : ""
                )}>
                  <td className="px-8 py-6">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      i === 0 ? "bg-yellow-500 text-black" : 
                      i === 1 ? "bg-slate-400 text-black" : 
                      i === 2 ? "bg-amber-600 text-white" : "bg-white/10 text-text-secondary"
                    )}>
                      {i + 1}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={donor.photoURL || `https://ui-avatars.com/api/?name=${donor.name}&background=random`} 
                        className="w-10 h-10 rounded-xl object-cover border border-glass-border" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="font-bold group-hover:text-blood-red transition-colors">{donor.name}</p>
                        <p className="text-xs text-text-secondary">{donor.location?.district}, {donor.location?.division}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-blood-red/10 text-blood-red rounded-full text-xs font-bold border border-blood-red/20">
                      {donor.bloodGroup}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-black text-text-primary">{donor.totalDonations || 0}</span>
                      <span className="text-[10px] uppercase font-bold text-text-secondary tracking-tighter">{t.times}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BloodBanksView({ t, searchQuery }: { t: any, searchQuery: string }) {
  const bloodBanks = [
    { id: 1, name: 'Red Crescent Blood Bank', location: '7/4, Aurangzeb Road, Mohammadpur, Dhaka', phone: '02-9116563', type: 'Central' },
    { id: 2, name: 'Quantum Foundation Blood Lab', location: '119, Shantinagar, Dhaka', phone: '02-9351969', type: 'Private' },
    { id: 3, name: 'Sandhani Blood Bank', location: 'Dhaka Medical College, Dhaka', phone: '02-9668690', type: 'Student-run' },
    { id: 4, name: 'Badhan Blood Bank', location: 'TSC, University of Dhaka, Dhaka', phone: '01534-294648', type: 'Student-run' },
    { id: 5, name: 'Police Blood Bank', location: 'Rajarbagh Police Lines, Dhaka', phone: '01713-398311', type: 'Government' },
  ];

  const filteredBanks = bloodBanks.filter(bank => 
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bank.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.banks}</h2>
        <span className="text-sm text-text-secondary">{filteredBanks.length} {t.banks}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBanks.map(bank => (
          <div key={bank.id} className="glass-card p-6 rounded-2xl shadow-lg hover:shadow-blood-red/5 transition-all group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blood-red/10 rounded-xl flex items-center justify-center text-blood-red border border-blood-red/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">{bank.name}</h3>
                <span className="text-[10px] uppercase font-bold text-blood-red bg-blood-red/10 px-2 py-0.5 rounded-full border border-blood-red/20">
                  {bank.type}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-text-secondary">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> {bank.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Phone className="w-4 h-4" /> {bank.phone}
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => window.location.href = `tel:${bank.phone}`}
                className="flex-1 bg-white/5 hover:bg-blood-red hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> {t.contactPatient}
              </button>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name + ' ' + bank.location)}`, '_blank')}
                className="px-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all flex items-center justify-center"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPanelView({ t }: { t: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'user' | 'request' | 'campaign' | 'story', id: string } | null>(null);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubReqs = onSnapshot(collection(db, 'requests'), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubCampaigns = onSnapshot(collection(db, 'campaigns'), (snap) => {
      setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubStories = onSnapshot(collection(db, 'donation_stories'), (snap) => {
      setStories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => { unsubUsers(); unsubReqs(); unsubCampaigns(); unsubStories(); };
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const collectionName = confirmDelete.type === 'user' ? 'users' : confirmDelete.type === 'request' ? 'requests' : confirmDelete.type === 'campaign' ? 'campaigns' : 'donation_stories';
      await deleteDoc(doc(db, collectionName, confirmDelete.id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, confirmDelete.type === 'user' ? 'users' : confirmDelete.type === 'request' ? 'requests' : confirmDelete.type === 'campaign' ? 'campaigns' : 'donation_stories');
    }
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ConfirmationModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title={confirmDelete?.type === 'user' ? "Delete User" : confirmDelete?.type === 'request' ? "Delete Request" : confirmDelete?.type === 'campaign' ? "Delete Campaign" : "Delete Story"}
        message={confirmDelete?.type === 'user' ? "Are you sure you want to delete this user?" : confirmDelete?.type === 'request' ? "Are you sure you want to delete this blood request?" : confirmDelete?.type === 'campaign' ? "Are you sure you want to delete this campaign?" : "Are you sure you want to delete this donation story?"}
      />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.adminPanel}</h2>
          <p className="text-text-secondary">{t.manageUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-text-secondary uppercase font-bold mb-1">{t.totalUsers}</p>
          <h3 className="text-3xl font-bold">{users.length}</h3>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-text-secondary uppercase font-bold mb-1">{t.totalRequests}</p>
          <h3 className="text-3xl font-bold">{requests.length}</h3>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-text-secondary uppercase font-bold mb-1">{t.activeDonors}</p>
          <h3 className="text-3xl font-bold text-green-400">{users.filter(u => u.isAvailable).length}</h3>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-glass-border">
          <h3 className="font-bold">{t.userManagement}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 text-text-secondary text-xs uppercase">
                <th className="px-6 py-4">{t.user}</th>
                <th className="px-6 py-4">{t.role}</th>
                <th className="px-6 py-4">{t.bloodGroup}</th>
                <th className="px-6 py-4">{t.location}</th>
                <th className="px-6 py-4">{t.status}</th>
                <th className="px-6 py-4 text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}&background=random`} 
                        className="w-8 h-8 rounded-full" 
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-sm font-bold">{u.name}</p>
                        <p className="text-[10px] text-text-secondary">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      u.role === 'admin' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-blood-red">{u.bloodGroup}</td>
                  <td className="px-6 py-4 text-xs">{u.location?.district}, {u.location?.division}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full inline-block",
                        u.isAvailable ? "bg-green-500" : "bg-gray-500"
                      )}></span>
                      <span className="text-xs">{u.isAvailable ? t.eligible : t.notEligible}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setConfirmDelete({ type: 'user', id: u.id })}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await updateDoc(doc(db, 'users', u.id), { role: u.role === 'admin' ? 'donor' : 'admin' });
                          } catch (err) {
                            handleFirestoreError(err, OperationType.UPDATE, 'users');
                          }
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-text-secondary transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-glass-border">
          <h3 className="font-bold">{t.urgentRequests}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 text-text-secondary text-xs uppercase">
                <th className="px-6 py-4">{t.patient}</th>
                <th className="px-6 py-4">{t.group}</th>
                <th className="px-6 py-4">{t.location}</th>
                <th className="px-6 py-4">{t.urgency}</th>
                <th className="px-6 py-4 text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 font-bold text-sm">{req.patient}</td>
                  <td className="px-6 py-4 font-bold text-blood-red">{req.bloodGroup}</td>
                  <td className="px-6 py-4 text-xs">{req.location}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      req.urgency === 'Critical' ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"
                    )}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setConfirmDelete({ type: 'request', id: req.id })}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-glass-border">
          <h3 className="font-bold">Campaign Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 text-text-secondary text-xs uppercase">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {campaigns.map(c => (
                <tr key={c.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 font-bold text-sm">{c.title}</td>
                  <td className="px-6 py-4 text-xs">{c.date}</td>
                  <td className="px-6 py-4 text-xs">{c.location}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setConfirmDelete({ type: 'campaign', id: c.id })}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden mt-8">
        <div className="p-6 border-b border-glass-border">
          <h3 className="font-bold">Donation Stories</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-white/5 text-text-secondary text-xs uppercase">
                <th className="px-6 py-4">Donor</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Group</th>
                <th className="px-6 py-4">Review</th>
                <th className="px-6 py-4 text-right">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {stories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">No donation stories yet.</td>
                </tr>
              ) : (
                stories.map(s => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 font-bold text-sm">{s.donorName}</td>
                    <td className="px-6 py-4 text-xs">{s.recipient}</td>
                    <td className="px-6 py-4 font-bold text-blood-red">{s.group}</td>
                    <td className="px-6 py-4 text-xs italic opacity-80 max-w-xs truncate">"{s.message}"</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setConfirmDelete({ type: 'story', id: s.id })}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LoginView({ t }: { t: any }) {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignInWrapper = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup')) {
        setError(t.language === 'Bangla' ? 'গুগল লগইন পপআপ বন্ধ করা হয়েছে অথবা ব্লক করা হয়েছে। অনুগ্রহ করে এই পেজটি নতুন ট্যাবে ওপেন করে আবার চেষ্টা করুন।' : 'Google login popup was closed or blocked. Please open this app in a new tab and try again.');
      } else {
        setError(err.message || 'Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let identifier = email;
      if (authMethod === 'phone') {
        if (phone.length !== 10) {
          throw new Error('সঠিক ফোন নম্বর দিন (১০ ডিজিট)');
        }
        identifier = `${phone}@rokto.com`; // Internal identifier for phone-based auth without OTP
      }

      if (isLogin) {
        await loginWithEmail(identifier, password);
      } else {
        await signUpWithEmail(identifier, password);
        if (name) await updateUserProfile(name);
      }
    } catch (err: any) {
      let msg = err.message;
      if (msg.includes('auth/user-not-found')) msg = 'এই ইমেইল বা ফোন নম্বর দিয়ে কোনো অ্যাকাউন্ট নেই';
      if (msg.includes('auth/wrong-password')) msg = 'ভুল পাসওয়ার্ড দিয়েছেন';
      if (msg.includes('auth/email-already-in-use')) msg = 'এই ইমেইল বা ফোন নম্বর ইতিমধ্যে ব্যবহার করা হয়েছে';
      setError(msg || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-bg-dark flex items-center justify-center p-4">
      <div className="glass-card p-10 rounded-[40px] shadow-2xl max-w-md w-full border border-glass-border/50 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blood-red/10 blur-[80px] rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blood-red/10 blur-[80px] rounded-full"></div>

        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center">
              <Droplets className="text-blood-red w-8 h-8 fill-blood-red" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-center mb-2 tracking-tight text-text-primary">
            {isLogin ? t.login : t.signup}
          </h1>
          <p className="text-text-secondary text-center mb-6 text-sm">
            {isLogin ? (t.language === 'Bangla' ? 'আপনার ব্লাডকানেক্ট অ্যাকাউন্টে লগইন করুন' : 'Login to your account') : (t.language === 'Bangla' ? 'ব্লাডকানেক্ট ইকোসিস্টেমে যোগ দিন' : 'Join the ecosystem')}
          </p>

          {/* Auth Method Toggle */}
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-glass-border">
            <button 
              onClick={() => setAuthMethod('email')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                authMethod === 'email' ? "bg-blood-red text-white shadow-lg" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {t.email}
            </button>
            <button 
              onClick={() => setAuthMethod('phone')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                authMethod === 'phone' ? "bg-blood-red text-white shadow-lg" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {t.phone}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary ml-1 uppercase tracking-widest">{t.name}</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.language === 'Bangla' ? 'আপনার নাম লিখুন' : 'Enter your name'} 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-glass-border rounded-3xl text-sm outline-none focus:ring-2 focus:ring-blood-red text-text-primary placeholder:text-text-secondary/30 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {authMethod === 'email' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary ml-1 uppercase tracking-widest">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-glass-border rounded-3xl text-sm outline-none focus:ring-2 focus:ring-blood-red text-text-primary placeholder:text-text-secondary/30 transition-all"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary ml-1 uppercase tracking-widest">ফোন নম্বর (বাংলাদেশ)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-text-secondary">
                    <Phone className="w-5 h-5" />
                    <span className="text-sm font-bold border-r border-glass-border pr-2">+880</span>
                  </div>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="17XXXXXXXX" 
                    className="w-full pl-24 pr-4 py-4 bg-white/5 border border-glass-border rounded-3xl text-sm outline-none focus:ring-2 focus:ring-blood-red text-text-primary placeholder:text-text-secondary/30 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary ml-1 uppercase tracking-widest">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-glass-border rounded-3xl text-sm outline-none focus:ring-2 focus:ring-blood-red text-text-primary placeholder:text-text-secondary/30 transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blood-red text-white py-4 rounded-full font-bold hover:bg-red-700 transition-all shadow-2xl shadow-red-900/40 flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
            >
              {loading ? t.wait : (isLogin ? t.login : t.signup)}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-glass-border"></div>
            <span className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">{t.or}</span>
            <div className="flex-1 h-px bg-glass-border"></div>
          </div>

          <button 
            onClick={handleGoogleSignInWrapper}
            disabled={loading}
            className="mt-8 w-full flex items-center justify-center gap-3 bg-white/5 border border-glass-border text-text-primary py-4 rounded-3xl font-bold hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            {t.loginWithGoogle}
          </button>

          <p className="mt-10 text-center text-sm text-text-secondary">
            {isLogin ? t.noAccount : t.hasAccount} {' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-blood-red font-bold hover:underline"
            >
              {isLogin ? t.signup : t.login}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        active 
          ? "bg-blood-red/20 text-blood-red font-semibold" 
          : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
      )}
    >
      <Icon className={cn("w-5 h-5", active ? "text-blood-red" : "text-text-secondary")} />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function MapUpdater({ center }: { center: {lat: number, lng: number} }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
}

function MapView({ t, language }: { t: any, language: string }) {
  const [center, setCenter] = useState({ lat: 23.8103, lng: 90.4125 }); // Dhaka
  const [radius, setRadius] = useState(10); // 10km
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [donors, setDonors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          setCenter(pos);
        },
        () => {
          console.error("Error: The Geolocation service failed.");
        }
      );
    }

    // Fetch Donors
    const unsubDonors = onSnapshot(query(collection(db, 'users'), where('role', '==', 'donor')), (snap) => {
      setDonors(snap.docs.map(d => ({ id: d.id, type: 'donor', ...d.data() })));
    });

    // Fetch Requests
    const unsubReqs = onSnapshot(collection(db, 'requests'), (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, type: 'request', ...d.data() })));
    });

    return () => {
      unsubDonors();
      unsubReqs();
    };
  }, []);

  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker);
  };

  const bloodBanks = [
    { id: 'b1', type: 'bank', name: 'Red Crescent Blood Bank', location: { lat: 23.7544, lng: 90.3622 }, phone: '02-9116563' },
    { id: 'b2', type: 'bank', name: 'Quantum Foundation', location: { lat: 23.7388, lng: 90.4125 }, phone: '02-9351969' },
  ];

  return (
    <div className="relative h-full w-full overflow-hidden z-0">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
        maxBounds={[[20.6, 88.0], [26.6, 92.7]]}
        minZoom={7}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <MapUpdater center={center} />

        {/* User Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} />
        )}

        {/* Radius Circle */}
        {userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radius * 1000}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
        )}

        {/* Donors Markers */}
        {donors.filter(d => !d.lastDonationDate || (Date.now() - new Date(d.lastDonationDate).getTime()) > 90 * 24 * 60 * 60 * 1000).map(donor => {
          const bloodGroupColor = {
            'A+': '#dc2626', 'A-': '#b91c1c',
            'B+': '#ea580c', 'B-': '#c2410c',
            'O+': '#2563eb', 'O-': '#1d4ed8',
            'AB+': '#059669', 'AB-': '#047857'
          }[donor.bloodGroup] || '#ef4444';

          const lat = donor.location?.latitude ?? donor.location?.lat;
          const lng = donor.location?.longitude ?? donor.location?.lng;
          
          const coords = (lat != null && lng != null) 
            ? [Number(lat), Number(lng)] as [number, number]
            : null;
          
          if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return null;

          return (
            <Marker
              key={donor.id}
              position={coords}
              eventHandlers={{ click: () => handleMarkerClick(donor) }}
              icon={L.divIcon({
                className: 'custom-leaflet-marker',
                html: `<div class="relative w-8 h-8 flex flex-col items-center justify-center transition-transform hover:scale-125 duration-300">
                        <div class="blood-marker-glow" style="position:absolute; width:100%; height:100%; background: radial-gradient(circle, ${bloodGroupColor} 0%, transparent 70%); border-radius: 50%;"></div>
                        <div class="blood-marker w-6 h-6 flex items-center justify-center text-[10px] m-0 mx-auto text-white font-bold" style="background: ${bloodGroupColor}; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); line-height:1;display:flex; border-radius: 50%;">
                          ${donor.bloodGroup}
                        </div>
                      </div>`
              })}
            >
              <Popup className="rounded-2xl overflow-hidden shadow-xl">
                 <div className="p-4 bg-white rounded-2xl w-56">
                   <h3 className="font-bold text-lg text-gray-900">{donor.fullName}</h3>
                   <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-2">{donor.bloodGroup}</span>
                   <p className="text-sm text-gray-600 mb-4">{donor.area}, {donor.district}</p>
                   <button onClick={() => window.open(`tel:${donor.phoneNumber}`)} className="w-full bg-blood-red text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">Call Now</button>
                 </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Requests Markers */}
        {requests.map(req => {
          const coords = req.location?.latitude && req.location?.longitude
            ? [Number(req.location.latitude), Number(req.location.longitude)] as [number, number]
            : (req.lat && req.lng) 
              ? [Number(req.lat), Number(req.lng)] as [number, number]
              : null;

          if (!coords) return null;

          return (
            <Marker
              key={req.id}
              position={coords}
              eventHandlers={{ click: () => handleMarkerClick(req) }}
              icon={L.divIcon({
                className: 'custom-leaflet-marker',
                html: `<div class="relative w-8 h-8 flex flex-col items-center justify-center transition-transform hover:scale-125 duration-300">
                        <div class="blood-marker-glow" style="position:absolute; width:100%; height:100%; background: radial-gradient(circle, #f59e0b 0%, transparent 70%); border-radius: 50%;"></div>
                        <div class="blood-marker w-6 h-6 flex items-center justify-center text-[10px] m-0 mx-auto text-white font-bold" style="background: #f59e0b; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); line-height:1;display:flex; border-radius: 50%;">
                          ${req.bloodGroup}
                        </div>
                      </div>`
              })}
            >
               <Popup className="rounded-2xl overflow-hidden shadow-xl">
                 <div className="p-4 bg-white rounded-2xl w-56">
                   <h3 className="font-bold text-lg text-gray-900">Request: {req.bloodGroup}</h3>
                   <p className="text-sm text-gray-600 mb-4">{req.area}, {req.district}</p>
                   <button onClick={() => handleMarkerClick(req)} className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">Request Blood</button>
                 </div>
              </Popup>
            </Marker>
          );
        })}


        {/* Requests Markers */}
        {requests.map(req => {
          const coords = req.location?.latitude && req.location?.longitude
            ? [Number(req.location.latitude), Number(req.location.longitude)] as [number, number]
            : req.lat && req.lng 
              ? [Number(req.lat), Number(req.lng)] as [number, number]
              : null;

          if (!coords) return null;

          return (
            <Marker
              key={req.id}
              position={coords}
              eventHandlers={{ click: () => handleMarkerClick(req) }}
              icon={L.divIcon({
                className: 'custom-leaflet-marker',
                html: `<div class="relative w-8 h-8 flex flex-col items-center justify-center">
                        <div class="blood-marker-glow" style="position:absolute; width:100%; height:100%; background: radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%); border-radius: 50%;"></div>
                        <div class="blood-marker w-6 h-6 flex items-center justify-center text-[10px] m-0 mx-auto text-white font-bold" style="background: #ef4444; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); line-height:1;display:flex; border-radius: 50%;">
                          ${req.bloodGroup}
                        </div>
                      </div>`
              })}
            />
          );
        })}

        {/* Blood Banks Markers */}
        {bloodBanks.map(bank => (
          <Marker
            key={bank.id}
            position={[bank.location.lat, bank.location.lng]}
            eventHandlers={{ click: () => handleMarkerClick(bank) }}
          />
        ))}
      </MapContainer>

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-col gap-4 pointer-events-none z-[1000]">
        <div className="flex justify-between items-start">
          <div className="glass-card p-4 rounded-2xl pointer-events-auto w-64 bg-white/90 backdrop-blur-md shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-secondary uppercase">{t.radius}</span>
              <span className="text-xs font-bold text-blood-red">{radius} {t.km}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-blood-red h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(p);
                    setCenter(p);
                  });
                }
              }}
              className="p-3 bg-white border border-gray-100 rounded-xl shadow-lg hover:bg-gray-50 transition-all text-gray-700"
            >
              <Locate className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white rounded-[32px] p-8 shadow-2xl z-[1000] border border-gray-100"
          >
            <button 
              onClick={() => setSelectedMarker(null)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-blood-red font-bold text-2xl border-4 border-white shadow-lg shrink-0">
                {selectedMarker.bloodGroup || '🏥'}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedMarker.name || selectedMarker.patient || selectedMarker.donorName}</h3>
                <p className="text-sm text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis w-40">
                  {selectedMarker.type === 'donor' ? (language === 'Bangla' ? 'ভেরিফাইড রক্তদাতা' : 'Verified Blood Donor') : 
                   selectedMarker.type === 'request' ? (language === 'Bangla' ? 'জরুরী রক্তের প্রয়োজন' : 'Emergency Blood Needed') : 
                   selectedMarker.type === 'bank' ? (language === 'Bangla' ? 'রক্ত ব্যাংক' : 'Blood Bank') : ''}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4 text-gray-700">
                <div className="p-2 bg-red-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blood-red" />
                </div>
                <span className="font-medium text-lg">
                  {selectedMarker.location?.area || selectedMarker.location?.district || selectedMarker.location || selectedMarker.address || 'Dhaka'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <span className="font-medium text-lg">
                  {selectedMarker.isAvailable !== false ? (language === 'Bangla' ? 'রক্তদানে প্রস্তুত' : 'Ready to Donate') : (language === 'Bangla' ? 'এখন প্রস্তুত নয়' : 'Not Available')}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if (selectedMarker.phone) window.location.href = `tel:${selectedMarker.phone}`;
                  else alert(language === 'Bangla' ? 'যোগাযোগের তথ্য পাওয়া যায়নি' : 'Contact info not available');
                }}
                className="flex-1 bg-[#0f172a] text-[#0ea5e9] py-4 rounded-2xl font-bold text-lg hover:bg-[#1e293b] transition-all shadow-xl shadow-blue-900/10"
              >
                {language === 'Bangla' ? 'কল করুন' : 'Call Now'}
              </button>
              {selectedMarker.type === 'request' && (
                <button 
                  onClick={async () => {
                    try {
                      // @ts-ignore
                      await updateDoc(doc(db, 'requests', selectedMarker.id), { status: 'accepted' });
                      alert(language === 'Bangla' ? 'অনুরোধ গ্রহণ করা হয়েছে!' : 'Request accepted!');
                      setSelectedMarker(null);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="flex-1 bg-blood-red text-white py-4 rounded-2xl font-bold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-900/40"
                >
                  {t.acceptRequest}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardView({ onCreateCampaign, t, searchQuery, setActiveTab, isAdmin, setSelectedCampaign, language }: { onCreateCampaign: () => void, t: any, searchQuery: string, setActiveTab: (tab: string) => void, isAdmin: boolean, setSelectedCampaign: (campaign: any) => void, language: string }) {
  const [liveRequests, setLiveRequests] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({ donors: 0, requests: 0, banks: 0, donations: 0 });
  const [changes, setChanges] = useState({ donors: 0, requests: 0, donations: 0 });
  const [realChartData, setRealChartData] = useState<any[]>([]);

  const [bloodStock, setBloodStock] = useState([
    { group: 'A+', stock: 0 }, { group: 'A-', stock: 0 },
    { group: 'B+', stock: 0 }, { group: 'B-', stock: 0 },
    { group: 'O+', stock: 0 }, { group: 'O-', stock: 0 },
    { group: 'AB+', stock: 0 }, { group: 'AB-', stock: 0 }
  ]);

  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const calculateChange = (docs: any[]) => {
      let current30 = 0;
      let previous30 = 0;
      docs.forEach(doc => {
        const data = doc.data();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          const date = data.createdAt.toDate();
          if (date > thirtyDaysAgo) current30++;
          else if (date > sixtyDaysAgo) previous30++;
        }
      });
      if (previous30 === 0) return current30 > 0 ? 100 : 0;
      return Math.round(((current30 - previous30) / previous30) * 100);
    };

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const groups = { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'O+': 0, 'O-': 0, 'AB+': 0, 'AB-': 0 };
      snapshot.docs.forEach(doc => {
        const bg = doc.data().bloodGroup;
        if (bg && groups.hasOwnProperty(bg)) groups[bg as keyof typeof groups]++;
      });
      const total = snapshot.size || 1;
      setBloodStock(Object.entries(groups).map(([group, count]) => ({ 
        group, 
        stock: Math.round((count / total) * 100) 
      })));
  
      setStats(prev => ({ ...prev, donors: snapshot.size }));
      setChanges(prev => ({ ...prev, donors: calculateChange(snapshot.docs) }));
    });
    
    // Realtime requests listener
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(100)); // Increased limit to calculate change
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.slice(0, 10).map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: (doc.data().createdAt && typeof doc.data().createdAt.toDate === 'function') ? doc.data().createdAt.toDate().toLocaleTimeString() : 'Just now'
      }));
      setLiveRequests(requests.length > 0 ? requests : recentRequests);
      setStats(prev => ({ ...prev, requests: snapshot.size }));
      setChanges(prev => ({ ...prev, requests: calculateChange(snapshot.docs) }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'requests');
    });

    const cQ = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
    const unsubCampaigns = onSnapshot(cQ, (snapshot) => {
      setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const dQ = query(collection(db, 'donation_stories'));
    const unsubDonations = onSnapshot(dQ, (snapshot) => {
      setStats(prev => ({ ...prev, donations: snapshot.size }));
      setChanges(prev => ({ ...prev, donations: calculateChange(snapshot.docs) }));
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentYear = new Date().getFullYear();
      
      const monthlyData = monthNames.map(name => ({ name, donations: 0 }));
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          const date = data.createdAt.toDate();
          if (date.getFullYear() === currentYear) {
            const monthIndex = date.getMonth();
            monthlyData[monthIndex].donations++;
          }
        }
      });
      
      setRealChartData(monthlyData);
    });
    
    return () => { unsubscribe(); unsubUsers(); unsubCampaigns(); unsubDonations(); };
  }, []);

  const statsData = [
    { value: stats.donors.toLocaleString(), icon: Users, color: 'text-blue-600', change: `${changes.donors > 0 ? '+' : ''}${changes.donors}%`, tab: 'donors' },
    { value: stats.requests.toLocaleString(), icon: Droplets, color: 'text-red-600', change: `${changes.requests > 0 ? '+' : ''}${changes.requests}%`, tab: 'requests' },
    { value: '5', icon: MapPin, color: 'text-green-600', change: '0%', tab: 'banks' },
    { value: stats.donations.toLocaleString(), icon: CheckCircle2, color: 'text-purple-600', change: `${changes.donations > 0 ? '+' : ''}${changes.donations}%`, tab: 'donations' },
  ];

  const [chartFilter, setChartFilter] = useState('Last Year');
  
  const getFilteredChartData = () => {
    const dataToFilter = realChartData.length > 0 ? realChartData : donationData.map(d => ({...d, donations: 0}));
    const currentMonth = new Date().getMonth();
    
    switch (chartFilter) {
      case 'Last Month': 
        return dataToFilter.slice(Math.max(0, currentMonth), currentMonth + 1);
      case 'Last 3 Months': 
        return dataToFilter.slice(Math.max(0, currentMonth - 2), currentMonth + 1);
      case 'Last 6 Months': 
        return dataToFilter.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
      case 'Last Year': 
      default: return dataToFilter;
    }
  };

  const statsLabels = [t.totalDonors, t.activeRequests, t.bloodBanks, t.successfulDonations];

  const filteredRequests = liveRequests.filter(req => 
    req.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t.systemOverview}</h2>
          <p className="text-text-secondary">{t.realTimeStats}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={onCreateCampaign}
            className="bg-blood-red text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-900/40"
          >
            <Plus className="w-4 h-4" />
            {t.createCampaign}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => stat.tab && setActiveTab(stat.tab)}
            className={cn(
              "glass-card p-6 rounded-2xl shadow-lg hover:shadow-blood-red/5 transition-all group relative",
              stat.tab ? "cursor-pointer hover:border-blood-red/50 hover:scale-[1.02]" : ""
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl bg-white/5 group-hover:bg-blood-red/10 transition-colors")}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                {stat.change}
              </span>
            </div>
            <p className="text-text-secondary text-sm mb-1">{statsLabels[i]}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => setActiveTab('donors')}
          className="flex items-center justify-center gap-4 p-8 bg-black border border-white/10 rounded-[32px] shadow-2xl hover:scale-[1.02] transition-all group"
        >
          <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
            <Search className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-white leading-tight text-left">
            {t.findDonor.split(' ').map((word: string, i: number) => (
              <React.Fragment key={i}>
                {word}
                {i === 0 && <br />}
              </React.Fragment>
            ))}
          </span>
        </button>

        <button 
          onClick={() => setActiveTab('leaderboard')}
          className="flex items-center justify-center gap-4 p-8 bg-red-600 border border-white/10 rounded-[32px] shadow-2xl hover:scale-[1.02] transition-all group"
        >
          <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <span className="text-2xl font-bold text-white leading-tight text-left">
            {t.leaderboard}
          </span>
        </button>

        <button 
          onClick={() => window.location.href = 'tel:999'}
          className="flex items-center justify-center gap-4 p-8 bg-blue-600 border border-white/10 rounded-[32px] shadow-2xl hover:scale-[1.02] transition-all group"
        >
          <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold text-white leading-tight text-left">
            {t.callAmbulance.split(' ').map((word: string, i: number) => (
              <React.Fragment key={i}>
                {word}
                {i === 0 && <br />}
              </React.Fragment>
            ))}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold">{language === 'Bangla' ? 'বছরের ডোনেশন ট্রেন্ড' : 'Donation Trends (Yearly)'}</h3>
            <select 
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              className="text-sm bg-white/5 border border-glass-border text-text-primary rounded-lg px-3 py-1 outline-none"
            >
              <option className="bg-bg-dark">Last Month</option>
              <option className="bg-bg-dark">Last 3 Months</option>
              <option className="bg-bg-dark">Last 6 Months</option>
              <option className="bg-bg-dark">Last Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getFilteredChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ color: '#f9fafb' }}
                />
                <Line type="monotone" dataKey="donations" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Stock */}
        <div className="glass-card p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold mb-6">{t.bloodInventory}</h3>
          <div className="space-y-4">
            {bloodStock.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 text-sm font-bold">{item.group}</div>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      item.stock < 10 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : item.stock < 25 ? "bg-yellow-500" : "bg-green-500"
                    )}
                    style={{ width: `${item.stock}%` }}
                  ></div>
                </div>
                <div className="w-10 text-right text-sm text-text-secondary">{item.stock}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaigns */}
      <div className="glass-card p-6 rounded-2xl shadow-lg">
        <h3 className="font-bold mb-6">Upcoming Campaigns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <div 
              key={campaign.id} 
              className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <img src={campaign.photoURL || 'https://picsum.photos/seed/blood/400/200'} alt={campaign.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <h4 className="font-bold mb-1">{campaign.title}</h4>
                <p className="text-xs text-text-secondary mb-2">{campaign.location} • {campaign.date}</p>
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">{campaign.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Requests */}
      <div className="glass-card rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-glass-border flex items-center justify-between">
          <h3 className="font-bold">{t.urgentRequests}</h3>
          <button 
            onClick={() => setActiveTab('requests')}
            className="text-sm text-blood-red font-semibold hover:underline"
          >
            {t.viewAll}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-text-secondary text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">{t.patient}</th>
                <th className="px-6 py-4 font-semibold">{t.group}</th>
                <th className="px-6 py-4 font-semibold">{t.location}</th>
                <th className="px-6 py-4 font-semibold">{t.urgency}</th>
                <th className="px-6 py-4 font-semibold">{t.time}</th>
                <th className="px-6 py-4 font-semibold">{t.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blood-red/20 flex items-center justify-center text-blood-red font-bold text-xs border border-blood-red/30">
                        {req.patient.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium">{req.patient}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blood-red/20 text-blood-red rounded text-xs font-bold border border-blood-red/30">{req.group}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{req.location}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                      req.urgency === 'Critical' ? "bg-red-500/20 text-red-400 border border-red-500/30" : 
                      req.urgency === 'Urgent' ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    )}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{req.time}</td>
                  <td className="px-6 py-4 relative group/menu">
                    <button className="p-1 hover:bg-white/10 rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-text-secondary" />
                    </button>
                    <div className="absolute right-6 top-0 z-10 hidden group-hover/menu:block w-48 glass-card rounded-xl shadow-2xl border border-glass-border overflow-hidden animate-in fade-in slide-in-from-right-2 duration-200">
                      <button 
                        onClick={() => {
                          if (req.phone) window.location.href = `tel:${req.phone}`;
                          // @ts-ignore
                          else window.showToast('Phone number not available', 'error');
                        }}
                        className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-white/5 flex items-center gap-2"
                      >
                        <Phone className="w-3 h-3" /> {t.contactPatient}
                      </button>
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.location)}`, '_blank')}
                        className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-white/5 flex items-center gap-2"
                      >
                        <MapPin className="w-3 h-3" /> {t.viewLocation}
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await updateDoc(doc(db, 'requests', req.id), { status: 'completed' });
                          } catch (err) {
                            handleFirestoreError(err, OperationType.UPDATE, 'requests');
                          }
                        }}
                        className="w-full text-left px-4 py-3 text-xs font-medium hover:bg-white/5 flex items-center gap-2 text-green-400 border-t border-glass-border"
                      >
                        <CheckCircle2 className="w-3 h-3" /> {t.markCompleted}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AIView({ t }: { t: any }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t.aiGreeting }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: t.aiDemoMode }]);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col glass-card rounded-2xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-glass-border bg-white/5 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/40">
          <Activity className="text-white w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm">{t.aiAssistant}</h3>
          <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">{t.online}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={cn(
            "flex",
            m.role === 'user' ? "justify-end" : "justify-start"
          )}>
            <div className={cn(
              "max-w-[80%] p-4 rounded-2xl text-sm shadow-sm",
              m.role === 'user' 
                ? "bg-blood-red text-white rounded-tr-none" 
                : "bg-white/10 text-text-primary rounded-tl-none border border-glass-border"
            )}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-glass-border">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.aiPlaceholder} 
            className="flex-1 px-4 py-2 bg-white/5 border border-glass-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blood-red text-text-primary placeholder:text-text-secondary/50"
          />
          <button 
            onClick={handleSend}
            className="bg-blood-red text-white p-2 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
          >
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommunityFeedView({ t, onNewPost, isAdmin }: { t: any, onNewPost: () => void, isAdmin: boolean }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLike = async (post: any) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const likes = post.likes || [];
    const newLikes = likes.includes(user.uid) 
      ? likes.filter((id: string) => id !== user.uid)
      : [...likes, user.uid];
    
    try {
      await updateDoc(doc(db, 'posts', post.id), { likes: newLikes });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'posts');
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'posts');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">{t.communityFeed}</h2>
        <button 
          onClick={onNewPost}
          className="bg-blood-red text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/40 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {t.newPost}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blood-red"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-glass-border">
          <MessageCircle className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-20" />
          <p className="text-text-secondary font-medium">{t.noPosts}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="glass-card rounded-3xl overflow-hidden border border-glass-border shadow-2xl hover:bg-white/[0.03] transition-colors group">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blood-red/20 shadow-lg">
                      <img 
                        src={post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}&background=random`} 
                        alt={post.authorName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary">{post.authorName}</h4>
                      <p className="text-xs text-text-secondary">
                        {(post.createdAt && typeof post.createdAt.toDate === 'function') ? post.createdAt.toDate().toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  {(auth.currentUser?.uid === post.authorUid || isAdmin) && (
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <p className="text-text-primary leading-relaxed mb-4 whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.imageURL && (
                  <div className="rounded-[2rem] overflow-hidden mb-4 border border-glass-border shadow-xl">
                    <img 
                      src={post.imageURL} 
                      alt="Post content" 
                      className="w-full object-cover max-h-[500px]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => handleLike(post)}
                      className={cn(
                        "flex items-center gap-2 text-sm font-bold transition-all",
                        post.likes?.includes(auth.currentUser?.uid) ? "text-blood-red scale-110" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      <ThumbsUp className={cn("w-5 h-5", post.likes?.includes(auth.currentUser?.uid) ? "fill-blood-red" : "")} />
                      {post.likes?.length || 0}
                    </button>
                    <button className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      {post.commentsCount || 0}
                    </button>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AboutUsView({ t }: { t: any }) {
  const missionItems = [t.missionOne, t.missionTwo, t.missionThree];
  const features = [
    { icon: CheckCircle2, title: t.featureOne, desc: t.featureOneDesc, color: 'text-blood-red', bg: 'bg-blood-red/10' },
    { icon: Search, title: t.featureTwo, desc: t.featureTwoDesc, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ShieldCheck, title: t.featureThree, desc: t.featureThreeDesc, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 py-1 bg-blood-red/10 text-blood-red rounded-full text-xs font-bold uppercase tracking-widest mb-4"
        >
          {t.aboutUs}
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-white">
          {t.aboutTitle}
        </h1>
        <p className="text-2xl md:text-3xl font-serif italic text-blood-red/80 tracking-tight">
          "{t.aboutSubtitle}"
        </p>
        <div className="w-24 h-1 bg-blood-red mx-auto mt-8"></div>
        <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto font-medium">
          {t.aboutDescription}
        </p>
      </section>

      {/* Mission Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-left">
          <h2 className="text-4xl font-bold tracking-tight border-b-2 border-blood-red pb-4 inline-block">
            {t.ourMission}
          </h2>
          <ul className="space-y-6">
            {missionItems.map((item, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4 transition-transform hover:translate-x-2 duration-300"
              >
                <div className="mt-1 w-6 h-6 bg-blood-red text-white rounded-full flex items-center justify-center shrink-0 font-mono text-sm font-bold shadow-lg shadow-red-900/30">
                  {index + 1}
                </div>
                <span className="text-lg text-text-primary font-medium">{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="relative group overflow-hidden rounded-[3rem] shadow-2xl">
          <img 
            src="https://picsum.photos/seed/blood-donation/800/800" 
            alt="Blood Donation" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-10 left-10 text-left">
            <p className="text-white text-2xl font-black uppercase tracking-tighter">Together we save lives</p>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="space-y-10">
        <h2 className="text-4xl font-bold tracking-tight text-center">{t.whyChooseUs}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="glass-card p-8 rounded-[2.5rem] hover:bg-white/5 transition-all duration-300 group border-b-4 border-blood-red/0 hover:border-blood-red">
              <div className={cn("inline-flex p-4 rounded-3xl mb-6 transition-transform group-hover:scale-110", feature.bg, feature.color)}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer-like Branding */}
      <section className="text-center pt-8 border-t border-glass-border">
        <div className="flex items-center justify-center gap-3 opacity-80 mb-4 scale-90 cursor-default">
          <div className="w-10 h-10 bg-gradient-to-br from-blood-red to-red-900 rounded-2xl flex items-center justify-center rotate-12">
            <Heart className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="text-2xl font-bold tracking-tighter">RoktoBondhon</span>
        </div>
        <p className="text-sm text-text-secondary font-medium uppercase tracking-[0.2em]">Crafted with love for humanity</p>
      </section>
    </div>
  );
}

function SettingsView({ userData, userId, darkMode, setDarkMode, language, setLanguage, t, setActiveTab }: { userData: any, userId: string, darkMode: boolean, setDarkMode: (v: boolean) => void, language: string, setLanguage: (v: any) => void, t: any, setActiveTab: (v: string) => void }) {
  const [notifications, setNotifications] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      await auth.currentUser?.delete();
      signOut(auth);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'users');
    }
  };

  const navigateToProfile = async (uid: string) => {
    setActiveTab('profile');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title={t.deleteAccount}
        message="Are you sure you want to delete your account? This action is irreversible and all your data will be lost."
      />
      <div>
        <h2 className="text-2xl font-bold">{t.settings}</h2>
        <p className="text-text-secondary">Manage your account preferences and application settings.</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <Bell className="w-4 h-4 text-blood-red" /> {t.notifications}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t.pushNotifications}</p>
              <p className="text-xs text-text-secondary">{t.getNotified}</p>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-colors",
                notifications ? "bg-green-500" : "bg-gray-600"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                notifications ? "right-1" : "left-1"
              )}></div>
            </button>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-6">
          <h3 className="font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> {t.appPreferences}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t.darkMode}</p>
              <p className="text-xs text-text-secondary">{t.useDarkTheme}</p>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "w-12 h-6 rounded-full relative transition-colors",
                darkMode ? "bg-green-500" : "bg-gray-600"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                darkMode ? "right-1" : "left-1"
              )}></div>
            </button>
          </div>
          <div className="pt-4 border-t border-glass-border flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t.language}</p>
              <p className="text-xs text-text-secondary">{t.chooseLanguage}</p>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 border border-glass-border rounded-lg px-3 py-1 text-sm outline-none"
            >
              <option className="bg-bg-dark" value="Bangla">Bangla</option>
              <option className="bg-bg-dark" value="English">English</option>
            </select>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border-red-500/20">
          <h3 className="font-bold text-red-500 mb-4">{t.dangerZone}</h3>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-bold transition-colors border border-red-500/20"
          >
            {t.deleteAccount}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, isEditing, onChange, type = "text" }: { icon: any, label: string, value: string, isEditing: boolean, onChange?: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-text-secondary mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      {isEditing && onChange ? (
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-glass-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blood-red"
        />
      ) : (
        <p className="text-sm font-medium">{value}</p>
      )}
    </div>
  );
}

function NotificationsView({ t, setActiveTab, setProfileUid }: { t: any, setActiveTab: (tab: string) => void, setProfileUid: (uid: string | null) => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'notifications'), 
      where('recipientUid', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const notification of unread) {
      try {
        await updateDoc(doc(db, 'notifications', notification.id), { isRead: true });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20 text-text-secondary">{t.wait}</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.notifications}</h2>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={markAllRead}
            className="text-xs font-bold text-blood-red hover:underline uppercase tracking-wider"
          >
            {t.markAllRead}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-glass-border">
          <Bell className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-20" />
          <p className="text-text-secondary font-medium">{t.noNotifications}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={cn(
                "p-4 rounded-2xl border transition-all flex items-start gap-4 group",
                n.isRead 
                  ? "bg-white/5 border-glass-border opacity-70" 
                  : "bg-blood-red/10 border-blood-red/30 shadow-lg shadow-blood-red/5"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                n.type === 'request' ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
              )}>
                {n.type === 'request' ? <Droplets className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-text-primary">{n.title}</h4>
                  <p className="text-[10px] text-text-secondary font-medium">
                    {(n.createdAt && typeof n.createdAt.toDate === 'function') ? n.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{n.body}</p>
                <div className="flex gap-3 mt-2">
                  {!n.isRead && (
                    <button 
                      onClick={() => updateDoc(doc(db, 'notifications', n.id), { isRead: true })}
                      className="text-[10px] font-bold text-blood-red uppercase tracking-wider hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                  {n.type === 'request' && n.relatedId && (
                    <button 
                      onClick={async () => {
                        if (n.relatedId === 'requests') {
                          setActiveTab('requests');
                        } else {
                          try {
                            const reqDoc = await getDoc(doc(db, 'direct_requests', n.relatedId));
                            if(reqDoc.exists()) {
                                setProfileUid(reqDoc.data().requesterId);
                                setActiveTab('profile');
                            } else {
                                // Fallback if direct request not found, maybe it was deleted
                                // or it's a general request that didn't use 'requests' as relatedId
                                setActiveTab('requests');
                            }
                          } catch (err) {
                            console.error("Error fetching related request:", err);
                            setActiveTab('requests'); // Safe fallback
                          }
                        }
                      }}
                      className="text-[10px] font-bold text-blue-400 uppercase tracking-wider hover:underline"
                    >
                      View Request
                    </button>
                  )}
                </div>
              </div>
              <button 
                onClick={() => deleteNotification(n.id)}
                className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel",
  isDanger = true 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string, 
  confirmText?: string, 
  cancelText?: string,
  isDanger?: boolean
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-dark border border-glass-border p-8 rounded-[32px] shadow-2xl max-w-sm w-full space-y-6"
      >
        <div className="space-y-2">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-text-secondary text-sm">{message}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "flex-1 py-3 rounded-xl font-bold transition-all",
              isDanger ? "bg-blood-red hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DonationsView({ t, user, userData }: { t: any, user: User | null, userData: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStory, setNewStory] = useState({
    recipient: '',
    group: 'A+',
    message: '',
    rating: 5
  });

  useEffect(() => {
    const q = query(collection(db, 'donation_stories'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: (doc.data().createdAt && typeof doc.data().createdAt.toDate === 'function') ? doc.data().createdAt.toDate().toLocaleDateString() : 'Just now'
      })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    if (!user || !newStory.recipient || !newStory.message) return;
    try {
      await addDoc(collection(db, 'donation_stories'), {
        donorUid: user.uid,
        donorName: userData?.name || user.displayName || 'Anonymous Donor',
        donorPhoto: userData?.photoURL || user.photoURL || '',
        recipient: newStory.recipient,
        group: newStory.group,
        message: newStory.message,
        rating: newStory.rating,
        createdAt: serverTimestamp()
      });
      setShowModal(false);
      setNewStory({ recipient: '', group: 'A+', message: '', rating: 5 });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'donation_stories');
    }
  };

  const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{t.successfulDonations || 'Successful Donations'}</h2>
          <p className="text-text-secondary">Real stories and reviews from our blood donors</p>
        </div>
        {user && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blood-red hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blood-red/20 shrink-0"
          >
            <Plus className="w-5 h-5" />
            Share Your Story
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-text-secondary">Loading stories...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-black/20 rounded-3xl border border-glass-border">
          <Heart className="w-12 h-12 text-glass-border mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Stories Yet</h3>
          <p className="text-text-secondary">Be the first to share your donation experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="glass-card p-6 rounded-3xl space-y-4 hover:border-blood-red/30 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/20 shrink-0">
                    <img src={review.donorPhoto || `https://ui-avatars.com/api/?name=${review.donorName}&background=random`} alt={review.donorName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold truncate max-w-[150px]">{review.donorName}</h4>
                    <p className="text-[10px] text-text-secondary truncate max-w-[150px]">Donated to {review.recipient}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blood-red/10 border border-blood-red/20 text-blood-red rounded-lg font-bold text-sm shrink-0">
                  {review.group}
                </div>
              </div>
              <p className="text-sm text-text-secondary italic line-clamp-3">"{review.message}"</p>
              <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Heart key={i} className={cn("w-3 h-3", i < review.rating ? "fill-blood-red text-blood-red" : "text-glass-border")} />
                  ))}
                </div>
                <span className="text-xs text-text-secondary font-bold">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="glass-card w-full max-w-md p-6 rounded-3xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-text-secondary hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold mb-6">Share Donation Story</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Recipient Name (Patient)</label>
                <input 
                  type="text" 
                  value={newStory.recipient}
                  onChange={(e) => setNewStory({...newStory, recipient: e.target.value})}
                  className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 outline-none focus:border-blood-red/50" 
                  placeholder="E.g., Rahim Chowdhury"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Blood Group Donated</label>
                <div className="grid grid-cols-4 gap-2">
                  {groups.map(g => (
                    <button
                      key={g}
                      onClick={() => setNewStory({...newStory, group: g})}
                      className={cn("py-2 rounded-lg font-bold text-sm transition-all", newStory.group === g ? "bg-blood-red text-white" : "bg-white/5 hover:bg-white/10 text-white")}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Your Experience</label>
                <textarea 
                  value={newStory.message}
                  onChange={(e) => setNewStory({...newStory, message: e.target.value})}
                  rows={4}
                  className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-3 outline-none focus:border-blood-red/50 resize-none" 
                  placeholder="How did you feel? Was the process smooth?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <button key={star} onClick={() => setNewStory({...newStory, rating: star})}>
                      <Heart className={cn("w-8 h-8 transition-colors", newStory.rating >= star ? "fill-blood-red text-blood-red" : "text-glass-border")} />
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleSubmit}
                disabled={!newStory.recipient || !newStory.message}
                className="w-full bg-blood-red text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50 hover:bg-red-700 transition-colors"
              >
                Post Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
