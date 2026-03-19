/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect, useRef, Component } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { Logo } from './components/Logo';
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Download,
  ChevronDown,
  Cpu,
  Zap,
  Globe,
  Code,
  Layers,
  Terminal,
  Award,
  BookOpen,
  Send,
  Menu,
  X,
  ArrowUp,
  GraduationCap,
  MapPin,
  Calendar,
  Lightbulb,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Wind,
  Sun,
  User,
  Settings,
  LogOut,
  LogIn,
  Camera,
  Check,
  AlertCircle,
  Loader2,
  Palette,
  Sparkles,
  Wand2,
  Maximize2
} from 'lucide-react';
import { generateProjectImage } from './services/aiService';
import {
  auth,
  db,
  storage,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  FirebaseUser,
  OperationType,
  handleFirestoreError
} from './firebase';

// --- Identity Constants ---
const IDENTITY = {
  fullName: "SURYA BOLISETTI",
  initials: "SB",
  title: "ELECTRICAL AND ELECTRONICS ENGINEER",
  stream: "ELECTRICAL AND ELECTRONICS ENGINERING",
  degree: "B.TECH EEE",
  dob: "1-11-2004",
  college: "Andhra Loyola Institute of Engineering and Technology",
  email: "venkatasuryabolisetti4@gmail.com",
  bio1: "I am an Electrical and Electronics Engineering student focused on Electrical machines and transformers, power systems Embedded Systems, IoT, Smart Energy Technologies, and Industrial Automation — turning real-world engineering problems into reliable, scalable solutions.",
  bio2: "Through industrial training at 33/11KV Substation, I built a strong foundation in power systems, electrical machines, control systems, and industrial maintenance — with the discipline for real production environments.",
  bio3: "",
  bio4: "",
  university: "Andhra Loyola Institute of Engineering and Technology",
  years: "2024 - 2027",
  cgpa: "7.3",
  specialization: "Embedded Systems & Power Electronics",
  location: "WEST GODAVARI, AP",
  github: "https://github.com/suryabolisetti",
  linkedin: "https://linkedin.com/in/suryabolisetti",
  resumeUrl: "#",
  profilePic: "/surya.jpg.jpeg",
  stats: {
    projects: 4,
    technologies: 25,
    certifications: 5,
    years: 4
  }
};

// --- Types ---
type ProjectStatus = "Live" | "In Progress" | "Completed";

interface Project {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  details?: {
    overview: string;
    features: string[];
    techStack: string[];
    applications: string[];
  };
  imageUrl: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  status: ProjectStatus;
  category: string;
}

interface Experience {
  role: string;
  org: string;
  period: string;
  description: string;
}

interface Paper {
  title: string;
  abstract: string;
  keywords: string[];
  venue: string;
  url: string;
  docsUrl?: string;
  images?: string[];
}

interface Certification {
  title: string;
  issuer: string;
  date: string;
  url: string;
  imageUrl?: string;
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
  imageUrl?: string;
}

interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  photoURL?: string;
  preferences: {
    theme: 'cyberpunk' | 'matrix' | 'minimal' | 'gold' | 'sunset';
    notifications: boolean;
  };
  createdAt: any;
  updatedAt?: any;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<any, any> {
  public state: any = { hasError: false, errorInfo: null };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.errorInfo || '');
        if (parsed.error && parsed.operationType) {
          displayMessage = `Firestore Error: ${parsed.operationType} failed at ${parsed.path}. ${parsed.error}`;
        }
      } catch (e) {
        displayMessage = this.state.errorInfo || displayMessage;
      }

      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center p-6">
          <div className="glass-card max-w-md w-full p-8 border border-error/20 text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h2 className="text-xl font-display text-text-primary mb-2">Application Error</h2>
            <p className="text-text-muted text-sm mb-6">{displayMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const SettingsModal = ({ profile, onClose, onUpdate }: { profile: UserProfile, onClose: () => void, onUpdate: (p: UserProfile) => void }) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [theme, setTheme] = useState(profile.preferences.theme);
  const [notifications, setNotifications] = useState(profile.preferences.notifications);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${profile.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', profile.uid), { photoURL: url });
      onUpdate({ ...profile, photoURL: url });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        displayName,
        preferences: { theme, notifications },
        updatedAt: serverTimestamp()
      };
      await updateDoc(doc(db, 'users', profile.uid), updates);
      onUpdate({ ...profile, ...updates });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg-base/90 backdrop-blur-sm z-[2000] flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 border border-accent-primary/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl text-text-primary">Settings</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full border-2 border-accent-primary/30 overflow-hidden mb-4">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-bg-elevated flex items-center justify-center">
                  <User size={32} className="text-accent-primary" />
                </div>
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera size={20} className="text-white" />
                <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
              </label>
              {isUploading && (
                <div className="absolute inset-0 bg-bg-base/60 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-accent-primary" />
                </div>
              )}
            </div>
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">@{profile.username}</p>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-accent-primary uppercase tracking-widest mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-bg-elevated border border-accent-primary/20 rounded px-4 py-2 text-sm text-text-primary focus:border-accent-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-accent-primary uppercase tracking-widest mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {['cyberpunk', 'matrix', 'minimal', 'gold', 'sunset'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t as any)}
                  className={`px-3 py-2 rounded border text-[10px] font-mono uppercase tracking-wider transition-all ${theme === t ? 'bg-accent-primary border-accent-primary text-bg-base' : 'bg-bg-elevated border-accent-primary/20 text-text-muted hover:border-accent-primary/50'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-accent-primary uppercase tracking-widest">Notifications</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-10 h-5 rounded-full relative transition-colors ${notifications ? 'bg-accent-primary' : 'bg-bg-elevated'}`}
            >
              <motion.div
                animate={{ x: notifications ? 20 : 2 }}
                className="absolute top-1 w-3 h-3 rounded-full bg-white"
              />
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full btn-primary h-10 mt-4"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProfileSetupModal = ({ user, onComplete }: { user: FirebaseUser, onComplete: (profile: UserProfile) => void }) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkUsername = async (name: string) => {
    if (name.length < 3) return;
    setIsChecking(true);
    setError('');
    try {
      const q = query(collection(db, 'usernames'), where('__name__', '==', name.toLowerCase()));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setError('Username is already taken');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (error || !username || !displayName) return;
    setIsSubmitting(true);
    try {
      const lowerUsername = username.toLowerCase();
      await setDoc(doc(db, 'usernames', lowerUsername), { uid: user.uid });

      const newProfile: UserProfile = {
        uid: user.uid,
        username: lowerUsername,
        displayName,
        photoURL: user.photoURL || undefined,
        preferences: {
          theme: 'cyberpunk',
          notifications: true
        },
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
      onComplete(newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg-base/90 backdrop-blur-sm z-[2000] flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card max-w-md w-full p-8 border border-accent-primary/20"
      >
        <h2 className="font-display text-2xl text-text-primary mb-2">Complete Your Profile</h2>
        <p className="text-text-muted text-sm mb-6">Choose a unique username to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-accent-primary uppercase tracking-widest mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                  setUsername(val);
                  checkUsername(val);
                }}
                className="w-full bg-bg-elevated border border-accent-primary/20 rounded px-4 py-2 text-sm text-text-primary focus:border-accent-primary outline-none transition-colors"
                placeholder="e.g. tech_enthusiast"
                required
                minLength={3}
                maxLength={20}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking ? <Loader2 size={14} className="animate-spin text-accent-primary" /> :
                  username.length >= 3 && !error ? <Check size={14} className="text-success" /> :
                    error ? <AlertCircle size={14} className="text-error" /> : null}
              </div>
            </div>
            {error && <p className="text-error text-[10px] mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-mono text-accent-primary uppercase tracking-widest mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-bg-elevated border border-accent-primary/20 rounded px-4 py-2 text-sm text-text-primary focus:border-accent-primary outline-none transition-colors"
              placeholder="Your Name"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!error || username.length < 3}
            className="w-full btn-primary h-10 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Create Profile'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// --- Data ---
const PROJECTS: Project[] = [
  {
    id: "01",
    title: "Digital Battery Voltage Measurement",
    description: "A precise digital voltmeter system using Arduino and LCD to monitor battery health and voltage levels in real-time with high accuracy.",
    detailedDescription: "The Digital Battery Voltage Measurement system is an essential tool for monitoring electrical systems, ensuring battery health, and preventing over-discharge. Designed with an Arduino UNO and high-precision analog-to-digital conversion, it provides real-time feedback through an LCD interface. This system is perfect for DIY power setups, solar energy monitoring, and automotive battery health checks.",
    details: {
      overview: "A precise digital voltmeter system using Arduino and LCD to monitor battery health and voltage levels in real-time with high accuracy.",
      features: [
        "Real-time voltage monitoring with 0.1V precision",
        "Visual alerts for low battery levels",
        "Calibration logic for accurate readings",
        "Low power consumption design"
      ],
      techStack: ["Arduino UNO", "16x2 LCD Display", "Voltage Divider", "Embedded C++"],
      applications: ["Solar Energy Systems", "Battery Maintenance", "Portable Electronics"]
    },
    imageUrl: "/project1.png",
    tags: ["Arduino", "ADC", "LCD Display", "Embedded C"],
    githubUrl: "#",
    liveUrl: "—",
    status: "Completed",
    category: "Electronics"
  },
  {
    id: "02",
    title: "Automatic Exhaust Fan",
    description: "Smart ventilation system that automatically triggers an exhaust fan based on temperature and humidity thresholds using DHT11 sensors.",
    detailedDescription: "The Auto Exhaust Fan is an intelligent safety system designed to prevent gas-related accidents and ensure fresh air circulation. Built around an Arduino UNO and MQ-2 Gas/Smoke sensor, it continuously monitors air quality. Upon detecting hazardous levels of smoke or gas, the system automatically triggers a 5V relay to switch on a high-power exhaust fan, effectively ventilating the space. This solution addresses the risks of human error in manual ventilation control and is ideal for kitchens, workshops, and chemical storage areas.",
    details: {
      overview: "An intelligent safety system designed to prevent gas-related accidents and ensure fresh air circulation through automated air quality monitoring.",
      features: [
        "Continuous gas/smoke detection (MQ-2)",
        "Automatic relay-based fan control",
        "Threshold-based trigger logic",
        "Emergency visual Indicators"
      ],
      techStack: ["Arduino UNO", "MQ-2 Sensor", "5V Relay", "Exhaust Fan"],
      applications: ["Industrial Kitchens", "Chemical Storage", "Electronic Workshops"]
    },
    imageUrl: "/project2.png",
    tags: ["Sensors", "Relay Control", "Microcontroller", "Automation"],
    githubUrl: "#",
    liveUrl: "—",
    status: "Completed",
    category: "Automation"
  },
  {
    id: "03",
    title: "Automatic Street Lights",
    description: "Energy-efficient lighting system using LDR sensors to automatically control street lights based on ambient light intensity.",
    detailedDescription: "This smart street lighting solution addresses the growing need for energy conservation in urban environments. Using Light Dependent Resistors (LDR), the system senses ambient light levels and automatically toggles high-efficiency LED lights. By eliminating human intervention and preventing lights from remaining on during daylight hours, it significantly reduces electricity wastage and maintenance costs for municipal infrastructure.",
    details: {
      overview: "Energy-efficient lighting system using LDR sensors to automatically control street lights based on ambient light intensity, reducing power wastage.",
      features: [
        "Ambient light sensitivity adjustment",
        "Automatic day/night switching",
        "Energy surge protection",
        "Scalable network architecture"
      ],
      techStack: ["LDR Sensor", "Microcontroller", "LED Array", "Power Regulation"],
      applications: ["Urban Street Lighting", "Campus Safety", "Residential Driveways"]
    },
    imageUrl: "/project3.png",
    tags: ["LDR", "Power Management", "Energy Saving", "Electronics"],
    githubUrl: "#",
    liveUrl: "—",
    status: "Completed",
    category: "Smart City"
  },
  {
    id: "04",
    title: "Regenerative Braking System",
    description: "Prototype demonstrating energy recovery during braking in electric vehicles, converting kinetic energy back into electrical energy.",
    detailedDescription: "The Regenerative Braking System prototype showcases the future of sustainable transportation. In a standard electric vehicle, braking energy is typically lost as heat. This system reverses the motor's role during deceleration, turning it into a generator that feeds energy back into the battery. Experimental testing achieved an energy recovery efficiency of 40% – 65%, proving it as a critical component for extending EV range and improving overall energy efficiency.",
    details: {
      overview: "Prototype demonstrating energy recovery during braking in electric vehicles, converting kinetic energy back into electrical energy for battery storage.",
      features: [
        "Efficient energy conversion (Motor-to-Generator)",
        "High-efficiency storage interface",
        "Dynamic braking feedback system",
        "Real-time efficiency monitoring"
      ],
      techStack: ["Brushless DC Motor", "Supercapacitors", "Power Converter", "Arduino Controller"],
      applications: ["Electric Vehicles", "Light Rail Systems", "Electric Bicycles"]
    },
    imageUrl: "/project4.png",
    tags: ["Electric Vehicles", "Energy Recovery", "Motor Control", "Power Electronics"],
    githubUrl: "#",
    liveUrl: "/research-paper.pdf",
    status: "In Progress",
    category: "Green Tech"
  }
];

const EDUCATION: Education[] = [
  {
    degree: "B.Tech in EEE",
    institution: "Andhra Loyola Institute of Engineering and Technology",
    location: "Vijayawada",
    period: "2024 - 2027"
  },
  {
    degree: "Diploma in EEE",
    institution: "SRI VASAVI ENGINEERING COLLEGE",
    location: "TADEPALLIGUDEM",
    period: "2021 - 2024",
    imageUrl: "/WhatsApp Image 2026-03-18 at 3.00.57 PM.jpeg"
  },
  {
    degree: "SSC",
    institution: "Roots School of Essential Faculties Tanuku",
    location: "West Godavari, AP",
    period: "Completed",
    imageUrl: "/WhatsApp Image 2026-03-18 at 3.03.13 PM.jpeg"
  }
];

const EXPERIENCES: Experience[] = [
  {
    role: "Embedded Systems Intern",
    org: "Techtronics Solutions",
    period: "May 2024 - July 2024",
    description: "Developed firmware for industrial IoT gateways. Optimized power consumption by 30% using deep sleep modes and efficient sensor polling."
  },
  {
    role: "Research Assistant",
    org: "University Power Lab",
    period: "Aug 2023 - April 2024",
    description: "Assisted in modeling smart grid stability under high renewable penetration using MATLAB/Simulink."
  },
  {
    role: "IoT Project Lead",
    org: "Robotics Club",
    period: "Jan 2023 - Present",
    description: "Leading a team of 5 to build an autonomous warehouse robot. Responsible for sensor fusion and motor control logic."
  },
  {
    role: "Student Coordinator",
    org: "IEEE Student Branch",
    period: "June 2022 - June 2023",
    description: "Organized technical workshops on Arduino and PCB design for over 200 students."
  }
];

const PAPERS: Paper[] = [
  {
    title: "Regenerative Braking System: A Comprehensive Study on Energy Recovery in EVs",
    abstract: "This research presents a comprehensive study of regenerative braking technology, focusing on system architecture and performance analysis. The study demonstrates that regenerative braking can recover up to 60–70% of braking energy depending on vehicle speed and system configuration. Experimental results showed an energy recovery efficiency of 40% – 65%, significantly reducing mechanical brake wear and extending battery life.",
    keywords: ["Electric Vehicles", "Energy Recovery", "Battery Storage", "Generator Mode", "Power Electronics"],
    venue: "TECHNICAL PAPER PRESENTATION-2K26",
    url: "/research-paper.pdf",
    images: ["/research-page-1.jpg", "/research-page-2.jpg"]
  }
];

const CERTIFICATIONS: Certification[] = [
  {
    title: "Electric Vehicle Technology",
    issuer: "Sri Vasavi Engineering College",
    date: "Dec 2023",
    url: "#",
    imageUrl: "/cert_ev.jpg"
  },
  {
    title: "Robotics Technology (M-botix)",
    issuer: "Chefronics Technologies Pvt. Ltd.",
    date: "Oct 2024",
    url: "#",
    imageUrl: "/cert_robotics.jpg"
  },
  {
    title: "IOT with Embedded system Technology",
    issuer: "SRC e-Solutions / ALIET",
    date: "Sep 2025",
    url: "#",
    imageUrl: "/cert_iot.jpg"
  },
  {
    title: "Drone Technology",
    issuer: "Aeroforge / ALIET",
    date: "Mar 2025",
    url: "#",
    imageUrl: "/cert_drone.jpg"
  },
  {
    title: "IIOT (Industrial Internet of Things)",
    issuer: "Andhra Loyola Institute (ALIET)",
    date: "Jan 2026",
    url: "#",
    imageUrl: "/cert_iiot.jpg"
  }
];

// --- Components ---

const SectionHeader = ({ label, heading, subtitle }: { label: string, heading: string, subtitle?: string }) => (
  <div className="text-center mb-16">
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-accent-primary font-mono text-xs tracking-[0.3em] uppercase block mb-4"
    >
      {label}
    </motion.span>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-6"
    >
      {heading}
    </motion.h2>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-text-muted font-mono text-sm max-w-lg mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const SkillBar = ({ name, proficiency }: { name: string, proficiency: number, key?: React.Key }) => (
  <div className="mb-6">
    <div className="flex justify-between mb-2">
      <span className="text-text-primary font-mono text-xs uppercase tracking-wider">{name}</span>
      <span className="text-accent-primary font-mono text-xs">{proficiency}%</span>
    </div>
    <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${proficiency}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
      />
    </div>
  </div>
);

const ProjectCard = ({ project, onViewDetail, onGenerateImage, isGenerating }: { project: Project, onViewDetail: (p: Project) => void, onGenerateImage: (id: string, title: string) => void, isGenerating: boolean, key?: React.Key }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="glass-card overflow-hidden flex flex-col group relative"
  >
    {/* Tech Corner Accent */}
    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent-primary opacity-40 z-10" />

    <div
      className="h-52 relative overflow-hidden cursor-pointer"
      onClick={() => onViewDetail(project)}
    >
      <img
        src={project.imageUrl}
        alt={project.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent opacity-80" />

      {/* Category Badge */}
      <div className="absolute top-4 left-4 z-20">
        <span className="px-2 py-1 bg-bg-base/80 backdrop-blur-md border border-accent-primary/30 text-accent-primary font-mono text-[9px] uppercase tracking-widest rounded">
          {project.category}
        </span>
      </div>

      <span className="font-jetbrains text-7xl text-white/5 absolute -bottom-4 -left-2 select-none pointer-events-none group-hover:text-accent-primary/10 transition-colors duration-500">{project.id}</span>

      {/* AI Generate Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-[2px] z-30">
        <div className="flex flex-col gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetail(project); }}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-jetbrains text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          >
            <ExternalLink size={14} /> View Details
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onGenerateImage(project.id, project.title); }}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-bg-base rounded-full font-jetbrains text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.4)]"
          >
            {isGenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {isGenerating ? 'Synthesizing...' : 'Regenerate AI'}
          </button>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md ${project.status === 'Live' ? 'bg-success/20 border-success text-success shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
            project.status === 'In Progress' ? 'bg-accent-secondary/20 border-accent-secondary text-accent-secondary shadow-[0_0_10px_rgba(255,0,255,0.2)]' :
              'bg-accent-primary/20 border-accent-primary text-accent-primary shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.2)]'
          }`}>
          {project.status}
        </span>
      </div>
    </div>

    <div className="p-6 flex-grow flex flex-col">
      <h3 className="font-display text-xl text-text-primary mb-3 group-hover:text-accent-primary transition-colors duration-300">{project.title}</h3>
      <p className="text-text-muted font-mono text-xs leading-relaxed line-clamp-3 mb-6 opacity-80 group-hover:opacity-100 transition-opacity">
        {project.description}
      </p>

      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-accent-primary/5 text-accent-primary font-mono text-[9px] rounded border border-accent-primary/10">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/5">
          <a href={project.githubUrl} className="flex items-center gap-2 text-text-muted hover:text-accent-primary transition-colors text-[10px] font-mono uppercase tracking-wider">
            <Github size={14} /> Repository
          </a>
          <button
            onClick={() => onViewDetail(project)}
            className="flex items-center gap-2 text-accent-secondary hover:brightness-125 transition-all text-[10px] font-mono uppercase tracking-wider"
          >
            <ChevronDown size={14} className="-rotate-90" /> Read Case Study
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const ProjectDetail = ({ project, onClose }: { project: Project, onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[5000] bg-bg-base overflow-y-auto"
  >
    <div className="min-h-screen relative">
      {/* Hero Header */}
      <div className="h-[60vh] relative">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-base/50 to-bg-base" />

        <button
          onClick={onClose}
          className="absolute top-8 left-8 p-3 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 hover:bg-accent-primary transition-colors flex items-center gap-2 font-mono text-xs uppercase tracking-widest z-50"
        >
          <X size={18} /> Close
        </button>

        <div className="absolute bottom-12 left-0 w-full px-6 md:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="px-3 py-1 bg-accent-primary text-bg-base font-mono text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 inline-block">
              {project.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-syncopate font-bold text-text-primary uppercase mb-4 leading-tight">
              {project.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-20 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-12"
          >
            <section>
              <h2 className="text-accent-primary font-mono text-xs uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <div className="w-8 h-px bg-accent-primary" /> Case Study Overview
              </h2>
              <p className="text-xl md:text-2xl text-text-muted font-mono leading-relaxed">
                {project.detailedDescription}
              </p>
            </section>

            {project.details && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-accent-primary/10">
                <div>
                  <h3 className="font-display text-sm text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Zap size={16} className="text-accent-secondary" /> Core Features
                  </h3>
                  <ul className="space-y-4">
                    {project.details.features.map((f, i) => (
                      <li key={i} className="flex gap-3 text-text-muted font-mono text-sm leading-relaxed">
                        <span className="text-accent-primary font-bold">»</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-sm text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Globe size={16} className="text-accent-primary" /> Key Applications
                  </h3>
                  <ul className="space-y-4">
                    {project.details.applications.map((a, i) => (
                      <li key={i} className="flex gap-3 text-text-muted font-mono text-sm leading-relaxed">
                        <span className="text-accent-secondary font-bold">•</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-12"
          >
            <div className="glass-card p-8 border-l-4 border-accent-primary">
              <h3 className="text-accent-primary font-mono text-[10px] uppercase tracking-[0.3em] mb-6">Technical Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.details?.techStack.map(tech => (
                  <span key={tech} className="px-3 py-1 bg-accent-primary/5 border border-accent-primary/20 text-accent-primary font-mono text-[10px] rounded uppercase tracking-wider">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <a href={project.githubUrl} className="flex items-center justify-between p-4 bg-bg-elevated border border-accent-primary/20 rounded hover:border-accent-primary transition-all group">
                <div className="flex items-center gap-4">
                  <Github size={20} className="text-text-muted group-hover:text-accent-primary" />
                  <span className="font-mono text-xs uppercase tracking-widest">Source Code</span>
                </div>
                <ExternalLink size={14} className="text-text-muted" />
              </a>
              <a
                href={project.liveUrl !== '—' ? project.liveUrl : '#'}
                target="_blank"
                rel="noopener noreferrer"
                disabled={project.liveUrl === '—'}
                className={`w-full flex items-center justify-between p-4 bg-bg-elevated border border-accent-secondary/20 rounded hover:border-accent-secondary transition-all group ${project.liveUrl === '—' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <ExternalLink size={20} className="text-text-muted group-hover:text-accent-secondary" />
                  <span className="font-mono text-xs uppercase tracking-widest">Technical Paper</span>
                </div>
                <Download size={14} className="text-text-muted" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Embedded PDF Viewer */}
        {project.liveUrl.toLowerCase().endsWith('.pdf') && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 pt-20 border-t border-accent-primary/10"
          >
            <h2 className="text-accent-primary font-mono text-xs uppercase tracking-[0.3em] mb-12 flex items-center gap-2">
              <div className="w-8 h-px bg-accent-primary" /> Full Research Paper
            </h2>
            <div className="w-full h-[800px] bg-bg-elevated rounded-xl border border-white/5 overflow-hidden relative group">
              <object
                data={`${project.liveUrl}#toolbar=0`}
                type="application/pdf"
                className="w-full h-full border-none"
                title={`${project.title} Paper`}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle size={48} className="text-accent-primary mb-4" />
                  <p className="text-text-primary font-display text-lg mb-4">PDF Viewer unavailable in your browser</p>
                  <a href={project.liveUrl} className="btn-primary">Download to View Offline</a>
                </div>
              </object>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-accent-primary text-bg-base rounded-full shadow-xl flex items-center gap-2 font-mono text-[10px] uppercase font-bold tracking-widest hover:scale-105 transition-transform"
                >
                  <Maximize2 size={14} /> Full Screen
                </a>
              </div>
            </div>
          </motion.section>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="mt-20 border-t border-accent-primary/10 py-20 bg-bg-surface/30">
        <div className="max-w-4xl mx-auto text-center px-6">
          <p className="text-text-muted font-mono text-[10px] uppercase tracking-[0.4em] mb-4">WANT TO SEE MORE?</p>
          <button
            onClick={onClose}
            className="font-syncopate text-2xl md:text-3xl font-bold text-text-primary hover:text-accent-primary transition-colors uppercase cursor-pointer"
          >
            ← BACK TO ALL PROJECTS
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);


const ExperienceItem = ({ exp, index }: { exp: Experience, index: number, key?: React.Key }) => {
  const isLeft = index % 2 === 0;
  return (
    <div className={`flex w-full mb-12 items-center justify-center relative ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      {/* Node */}
      <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-accent-primary rounded-full z-10 shadow-[0_0_10px_rgba(0,242,255,0.5)] border-4 border-bg-base" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`w-full md:w-[45%] glass-card p-6 ${isLeft ? 'md:mr-auto' : 'md:ml-auto'}`}
      >
        <span className="text-accent-secondary font-mono text-[10px] tracking-[0.2em] uppercase mb-2 block">{exp.period}</span>
        <h3 className="font-display text-base text-text-primary mb-1">{exp.role}</h3>
        <p className="text-accent-primary font-mono text-xs mb-4">{exp.org}</p>
        <p className="text-text-muted font-mono text-xs leading-relaxed">{exp.description}</p>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState('Hardware');
  const [projectFilter, setProjectFilter] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // User Profile State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [generatingProjectId, setGeneratingProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activePaperImages, setActivePaperImages] = useState<string[] | null>(null);

  const handleGenerateImage = async (id: string, title: string) => {
    setGeneratingProjectId(id);
    const prompt = `A professional electrical engineering product photograph of a ${title}. The image should showcase high-quality circuit boards, copper wiring, electrical components like capacitors and resistors, and a clean industrial prototype. Focus on the electrical assembly, power systems, and technical precision. Studio lighting, macro detail, 8k resolution, electrical laboratory setting.`;
    const imageUrl = await generateProjectImage(prompt);
    if (imageUrl) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, imageUrl } : p));
    }
    setGeneratingProjectId(null);
  };

  // Auto-generate project images on mount if they are placeholders
  useEffect(() => {
    const autoGen = async () => {
      for (const project of projects) {
        if (project.imageUrl.includes('picsum.photos')) {
          await handleGenerateImage(project.id, project.title);
        }
      }
    };
    autoGen();
  }, []);

  // Theme logic
  useEffect(() => {
    if (profile) {
      document.documentElement.setAttribute('data-theme', profile.preferences.theme);
    } else {
      document.documentElement.setAttribute('data-theme', 'cyberpunk');
    }
  }, [profile]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            setShowProfileSetup(true);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const roles = [
    "EEE Engineer",
    "Embedded Systems",
    "IoT Solutions",
    "Smart Energy",
    "Industrial Automation",
    "Firmware Architecture"
  ];

  // Typewriter Logic
  useEffect(() => {
    const handleType = () => {
      const i = loopNum % roles.length;
      const fullText = roles[i];

      setTypewriterText(isDeleting
        ? fullText.substring(0, typewriterText.length - 1)
        : fullText.substring(0, typewriterText.length + 1)
      );

      setTypingSpeed(isDeleting ? 40 : 80);

      if (!isDeleting && typewriterText === fullText) {
        setTimeout(() => setIsDeleting(true), 1800);
      } else if (isDeleting && typewriterText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [typewriterText, isDeleting, loopNum, typingSpeed]);

  // Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProjects = projects.filter(p =>
    projectFilter === 'All' || p.category === projectFilter
  );

  const skillCategories = {
    Hardware: {
      bars: [
        { name: "Microcontrollers (ESP32, Arduino)", prof: 90 },
        { name: "Sensor Integration (IMU, GPS, DHT)", prof: 85 },
        { name: "Circuit Design & Prototyping", prof: 75 },
        { name: "Communication Protocols (I2C,UART)", prof: 80 },
        { name: "Power Electronics & Charging", prof: 70 }
      ],
      tags: ["ESP32", "Arduino UNO", "Arduino Nano", "MPU-6050", "NEO-6M GPS", "DHT11", "MQ-2", "TP4056", "LiPo Battery", "LDR", "IR Sensor", "Ultrasonic", "Servo Motor"]
    },
    Firmware: {
      bars: [
        { name: "C/C++ for Microcontrollers", prof: 85 },
        { name: "Arduino IDE / PlatformIO", prof: 90 },
        { name: "UART/I2C/SPI Programming", prof: 80 },
        { name: "Real-time Sensor Processing", prof: 82 },
        { name: "Wi-Fi & HTTPS from MCU", prof: 78 }
      ],
      tags: ["Arduino IDE", "PlatformIO", "TinyGPS++", "MPU6050 Library", "SoftwareSerial", "WebSocket", "HTTPS PUT", "OTA Updates"]
    },
    "Cloud & IoT": {
      bars: [
        { name: "Firebase RTDB", prof: 88 },
        { name: "Firestore", prof: 80 },
        { name: "MQTT Protocol", prof: 75 },
        { name: "REST API Design", prof: 78 },
        { name: "Node.js Backend Bridge", prof: 70 }
      ],
      tags: ["Firebase RTDB", "Firestore", "Firebase Auth", "MQTT", "HiveMQ", "Node.js", "REST API", "WebSocket", "JSON"]
    },
    "Web Dev": {
      bars: [
        { name: "React / Next.js 14", prof: 82 },
        { name: "TypeScript", prof: 72 },
        { name: "Tailwind CSS", prof: 85 },
        { name: "Data Visualization (Recharts)", prof: 78 },
        { name: "Map Integration (MapLibre GL)", prof: 70 }
      ],
      tags: ["Next.js 14", "React", "Vite", "TypeScript", "Tailwind CSS", "Recharts", "MapLibre GL", "Framer Motion", "Vercel", "HTML", "CSS", "JS"]
    },
    "Power Systems": {
      bars: [
        { name: "Circuit Analysis & Z-Bus", prof: 75 },
        { name: "Power Flow Analysis", prof: 70 },
        { name: "Smart Grid Concepts", prof: 72 },
        { name: "Solar Energy Systems", prof: 68 },
        { name: "SCADA Concepts", prof: 65 }
      ],
      tags: ["Z-Bus Matrix", "Load Flow", "MATLAB", "Smart Grid", "Solar Charging", "SCADA", "LTSpice", "Simulink"]
    },
    Tools: {
      bars: [
        { name: "MATLAB / Simulink", prof: 72 },
        { name: "Wokwi (ESP32 Simulator)", prof: 85 },
        { name: "Git & GitHub", prof: 82 },
        { name: "Three.js / WebGL", prof: 70 },
        { name: "Figma (UI Mockups)", prof: 65 }
      ],
      tags: ["MATLAB", "Wokwi", "Git", "GitHub", "Three.js", "VS Code", "LTSpice", "KiCad", "Figma", "Linux"]
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary overflow-x-hidden relative">
      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999] scanline-overlay opacity-[0.03]" />

      {/* --- Navigation --- */}
      <nav className="fixed top-0 left-0 w-full h-16 bg-bg-base/85 backdrop-blur-xl border-b border-accent-primary/15 z-[1000] flex items-center justify-between px-6 md:px-12">
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          {['Home', 'About', 'Education', 'Skills', 'Projects', 'Research', 'Contact'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-text-muted font-mono text-[13px] hover:text-accent-primary transition-colors relative group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* AI Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/5 border border-accent-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse" />
            <span className="text-[9px] font-jetbrains text-accent-primary uppercase tracking-widest">AI Engine Active</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full border border-accent-primary/20 text-accent-primary hover:bg-accent-primary/10 transition-all hidden sm:flex"
            title="Change Theme"
          >
            <Palette size={16} />
          </button>

          {/* User Profile Section */}
          <div className="relative">
            {isAuthLoading ? (
              <div className="w-8 h-8 rounded-full bg-bg-elevated animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="relative w-8 h-8 rounded-full border border-accent-primary/30 overflow-hidden hover:border-accent-primary transition-colors"
                >
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-bg-elevated flex items-center justify-center">
                      <User size={16} className="text-accent-primary" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 glass-card border border-accent-primary/20 p-2 shadow-2xl"
                    >
                      <div className="px-3 py-2 border-b border-accent-primary/10 mb-2">
                        <p className="text-text-primary text-xs font-bold truncate">{profile?.username || user.displayName}</p>
                        <p className="text-text-muted text-[10px] truncate">{user.email}</p>
                      </div>
                      <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-muted hover:text-accent-primary hover:bg-accent-primary/5 rounded transition-colors">
                        <User size={14} /> Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowSettings(true);
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-muted hover:text-accent-primary hover:bg-accent-primary/5 rounded transition-colors"
                      >
                        <Settings size={14} /> Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error/5 rounded transition-colors mt-1"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-1.5 rounded border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-bg-base transition-all text-[10px] font-mono tracking-widest uppercase"
              >
                <LogIn size={14} /> Login
              </button>
            )}
          </div>

          <a href={IDENTITY.resumeUrl} className="btn-outline h-9 px-4 text-[11px] hidden sm:flex">
            <Download size={14} /> CV
          </a>
          <button
            className="md:hidden text-text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-bg-base z-[999] flex flex-col items-center justify-center gap-8"
          >
            {['Home', 'About', 'Education', 'Skills', 'Projects', 'Research', 'Contact'].map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="text-text-primary font-display text-2xl hover:text-accent-primary transition-colors"
              >
                {link}
              </a>
            ))}
            <a href={IDENTITY.resumeUrl} className="btn-primary mt-4">
              <Download size={18} /> Download CV
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Hero Section --- */}
      <section id="home" className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden bg-bg-base">
        {/* Circuit Background */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.05]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="var(--color-accent-primary)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-grid)" />
          </svg>
        </div>

        {/* Scanline Overlay */}
        <div className="absolute inset-0 scanline-overlay pointer-events-none z-[1]" />

        <div className="relative z-[2] flex flex-col items-center max-w-5xl w-full">
          {/* Profile Image with HUD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-48 h-48 md:w-64 md:h-64 mb-12"
          >
            {/* HUD Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border border-dashed border-accent-primary/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-8 border border-accent-secondary/20 rounded-full border-t-transparent border-b-transparent"
            />

            {/* Corner Brackets */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-accent-primary" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-accent-primary" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-accent-primary" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-accent-primary" />

            <div className="w-full h-full rounded-xl overflow-hidden border border-accent-primary/30 bg-bg-elevated relative z-10 shadow-[0_0_50px_rgba(var(--accent-primary-rgb),0.2)]">
              <img
                src={IDENTITY.profilePic}
                alt={IDENTITY.fullName}
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-accent-primary/5 pointer-events-none" />
            </div>

            {/* Status Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-bg-base border border-accent-primary/30 rounded-full text-[10px] font-mono text-accent-primary whitespace-nowrap z-20 shadow-lg">
              <span className="inline-block w-2 h-2 bg-accent-primary rounded-full animate-pulse mr-2" />
              SYSTEM ONLINE
            </div>
          </motion.div>

          {/* Name and Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-[80px] font-syncopate font-bold text-text-primary leading-none tracking-tighter mb-4 uppercase drop-shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.3)]">
              {IDENTITY.fullName}
            </h1>
            <p className="text-lg md:text-2xl font-mono text-accent-primary tracking-[0.4em] uppercase opacity-80">
              {IDENTITY.title}
            </p>
          </motion.div>

          {/* Identity Grid (rsmk style) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 w-full max-w-4xl mb-16 font-mono"
          >
            <div className="flex flex-col gap-1 border-l-2 border-accent-primary/20 pl-4">
              <span className="text-[10px] text-accent-primary uppercase tracking-widest opacity-60">Stream</span>
              <span className="text-sm md:text-base text-text-primary">{IDENTITY.stream}</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-accent-primary/20 pl-4">
              <span className="text-[10px] text-accent-primary uppercase tracking-widest opacity-60">Degree</span>
              <span className="text-sm md:text-base text-text-primary">{IDENTITY.degree}</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-accent-primary/20 pl-4">
              <span className="text-[10px] text-accent-primary uppercase tracking-widest opacity-60">DOB</span>
              <span className="text-sm md:text-base text-text-primary">{IDENTITY.dob}</span>
            </div>
            <div className="flex flex-col gap-1 border-l-2 border-accent-primary/20 pl-4">
              <span className="text-[10px] text-accent-primary uppercase tracking-widest opacity-60">Location</span>
              <span className="text-sm md:text-base text-text-primary">{IDENTITY.location}</span>
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <a href={`mailto:${IDENTITY.email}`} className="btn-primary px-10 py-4 text-xs tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(var(--accent-primary-rgb),0.3)]">
              <Mail size={16} className="mr-2" /> Contact Me
            </a>
            <a href={IDENTITY.github} className="btn-outline px-10 py-4 text-xs tracking-[0.2em] uppercase">
              <Github size={16} className="mr-2" /> GitHub
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-[0.3em]">scroll to initialize</span>
          <ChevronDown className="text-accent-primary animate-bounce" />
        </motion.div>
      </section>

      {/* --- About Section --- */}
      <section id="about" className="section-padding bg-bg-surface border-l-[3px] border-accent-primary overflow-hidden">
        <div className="content-max-width">
          <div className="mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-syncopate font-bold text-text-primary uppercase tracking-tight"
            >
              ABOUT <span className="text-accent-primary">ME</span>
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '60px' }}
              viewport={{ once: true }}
              className="h-1 bg-accent-primary mt-4"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-0 border border-accent-primary/20 rounded-lg overflow-hidden glass-card">

            {/* Left Side: Bio */}
            <div className="p-8 md:p-10 bg-bg-base/50 border-b lg:border-b-0 lg:border-r border-accent-primary/20 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-accent-primary font-mono text-xs tracking-widest uppercase">// BIO_LOGS</span>
                <div className="h-[1px] flex-grow bg-accent-primary/20" />
              </div>

              <div className="flex-grow flex flex-col justify-center">
                <div className="space-y-4 text-text-muted font-mono text-sm md:text-base leading-relaxed">
                  <p>{IDENTITY.bio1}</p>
                  <p>{IDENTITY.bio2}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Stats/Quick Info */}
            <div className="p-8 md:p-10 bg-bg-elevated/30 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-accent-secondary font-mono text-xs tracking-widest uppercase">// SYSTEM_STATS</span>
                <div className="h-[1px] flex-grow bg-accent-secondary/20" />
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {[
                  { num: IDENTITY.stats.projects, label: "Projects" },
                  { num: IDENTITY.stats.technologies, label: "Tech Stack" },
                  { num: IDENTITY.stats.certifications, label: "Certs" },
                  { num: IDENTITY.stats.years, label: "Years" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 border border-accent-primary/10 rounded-lg bg-bg-base/50 hover:border-accent-primary/30 transition-all group"
                  >
                    <div className="text-2xl md:text-3xl font-display font-bold text-accent-primary mb-1 group-hover:scale-110 transition-transform origin-left">{stat.num}+</div>
                    <div className="text-[9px] font-mono text-text-muted uppercase tracking-widest">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 border border-accent-secondary/20 rounded-lg bg-bg-base/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono text-accent-secondary uppercase tracking-widest">Current Status</span>
                  <span className="flex items-center gap-2 text-[9px] font-mono text-text-primary uppercase">
                    <span className="w-1.5 h-1.5 bg-accent-secondary rounded-full animate-pulse" />
                    Available
                  </span>
                </div>
                <div className="w-full h-1 bg-bg-elevated rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    viewport={{ once: true }}
                    className="h-full bg-accent-secondary"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- Education Section --- */}
      <section id="education" className="section-padding bg-bg-base border-l-[3px] border-accent-secondary">
        <div className="content-max-width">
          <SectionHeader label="// academic.history" heading="Education" />

          <div className="relative max-w-3xl mx-auto">
            {/* Vertical Timeline Line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{ originY: 0 }}
              className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent-primary via-accent-secondary to-accent-primary/10"
            />

            {EDUCATION.map((edu, i) => {
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: i * 0.25, duration: 0.7, ease: "easeOut" }}
                  className={`relative flex items-center mb-16 last:mb-0 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Card */}
                  <div
                    onClick={() => edu.imageUrl && setSelectedCert(edu.imageUrl)}
                    className={`w-[calc(50%-2rem)] glass-card p-7 border-t-4 border-accent-primary relative overflow-hidden group ${edu.imageUrl ? 'cursor-pointer' : ''} ${isLeft ? 'mr-auto' : 'ml-auto'} hover:shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.15)] transition-all duration-300`}
                  >
                    {/* Background icon */}
                    <div className="absolute -right-4 -top-4 text-accent-primary/5 group-hover:text-accent-primary/10 transition-colors duration-300">
                      <GraduationCap size={100} />
                    </div>

                    {/* Step number badge */}
                    <div className={`absolute top-4 ${isLeft ? 'right-4' : 'left-4'} w-6 h-6 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center`}>
                      <span className="text-accent-primary font-mono text-[9px] font-bold">{String(i + 1).padStart(2, '0')}</span>
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-accent-primary font-mono text-[10px] uppercase tracking-widest mb-3">
                        <Calendar size={11} />
                        {edu.period}
                      </div>
                      <h3 className="font-display text-lg text-text-primary mb-2 group-hover:text-accent-primary transition-colors duration-300">
                        {edu.degree}
                      </h3>
                      <p className="text-text-muted font-mono text-xs mb-3 leading-relaxed">{edu.institution}</p>
                      <div className="flex items-center gap-2 text-text-muted font-mono text-[10px] mb-4">
                        <MapPin size={11} className="text-accent-secondary" />
                        {edu.location}
                      </div>
                      {edu.imageUrl && (
                        <button className="text-accent-secondary font-mono text-[10px] hover:underline flex items-center gap-1 group/btn">
                          View Certificate
                          <ExternalLink size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.25 + 0.3, duration: 0.4, type: "spring" }}
                      className="w-5 h-5 rounded-full bg-accent-primary shadow-[0_0_16px_rgba(var(--accent-primary-rgb),0.7)] border-4 border-bg-base"
                    />
                  </div>

                  {/* Connector line from node to card */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.25 + 0.4, duration: 0.3 }}
                    style={{ originX: isLeft ? 1 : 0 }}
                    className={`absolute top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gradient-to-r ${isLeft ? 'from-accent-primary/10 to-accent-primary right-1/2' : 'from-accent-primary to-accent-primary/10 left-1/2'}`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- Skills Section --- */}
      <section id="skills" className="section-padding bg-bg-base">
        <div className="content-max-width">
          <SectionHeader label="// skill_matrix" heading="Technical Arsenal" />

          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {Object.keys(skillCategories).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2 rounded-full font-mono text-xs tracking-wider transition-all border ${activeTab === cat
                    ? 'bg-accent-primary border-accent-primary text-bg-base shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                    : 'border-text-muted/30 text-text-muted hover:border-accent-primary hover:text-accent-primary'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-12"
            >
              <div className="glass-card p-8">
                {skillCategories[activeTab as keyof typeof skillCategories].bars.map((skill, i) => (
                  <SkillBar key={i} name={skill.name} proficiency={skill.prof} />
                ))}
              </div>

              <div className="space-y-6">
                <h4 className="font-display text-sm text-text-primary uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={16} className="text-accent-primary" /> Related Tools
                </h4>
                <div className="flex flex-wrap gap-3">
                  {skillCategories[activeTab as keyof typeof skillCategories].tags.map(tag => (
                    <span key={tag} className="px-4 py-2 bg-bg-elevated border border-accent-primary/10 rounded-lg text-text-muted font-mono text-xs hover:border-accent-primary hover:text-accent-primary transition-all cursor-default">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* --- Projects Section --- */}
      <section id="projects" className="section-padding bg-bg-surface">
        <div className="content-max-width">
          <SectionHeader label="// projects[]" heading="What I've Built" />

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['All', 'Electronics', 'Automation', 'Smart City', 'Green Tech'].map(filter => (
              <button
                key={filter}
                onClick={() => setProjectFilter(filter)}
                className={`px-5 py-1.5 rounded-full font-mono text-[11px] tracking-widest transition-all border ${projectFilter === filter
                    ? 'bg-accent-primary border-accent-primary text-bg-base'
                    : 'border-text-muted/20 text-text-muted hover:border-accent-primary/50'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewDetail={(p) => setSelectedProject(p)}
                  onGenerateImage={handleGenerateImage}
                  isGenerating={generatingProjectId === project.id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Project Details Modal/Overlay */}
        <AnimatePresence>
          {selectedProject && (
            <ProjectDetail
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
            />
          )}
        </AnimatePresence>
      </section>

      {/* --- Research Section --- */}
      <section id="research" className="section-padding bg-bg-surface">
        <div className="content-max-width max-w-4xl">
          <SectionHeader 
            label="// technical.report" 
            heading="Paper Presentation: RBS" 
            subtitle="Regenerative Braking Systems represent a critical frontier in EEE/EV technology, focusing on the seamless conversion of kinetic energy back into usable storage."
          />

          {PAPERS.map((paper, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-bg-base border-l-4 border-accent-primary rounded-r-xl p-8 mb-8 group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-mono text-accent-secondary tracking-[0.3em] uppercase">Paper #0{i + 1}</span>
                <span className="px-3 py-1 border border-accent-primary/30 rounded-full text-[10px] text-accent-primary font-mono uppercase tracking-widest">
                  {paper.venue}
                </span>
              </div>
              <h3 className="font-display text-xl text-text-primary mb-4 group-hover:text-accent-primary transition-colors">{paper.title}</h3>
              <p className="text-text-muted font-mono text-sm leading-relaxed mb-6">
                {paper.abstract}
              </p>
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <span className="text-[11px] text-text-muted font-mono uppercase tracking-widest">Keywords:</span>
                {paper.keywords.map(kw => (
                  <span key={kw} className="px-2 py-1 bg-bg-elevated text-accent-secondary font-mono text-[10px] rounded">
                    {kw}
                  </span>
                ))}
              </div>

              {/* Aligned Technical Matter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 p-6 bg-accent-primary/5 rounded-xl border border-accent-primary/10 group-hover:border-accent-primary/30 transition-all">
                <div className="space-y-3">
                  <h4 className="text-accent-primary font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <Zap size={14} /> Core Mechanism
                  </h4>
                  <p className="text-text-muted font-mono text-[11px] leading-relaxed text-left opacity-80">
                    A regenerative braking system (RBS) is an energy recovery mechanism that slows a vehicle by converting its kinetic energy into electrical energy, rather than wasting it as heat via traditional friction brakes.
                  </p>
                </div>
                <div className="space-y-3 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8">
                  <h4 className="text-accent-secondary font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <Cpu size={14} /> Operational Logic
                  </h4>
                  <p className="text-text-muted font-mono text-[11px] leading-relaxed text-left opacity-80">
                    When braking, the electric motor acts as a generator, feeding power back into the battery, increasing efficiency, reducing brake wear, and extending EV range by 10-15%.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => paper.images && setActivePaperImages(paper.images)}
                className="btn-outline h-10 w-fit flex items-center gap-2"
              >
                Read Paper <ExternalLink size={14} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Paper Viewer Modal */}
        <AnimatePresence>
          {activePaperImages && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[6000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            >
              <div className="w-full h-full max-w-5xl relative flex flex-col items-center">
                <button
                  onClick={() => setActivePaperImages(null)}
                  className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-accent-primary transition-all z-[7000] border border-white/10 group"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform" />
                </button>

                <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center gap-8 py-12 px-4 scroll-smooth">
                   {activePaperImages.map((img, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="w-full max-w-5xl rounded-sm overflow-hidden border border-white/5 shadow-2xl bg-white"
                      >
                          <img 
                            src={img} 
                            alt={`Paper Page ${idx + 1}`} 
                            className="w-full h-auto block object-contain"
                          />
                      </motion.div>
                   ))}
                   

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>


      <section id="certifications" className="section-padding bg-bg-base">
        <div className="content-max-width">
          <SectionHeader label="// certifications.verified" heading="Certified Skills" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {CERTIFICATIONS.map((cert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => cert.imageUrl && setSelectedCert(cert.imageUrl)}
                className="glass-card p-6 flex flex-col cursor-pointer group hover:border-accent-primary/50 transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <ShieldCheck className="text-accent-primary group-hover:scale-110 transition-transform" size={32} />
                  <span className="px-2 py-1 bg-bg-elevated rounded text-[10px] text-text-muted font-mono">{cert.date}</span>
                </div>
                <h3 className="font-display text-sm text-text-primary mb-2 line-clamp-2 leading-snug group-hover:text-accent-primary transition-colors">{cert.title}</h3>
                <p className="text-accent-primary font-mono text-[11px] mb-6">Issued by {cert.issuer}</p>
                <button className="mt-auto text-accent-secondary font-mono text-[10px] hover:underline flex items-center gap-1">
                  View Certificate <ExternalLink size={10} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section id="contact" className="section-padding bg-bg-surface">
        <div className="content-max-width">
          <SectionHeader
            label="// open_channel()"
            heading="Get In Touch"
            subtitle="Whether it's a collaboration, internship, or just a chat about circuits — I'm listening."
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 mt-12">
            <div>
              <h3 className="font-display text-xl text-text-primary mb-8">Contact Details</h3>
              <div className="space-y-6 mb-12">
                {[
                  { icon: <Mail size={18} />, label: "Email", val: IDENTITY.email, url: `mailto:${IDENTITY.email}` },
                  { icon: <Github size={18} />, label: "GitHub", val: "suryabolisetti", url: IDENTITY.github },
                  { icon: <Linkedin size={18} />, label: "LinkedIn", val: "suryabolisetti", url: IDENTITY.linkedin },
                  { icon: <MapPin size={18} />, label: "Location", val: IDENTITY.location, url: "#" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 py-4 border-b border-bg-elevated">
                    <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center text-accent-primary">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] mb-1">{item.label}</div>
                      <a href={item.url} className="font-mono text-sm text-text-primary hover:text-accent-primary transition-colors">{item.val}</a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Oscilloscope Waveform */}
              <div className="h-20 w-full relative overflow-hidden opacity-40">
                <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none">
                  <motion.path
                    d="M 0 50 Q 25 0 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50 T 350 50 T 400 50"
                    fill="none"
                    stroke="var(--color-accent-primary)"
                    strokeWidth="2"
                    initial={{ pathOffset: 0 }}
                    animate={{ pathOffset: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </svg>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Signal Sent! (Simulation)"); }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-bg-elevated border border-accent-primary/10 rounded-lg p-4 font-mono text-sm text-text-primary focus:border-accent-primary focus:outline-none transition-all placeholder:text-text-muted"
                  required
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-bg-elevated border border-accent-primary/10 rounded-lg p-4 font-mono text-sm text-text-primary focus:border-accent-primary focus:outline-none transition-all placeholder:text-text-muted"
                  required
                />
              </div>
              <select defaultValue="" className="w-full bg-bg-elevated border border-accent-primary/10 rounded-lg p-4 font-mono text-sm text-text-primary focus:border-accent-primary focus:outline-none transition-all">
                <option value="" disabled>Select a subject...</option>
                <option>Collaboration</option>
                <option>Internship / Job</option>
                <option>Project Inquiry</option>
                <option>Research Discussion</option>
                <option>General</option>
              </select>
              <textarea
                placeholder="Tell me what's on your mind..."
                rows={5}
                className="w-full bg-bg-elevated border border-accent-primary/10 rounded-lg p-4 font-mono text-sm text-text-primary focus:border-accent-primary focus:outline-none transition-all placeholder:text-text-muted resize-none"
                required
              />
              <button type="submit" className="btn-primary w-full h-14 bg-gradient-to-r from-accent-primary to-accent-secondary text-bg-base font-display font-black uppercase tracking-[0.2em]">
                <Zap size={18} /> Send Signal
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Profile Setup Modal */}
      <AnimatePresence>
        {showProfileSetup && user && (
          <ProfileSetupModal
            user={user}
            onComplete={(newProfile) => {
              setProfile(newProfile);
              setShowProfileSetup(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && profile && (
          <SettingsModal
            profile={profile}
            onClose={() => setShowSettings(false)}
            onUpdate={(updated) => setProfile(updated)}
          />
        )}
      </AnimatePresence>

      {/* --- Footer --- */}
      <footer className="bg-bg-base border-t border-accent-primary/15 py-16 px-6">
        <div className="content-max-width flex flex-col items-center text-center">
          <div className="relative w-12 h-12 border border-accent-primary/40 flex items-center justify-center mb-6">
            <span className="font-jetbrains text-accent-primary font-bold text-xl">{IDENTITY.initials}</span>
          </div>
          <p className="font-mono text-sm text-text-muted mb-8 max-w-xs">
            Engineered with precision. Powered by curiosity.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {['Home', 'About', 'Skills', 'Projects', 'Experience', 'Research', 'Contact'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-text-muted font-mono text-xs hover:text-accent-primary transition-colors">
                {link}
              </a>
            ))}
          </div>

          <div className="w-full h-[1px] bg-bg-elevated mb-12" />

          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-6">
              <a href={IDENTITY.github} className="text-text-muted hover:text-accent-primary transition-colors"><Github size={20} /></a>
              <a href={IDENTITY.linkedin} className="text-text-muted hover:text-accent-primary transition-colors"><Linkedin size={20} /></a>
              <a href={`mailto:${IDENTITY.email}`} className="text-text-muted hover:text-accent-primary transition-colors"><Mail size={20} /></a>
            </div>
            <p className="font-jetbrains text-[13px] text-text-muted tracking-widest">
              © 2025 {IDENTITY.fullName}. All rights reserved.
            </p>
          </div>

          {showBackToTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-8 right-8 w-12 h-12 rounded-full border border-accent-primary/30 bg-bg-surface/80 backdrop-blur-md flex items-center justify-center text-accent-primary hover:bg-accent-primary hover:text-bg-base transition-all z-[1000] shadow-lg"
            >
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      </footer>

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-bg-base/90 backdrop-blur-xl"
            onClick={() => setSelectedCert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-bg-surface rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-bg-base/50 flex items-center justify-center text-text-primary hover:bg-accent-primary transition-colors z-10"
              >
                <X size={20} />
              </button>
              <div className="p-2 h-[85vh]">
                {selectedCert.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={selectedCert}
                    className="w-full h-full rounded-lg"
                    title="Certificate PDF"
                  />
                ) : (
                  <img
                    src={selectedCert}
                    alt="Certificate"
                    className="w-full h-auto object-contain max-h-full rounded-lg mx-auto"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
