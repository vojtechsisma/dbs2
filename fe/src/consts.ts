export const SITE_TITLE = "Bike Service Portal";
export const SITE_DESCRIPTION =
  "Book and manage your bike service appointments online";

// API Endpoints
export const API = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/profile",
  },
  // Bike endpoints
  BIKES: {
    BASE: "/bikes",
    BY_ID: (id: number) => `/bikes/${id}`,
    BY_USER: (userId: number) => `/bikes?userId=${userId}`,
    SERVICE_HISTORY: (bikeId: number) => `/services/bike/${bikeId}/history`,
  },
  // Reservation endpoints
  RESERVATIONS: {
    BASE: "/reservations",
    BY_ID: (id: number) => `/reservations/${id}`,
    BY_STATUS: (statuses: string[]) =>
      `/reservations?${statuses.map((status) => `status=${status}`).join("&")}`,
  },
  // Service endpoints
  SERVICES: {
    BASE: "/services",
    BY_ID: (id: number) => `/services/${id}`,
    COMPLETE: "/services/complete",
    TECHNICIAN_STATS: "/services/technician/stats",
  },
  // Image endpoints
  IMAGES: {
    BASE: "/images",
    BY_ID: (id: number) => `/images/${id}`,
    UPLOAD: "/images/upload",
  },
};

// Status badge colors
export const STATUS_COLORS = {
  NEW: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-purple-100 text-purple-800",
  PROCESSING: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};
