const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? basePath + '/' : undefined,
  devIndicators: false,
};

