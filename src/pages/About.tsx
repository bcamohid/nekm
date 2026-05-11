import { useEffect, useState } from 'react';
import { Leaf, Target, Eye, Heart, Award } from 'lucide-react';
import { supabase, AboutContent } from '../lib/supabase';

// --- IMPORT LOCAL TEAM PHOTOS ---
import photo1 from '../assets/team/image_974b9a.jpg';
import photo2 from '../assets/team/image_974894.jpg';
import photo3 from '../assets/team/image_974838.jpg';
import photo4 from '../assets/team/image_9747f8.jpg';

const values = [
  { icon: Target, title: 'Our Mission', desc: 'To bridge the gap between modern agricultural science and traditional farming in North East India through accessible, localised support.' },
  { icon: Eye, title: 'Our Vision', desc: 'A prosperous, self-sufficient farming community across all 8 North East states where every farmer has access to quality knowledge and markets.' },
  { icon: Heart, title: 'Our Values', desc: 'Integrity, inclusivity, and community-first thinking drive every decision we make — from the tools we build to the partnerships we form.' },
];

const team = [
  { 
    name: 'Rudra Upadhaya', 
    role: 'Special Technician of Button Mushroom Grower', 
    description: 'With 26 years of perfect experience. From Hariyana (Punjab).',
    img: photo1 
  },
  { 
    name: 'Bornali Sharmah Baruah', 
    role: 'Founder of EASY HEAT pvt ltd', 
    description: 'From Golaghat (Assam).',
    img: photo2 
  },
  { 
    name: 'Dr. Shahjamal Zakaria', 
    role: 'Chief Scientist, Horticulture Dept. (China, Hongkong)', 
    description: 'From Guwahati (Assam).',
    img: photo3 
  },
  { 
    name: 'Dr. Jamini Kumar Dutta', 
    role: 'Asst. Scientist, Plant Pathology Dept.', 
    description: 'Lakhimpur Krishi Vigyan Kendra.',
    img: photo4 
  },
];

export default function About() {
  const [about, setAbout] = useState<AboutContent | null>(null);

  useEffect(() => {
    supabase.from('about_content').select('*').eq('is_active', true).maybeSingle().then(({ data, error }) => {
      if (error) {
        console.error('Error fetching about content:', error);
      } else if (data) {
        setAbout(data);
      }
    });
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 bg-green-800 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Leaf className="w-3.5 h-3.5" /> Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">About NorthEastKrishimitra</h1>
          <p className="text-green-200 max-w-2xl mx-auto text-lg leading-relaxed">
            A decade-old commitment to the farmers and agri-students of North East India.
          </p>
        </div>
      </section>

      {/* About content from DB */}
      {about && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Who We Are</span>
                <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-5">{about.title}</h2>
                <p className="text-gray-600 leading-relaxed text-lg">{about.body}</p>
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[['5,000+', 'Farmers'], ['8', 'States'], ['12+', 'Years']].map(([v, l]) => (
                    <div key={l} className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">{v}</div>
                      <div className="text-xs text-gray-500 mt-1">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img
                  src={about.image_url}
                  alt={about.title}
                  className="rounded-3xl shadow-xl w-full h-[420px] object-cover"
                />
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-600 rounded-2xl opacity-20" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">What Drives Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Mission, Vision & Values</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center group hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-green-600 transition-colors">
                  <Icon className="w-7 h-7 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">The People</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Meet Our Mentors</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((m) => (
              <div key={m.name} className="text-center group flex flex-col items-center">
                <div className="relative mb-4 mx-auto w-36 h-36">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="w-36 h-36 rounded-2xl object-cover shadow-md group-hover:shadow-lg transition-shadow"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-green-600/0 group-hover:ring-green-600/40 transition-all" />
                </div>
                <h3 className="font-bold text-gray-900 leading-tight">{m.name}</h3>
                <p className="text-sm font-semibold text-green-600 mt-1 mb-2">{m.role}</p>
                <p className="text-xs text-gray-500 px-2">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestone Timeline */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Key Milestones</h2>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-0.5 top-0 bottom-0 w-0.5 bg-green-200 hidden md:block" />
            {[
              { year: '2012', event: 'Founded in Guwahati with a mission to support Assam\'s rice farmers.' },
              { year: '2015', event: 'Expanded operations to Meghalaya, Nagaland, and Mizoram.' },
              { year: '2018', event: 'Launched digital platform and online training modules.' },
              { year: '2021', event: 'Crossed 3,000 registered farmers; introduced Agri-Shop.' },
              { year: '2024', event: 'Now serving all 8 North East states with 5,000+ members.' },
            ].map((m, i) => (
              <div key={m.year} className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="hidden md:flex w-1/2 justify-end">
                  {i % 2 === 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 max-w-xs">
                      <p className="text-sm text-gray-600">{m.event}</p>
                    </div>
                  )}
                  {i % 2 !== 0 && (
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md z-10 text-white font-bold text-xs">
                      {m.year.slice(2)}
                    </div>
                  )}
                </div>
                <div className="hidden md:flex w-1/2 justify-start">
                  {i % 2 === 0 && (
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md z-10 text-white font-bold text-xs">
                      {m.year.slice(2)}
                    </div>
                  )}
                  {i % 2 !== 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 max-w-xs">
                      <p className="text-sm text-gray-600">{m.event}</p>
                    </div>
                  )}
                </div>
                {/* Mobile */}
                <div className="md:hidden flex items-start gap-4 w-full">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-md shrink-0 text-white font-bold text-xs">
                    {m.year.slice(2)}
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1">
                    <div className="font-bold text-green-700 text-sm mb-1">{m.year}</div>
                    <p className="text-sm text-gray-600">{m.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Recognition</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Awards & Certifications</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              'ATMA Best Agri-NGO 2022, North East India',
              'NABARD Rural Innovation Award 2021',
              'Ministry of Agriculture — Digital India Agri Champion 2023',
            ].map((award) => (
              <div key={award} className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 font-medium">{award}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Supported & Partnered By
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['NABARD', 'ATMA', 'ICAR', 'Ministry of Agriculture', 'North East Council'].map((p) => (
              <span key={p} className="text-gray-600 font-bold text-sm">{p}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}