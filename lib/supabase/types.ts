export type Location = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  hero_image_url: string;
  offices_count: string;
  coworking_count: string;
  meeting_rooms_count: string;
  phone_booths_count: string;
  podcast_rooms_count: string;
  address: string;
  display_order: number;
  published: boolean;
  floorplan_image_url: string | null;
  floorplan_width: number | null;
  floorplan_height: number | null;
  gallery_images: string[];
};

export type Service = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  hero_image_url: string;
  perks: string[];
  feature_heading: string;
  feature_body: string;
  feature_image_url: string;
  display_order: number;
  published: boolean;
};

export type PricingPackage = {
  id: string;
  name: string;
  price_aed: number;
  billing_period: string;
  features: string[];
  featured: boolean;
  display_order: number;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  category: string;
  published_at: string;
  published: boolean;
};

export type Enquiry = {
  id: string;
  created_at: string;
  service: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  people_count: string;
  location: string;
  status: "new" | "contacted" | "proposal_sent" | "won" | "lost";
  source: string;
};

export type EnquiryNote = {
  id: string;
  enquiry_id: string;
  author_email: string | null;
  note: string;
  created_at: string;
};

export type CustomPage = {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  content: any; // Puck's page data (JSON)
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProposalLibraryItem = {
  id: string;
  title: string;
  category: string;
  file_url: string;
  file_name: string;
  uploaded_by: string | null;
  created_at: string;
};

export type OccupancyUnit = {
  id: string;
  location_id: string;
  unit_code: string;
  category: "Private Office" | "Dedicated Desk" | "Flexi Desk" | "Meeting Room" | "Phone Booth";
  manual_status: "occupied" | "vacant";
  lease_type: "fixed" | "month_to_month";
  company_name: string | null;
  activity: string | null;
  view_description: string | null;
  workstations_total: number | null;
  workstations_occupied: number | null;
  size_sqm: number | null;
  size_sqft: number | null;
  listed_price: number | null;
  listed_ws_price: number | null;
  actual_rent: number | null;
  monthly_ws_rate: number | null;
  security_deposit: number | null;
  one_time_fee: number | null;
  start_date: string | null;
  end_date: string | null;
  renewal_date: string | null;
  renewal_notified_at: string | null;
  comments: string | null;
  hotspot_x: number;
  hotspot_y: number;
  hotspot_w: number;
  hotspot_h: number;
  created_at: string;
  updated_at: string;
};

// Verified directly against the real shared Supabase project
// (jdjnxwwdevgajxhzmjbm) via information_schema — this table is also
// used by flowork's mobile app, so only ever ADD nullable columns here,
// never rename/remove existing ones.
export type Space = {
  id: string;
  location_id: string;
  name: string;
  space_type: "boardroom" | "phonebooth" | "chatroom" | "meeting_room" | "podcast_room";
  capacity: number | null;
  photo_url: string | null;
  description: string | null;
  inclusions: string[];
  hourly_rate_aed: number | null; // member rate (mobile app)
  guest_hourly_rate_aed: number | null; // external/website rate; null = not sold to guests
  is_active: boolean;
  show_on_website: boolean;
  address: string | null;
  min_booking_minutes_override: number | null;
  max_booking_minutes_override: number | null;
  daily_user_limit_minutes: number | null;
  created_at: string;
};

export type BookingSettingsRow = {
  id: string;
  location_id: string | null;
  buffer_minutes: number;
  slot_increment_minutes: number;
  min_booking_minutes: number;
  max_booking_minutes: number | null;
  opening_time: string;
  closing_time: string;
  created_at: string;
};

export type RoomBooking = {
  id: string;
  space_id: string;
  user_id: string | null; // null = guest (website) booking
  starts_at: string;
  ends_at: string;
  status: "pending" | "confirmed" | "cancelled";
  payment_method: "cash" | "card_terminal" | "stripe" | "apple_pay" | "invoice";
  total_aed: number | null;
  full_name: string | null;
  email: string | null;
  emirates_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
};

export type OccupancyNote = {
  id: string;
  unit_id: string;
  author_email: string | null;
  note: string;
  created_at: string;
};

export type OccupancySnapshot = {
  id: string;
  location_id: string;
  snapshot_date: string;
  total_units: number;
  occupied_count: number;
  expiring_count: number;
  month_to_month_count: number;
  created_at: string;
};

export type OccupancyShareLink = {
  id: string;
  location_id: string;
  token: string;
  label: string | null;
  password_hash: string;
  password_salt: string;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

// Minimal Database type — expand with generated types via
// `supabase gen types typescript` once the project is linked.
export type Database = {
  public: {
    Tables: {
      locations: { Row: Location; Insert: Partial<Location>; Update: Partial<Location> };
      services: { Row: Service; Insert: Partial<Service>; Update: Partial<Service> };
      pricing_packages: { Row: PricingPackage; Insert: Partial<PricingPackage>; Update: Partial<PricingPackage> };
      blog_posts: { Row: BlogPost; Insert: Partial<BlogPost>; Update: Partial<BlogPost> };
      enquiries: { Row: Enquiry; Insert: Partial<Enquiry>; Update: Partial<Enquiry> };
      enquiry_notes: { Row: EnquiryNote; Insert: Partial<EnquiryNote>; Update: Partial<EnquiryNote> };
      proposal_library: { Row: ProposalLibraryItem; Insert: Partial<ProposalLibraryItem>; Update: Partial<ProposalLibraryItem> };
      occupancy_units: { Row: OccupancyUnit; Insert: Partial<OccupancyUnit>; Update: Partial<OccupancyUnit> };
      occupancy_notes: { Row: OccupancyNote; Insert: Partial<OccupancyNote>; Update: Partial<OccupancyNote> };
      occupancy_share_links: { Row: OccupancyShareLink; Insert: Partial<OccupancyShareLink>; Update: Partial<OccupancyShareLink> };
      occupancy_snapshots: { Row: OccupancySnapshot; Insert: Partial<OccupancySnapshot>; Update: Partial<OccupancySnapshot> };
      spaces: { Row: Space; Insert: Partial<Space>; Update: Partial<Space> };
      booking_settings: { Row: BookingSettingsRow; Insert: Partial<BookingSettingsRow>; Update: Partial<BookingSettingsRow> };
      room_bookings: { Row: RoomBooking; Insert: Partial<RoomBooking>; Update: Partial<RoomBooking> };
      custom_pages: { Row: CustomPage; Insert: Partial<CustomPage>; Update: Partial<CustomPage> };
    };
  };
};