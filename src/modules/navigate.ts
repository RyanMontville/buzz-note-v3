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
  
  // 1. Construct the URL
  const url = new URL(path, window.location.origin);

  // 2. Append Search Params (if any)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  // 3. Navigate
  if (replace) {
    window.location.replace(url.href);
  } else {
    window.location.href = url.href;
  }
};