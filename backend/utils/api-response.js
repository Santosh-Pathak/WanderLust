export class ApiResponse {
  static success(res, { data, message, meta, statusCode = 200 }) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
    });
  }

  static paginated(res, { items, total, page, limit, totalPages, message }) {
    return res.status(200).json({
      success: true,
      message,
      data: items,
      meta: { total, page, limit, totalPages },
    });
  }

  static created(res, { data, message = 'Created successfully' }) {
    return res.status(201).json({ success: true, message, data });
  }

  static noContent(res) {
    return res.status(204).send();
  }
}
