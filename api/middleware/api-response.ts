import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = any> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
  links?: {
    self: string;
    first?: string;
    last?: string;
    prev?: string;
    next?: string;
  };
}

export function formatApiResponse<T>(
  req: Request,
  res: Response,
  data: T,
  meta?: ApiResponse['meta']
) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const fullUrl = `${baseUrl}${req.originalUrl}`;

  const response: ApiResponse<T> = {
    data,
    links: {
      self: fullUrl
    }
  };

  if (meta) {
    response.meta = meta;

    // Add pagination links if meta contains pagination info
    if (meta.page !== undefined && meta.limit !== undefined && meta.total !== undefined) {
      const totalPages = Math.ceil(meta.total / meta.limit);
      const currentPage = meta.page;

      response.links = {
        ...response.links,
        first: `${baseUrl}${req.path}?page=1&limit=${meta.limit}`,
        last: `${baseUrl}${req.path}?page=${totalPages}&limit=${meta.limit}`,
      };

      if (currentPage > 1) {
        response.links.prev = `${baseUrl}${req.path}?page=${currentPage - 1}&limit=${meta.limit}`;
      }

      if (currentPage < totalPages) {
        response.links.next = `${baseUrl}${req.path}?page=${currentPage + 1}&limit=${meta.limit}`;
      }
    }
  }

  return response;
}

export function apiResponse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Add response formatter to response object
  res.formatApi = function<T>(data: T, meta?: ApiResponse['meta']) {
    return this.json(formatApiResponse(req, this, data, meta));
  };

  next();
}