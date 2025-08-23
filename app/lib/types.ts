interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PaginationLinks {
  first?: string;
  last?: string;
  prev?: string;
  next?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prospect_filter: ProspectFilter;
  slug: string;
  landingpage_id: string | null;
  landingpage?: {
    id: string;
    title: string;
  } | null;
}


export interface Prospect {
  id: string;
  gender: string;
  age: number;
  birthDate: string;
  image: string;
  bloodGroup: string;
  height: number;
  weight: number;
  eyeColor: string;
  hairColor: string;
  hairType: string;
  address: {
    address: string;
    city: string;
    state: string;
    plz: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}


export interface Landingpage {
  id: string;
  campaigns: {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status: string;
    slug: string;
    prospect_filter: ProspectFilter;
  }[];
  title: string;
  headline: string;
  subline: string;
  sections: LandingpageSection[];
}

export interface LandingpageSection {
  text: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
}

export interface ProspectFilter {
  max_age?: number;
  min_age?: number;
  gender?: string;
  source?: string;
  [key: string]: any;
}

export interface PublicCampaignData {
  id: string;
  title: string;
  slug: string;
  description: string;
  landingpage: any;
}
export interface PublicCampaignResponse {
  data: PublicCampaignData;
}