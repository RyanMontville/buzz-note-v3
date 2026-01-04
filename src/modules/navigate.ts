export type AppPath =
  | '/'
  | '/index'
  | '/selectHive'
  | '/frames'
  | '/past/'
  | '/past/inspectionDetail'
  | '/search'
  | '/hives/'
  | '/hives/manage'
  | '/end';

interface NavOptions {
  replace?: boolean;
  params?: Record<string, string | number>;
}

export const navigateTo = (path: AppPath, options: NavOptions = {}): void => {
  const { replace = false, params } = options;
  const baseUrl = import.meta.env.BASE_URL;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const fullPath = `${baseUrl}${cleanPath}`;
  const url = new URL(fullPath, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  if (replace) {
    window.location.replace(url.href);
  } else {
    window.location.href = url.href;
  }
};