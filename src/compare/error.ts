export enum ScreenshotTestingErrorType {
  NoImage = 'screenshot-testing:error:no-image',
  Unknown = 'screenshot-testing:error:unknown'
}

export type ScreenshotTestingError =
  ScreenshotTestingErrorNoImage |
  ScreenshotTestingErrorUnknown;

export interface ScreenshotTestingErrorNoImage {
  type: ScreenshotTestingErrorType.NoImage;
  filePath: string;
}

export interface ScreenshotTestingErrorUnknown {
  type: ScreenshotTestingErrorType.Unknown;
  error: any;
}

const ensureError = (error: any): ScreenshotTestingError => {
  if (typeof error === 'undefined') return newUnknownError(error);
  if (error === null) return newUnknownError(error);
  if (typeof error !== 'object') return newUnknownError(error);
  if (isNoImageError(error)) return error;
  if (isUnknownError(error)) return error;
  return newUnknownError(error);
};

const isNoImageError = (
  error: ScreenshotTestingError
): error is ScreenshotTestingErrorNoImage => {
  return error.type === ScreenshotTestingErrorType.NoImage;
};

const isUnknownError = (
  error: ScreenshotTestingError
): error is ScreenshotTestingErrorUnknown => {
  return error.type === ScreenshotTestingErrorType.Unknown;
};

const newNoImageError = (filePath: string): ScreenshotTestingErrorNoImage => {
  return {
    filePath,
    type: ScreenshotTestingErrorType.NoImage
  };
};

const newUnknownError = (error: any): ScreenshotTestingErrorUnknown => {
  return {
    error,
    type: ScreenshotTestingErrorType.Unknown
  };
};

export {
  ensureError,
  isNoImageError,
  isUnknownError,
  newNoImageError,
  newUnknownError
};
