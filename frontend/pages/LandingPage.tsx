
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, BrainCircuit } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center w-12 h-12 bg-teal-100 text-teal-600 rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-slate-800">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full p-6 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-teal-600">BioLearn AI</h1>
          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto flex flex-col justify-center items-center text-center px-4 py-20">
        <h2 className="text-5xl md:text-6xl font-extrabold text-slate-800 mb-4">
          The Future of Collaborative Biology Education
        </h2>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8">
          An AI-powered platform designed for pre-service teachers in Nigeria to foster engagement, enhance learning, and track academic growth like never before.
        </p>
        <div className="flex gap-4">
          <Link to="/register" className="px-8 py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-transform transform hover:scale-105 shadow-lg">
            Get Started for Free
          </Link>
        </div>
      </main>

      <section className="w-full bg-white py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-slate-800 mb-12">Why BioLearn AI?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BrainCircuit size={24} />}
              title="AI-Powered Groups"
              description="Students collaborate in mini-groups with an integrated AI assistant to brainstorm, explore concepts, and take notes."
            />
            <FeatureCard
              icon={<Users size={24} />}
              title="Seamless Collaboration"
              description="Real-time video, audio, and text chat in both main classroom and group sessions for effective communication."
            />
            <FeatureCard
              icon={<BookOpen size={24} />}
              title="Research-Driven"
              description="Specifically designed to gather data on student achievement, retention, and engagement for educational studies."
            />
          </div>
        </div>
      </section>

      <footer className="w-full py-6 bg-slate-800 text-slate-300">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 BioLearn AI. All rights reserved. A research tool for educational advancement.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
