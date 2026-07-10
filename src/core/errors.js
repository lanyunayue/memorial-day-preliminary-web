export class ShikeError extends Error{
  constructor(code,message,cause){super(message);this.name='ShikeError';this.code=code;this.cause=cause;}
}

export function asShikeError(error,code='unexpected_error'){
  return error instanceof ShikeError?error:new ShikeError(code,error&&error.message?error.message:String(error),error);
}
