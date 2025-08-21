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

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginationLinks {
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

export type CampaignResponse = PaginatedResponse<Campaign>;

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

export type ProspectResponse = PaginatedResponse<Prospect>;

export interface LandingpageSection {
  text: string;
  image_url: string;
  cta_text: string;
  cta_url: string;
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

export type LandingpageResponse = PaginatedResponse<Landingpage>;

// Prospect Filter Types
export interface SearchCriteriaResponse {
  source?: string[]
  gender?: string[]
  age?: { min: number; max: number }
  birth_date?: { min: string; max: string }
  blood_group?: string[]
  height?: { min: number; max: number }
  weight?: { min: number; max: number }
  eye_color?: string[]
  hair_color?: string[]
  "address.city"?: string[]
  "address.state"?: string[]
  "address.country"?: string[]
  "address.plz"?: { min: string; max: string }
  "address.latitude"?: { min: number; max: number }
  "address.longitude"?: { min: number; max: number }
}

export interface ProspectFilter {
  max_age?: number;
  min_age?: number;
  gender?: string;
  source?: string;
  [key: string]: any;
}

export interface PublicLandingpage {
  id: string;
  title: string;
  headline: string;
  subline: string;
  sections: LandingpageSection[];
}

export interface PublicCampaignData {
  id: string;
  title: string;
  slug: string;
  description: string;
  landingpage: PublicLandingpage;
}

export interface PublicCampaignResponse {
  data: PublicCampaignData;
}