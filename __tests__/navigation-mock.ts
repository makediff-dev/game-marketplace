export const router = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
};

let pathname = "/";
let searchParams = new URLSearchParams();
let params: Record<string, string> = {};

export function setNavigation(next: {
  pathname?: string;
  search?: string;
  params?: Record<string, string>;
}) {
  pathname = next.pathname ?? "/";
  searchParams = new URLSearchParams(next.search ?? "");
  params = next.params ?? {};
}

export const useRouter = () => router;
export const usePathname = () => pathname;
export const useSearchParams = () => searchParams;
export const useParams = () => params;
export const redirect = jest.fn();
export const notFound = jest.fn();
