export function responseSuccess(message: string) {
  return {
    success: true,
    message,
  };
}

export function responseError(message: string) {
  return {
    success: false,
    message,
  };
}
