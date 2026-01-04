export type AppPath = 
  | '/' 
  | '/index.html' 
  | '/selectHive.html' 
  | '/frames.html' 
  | '/past/index.html'
  | '/past/inspectionDetail.html'
  | '/search.html'
  | '/hives/index.html'
  | '/hives/manage.html'
  | 'end.html';

interface NavOptions {
  replace?: boolean;
  params?: Record<string, string | number>;
}

export const navigateTo = (path: AppPath, options: NavOptions = {}): void => {
  const { replace = false, params } = options;
  const baseUrl = import.meta.env.BASE_URL;
  
  const fullPath = `${baseUrl}${path}`.replace(/\/+/g, '/');
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