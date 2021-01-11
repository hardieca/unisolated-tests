import { useLocation } from "react-router-dom";

/**
 * React hook to access querystring params
 * @returns React hook to access querystring params
 */
export const useQuery = () => new URLSearchParams(useLocation().search);
