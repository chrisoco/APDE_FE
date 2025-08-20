import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router";
import type { Route } from "./+types/landingpage";
import type { PublicCampaignResponse, PublicCampaignData } from "../lib/types";
import { apiHelpers } from "../lib/api";
import { Button } from "../components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Campaign Landing Page" },
    { name: "description", content: "View campaign details and landing page content" },
  ];
}

export default function CampaignLandingPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<PublicCampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Pass all URL search params to the API call
        const queryString = searchParams.toString();
        const url = queryString ? `/api/cp/${slug}?${queryString}` : `/api/cp/${slug}`;
        
        const response = await apiHelpers.get<PublicCampaignResponse>(url);
        setData(response.data);
      } catch (err) {
        setError('Failed to load. Please try again later.');
        console.error('Error loading campaign:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-emerald-400 mx-auto animate-pulse"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-700 animate-pulse">Loading your experience...</p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-rose-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Oops! Something went wrong</h1>
          <p className="text-lg text-slate-600 mb-6">{error || 'The campaign you\'re looking for could not be found'}</p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Try Again
            </Button>
            <p className="text-sm text-slate-500">or check the URL and try again</p>
          </div>
        </div>
      </div>
    );
  }

  const { landingpage } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800">
        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-5xl lg:text-5xl font-black mb-8 text-white leading-tight">
              <span className="bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                {landingpage.headline}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 font-light leading-relaxed max-w-4xl mx-auto">
              {landingpage.subline}
            </p>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative py-24">
        <div className="container mx-auto px-4">
          {landingpage.sections.map((section, index) => (
            <div key={index} className="mb-32 last:mb-0">
              {index === 0 ? (
                /* Hero Content Section */
                <div className="text-center max-w-6xl mx-auto">
                  {section.image_url && (
                    <div className="mb-16 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-3xl transform scale-105 opacity-30"></div>
                      <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
                        <img
                          src={section.image_url}
                          alt={`Section ${index + 1}`}
                          className="w-full h-auto rounded-2xl"
                          style={{ maxHeight: '500px', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="max-w-4xl mx-auto">
                    {section.text && (
                      <div className="prose prose-xl prose-slate mx-auto">
                        {section.text.split('\n\n').map((paragraph, pIndex) => (
                          <p key={pIndex} className="mb-6 text-slate-700 leading-relaxed text-lg font-light">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                    {section.cta_text && (
                      <div className={section.text ? "mt-12" : "mt-0"}>
                        <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-12 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                          <a 
                            href={section.cta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2"
                          >
                            <span>{section.cta_text}</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : section.text ? (
                /* Alternating Feature Sections with Text */
                <div className={`${section.image_url ? 'grid lg:grid-cols-2 gap-16 items-center' : 'flex justify-center'} max-w-7xl mx-auto`}>
                  {section.image_url && (
                    <div className={`${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'} relative group`}>
                      <div className={`absolute inset-0 bg-gradient-to-br from-slate-100 to-emerald-50 rounded-3xl transform scale-105 opacity-50 transition-transform duration-300 ${index % 2 === 1 ? '-rotate-2 group-hover:rotate-0' : 'rotate-2 group-hover:rotate-0'}`}></div>
                      <div className="relative bg-white rounded-3xl p-6 shadow-2xl">
                        <img
                          src={section.image_url}
                          alt={`Section ${index + 1}`}
                          className="w-full h-auto rounded-2xl"
                          style={{ maxHeight: '400px', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  )}
                  <div className={`${index % 2 === 1 ? 'lg:order-1 lg:text-right' : 'lg:order-2'} space-y-8 text-center ${index % 2 === 1 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="space-y-6">
                      {section.text.split('\n\n').map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-lg text-slate-700 leading-relaxed font-light">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.cta_text && (
                      <div className={`pt-4 text-center ${index % 2 === 1 ? 'lg:text-right' : 'lg:text-left'}`}>
                        <Button asChild className="bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white px-8 py-4 text-base font-medium rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                          <a 
                            href={section.cta_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2"
                          >
                            <span>{section.cta_text}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Centered Image Only Section (when text is null/empty) */
                <div className="text-center max-w-4xl mx-auto">
                  {section.image_url && (
                    <div className="mb-8 relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-3xl transform scale-105 opacity-40 transition-transform duration-300 group-hover:scale-110"></div>
                      <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                        <img
                          src={section.image_url}
                          alt={`Section ${index + 1}`}
                          className="w-full h-auto rounded-2xl"
                          style={{ maxHeight: '600px', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  )}
                  {section.cta_text && (
                    <div className="mt-8">
                      <Button asChild size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-12 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                        <a 
                          href={section.cta_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2"
                        >
                          <span>{section.cta_text}</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">{data.title}</h3>
            </div>
            <div className="border-t border-slate-700 pt-8">
              <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} {data.title}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}