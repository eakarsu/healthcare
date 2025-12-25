import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/storage_service.dart';

const String baseUrl = 'https://api.practiceflux.com/v1';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  dio.interceptors.add(AuthInterceptor(ref));
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
    error: true,
  ));

  return dio;
});

class AuthInterceptor extends Interceptor {
  final Ref ref;

  AuthInterceptor(this.ref);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await StorageService.instance.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Try to refresh token
      final refreshed = await _refreshToken();
      if (refreshed) {
        // Retry the request
        try {
          final token = await StorageService.instance.getAccessToken();
          err.requestOptions.headers['Authorization'] = 'Bearer $token';
          final response = await Dio().fetch(err.requestOptions);
          return handler.resolve(response);
        } catch (e) {
          return handler.next(err);
        }
      }
    }
    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await StorageService.instance.getRefreshToken();
      if (refreshToken == null) return false;

      final response = await Dio().post(
        '$baseUrl/auth/refresh',
        data: {'refresh_token': refreshToken},
      );

      if (response.statusCode == 200) {
        final accessToken = response.data['access_token'] as String;
        final newRefreshToken = response.data['refresh_token'] as String;
        await StorageService.instance.saveTokens(accessToken, newRefreshToken);
        return true;
      }
      return false;
    } catch (e) {
      await StorageService.instance.clearTokens();
      return false;
    }
  }
}

class ApiClient {
  final Dio _dio;

  ApiClient(this._dio);

  // Auth endpoints
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<void> logout() async {
    await _dio.post('/auth/logout');
  }

  Future<Map<String, dynamic>> getCurrentUser() async {
    final response = await _dio.get('/auth/me');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _dio.put('/auth/profile', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    await _dio.post('/auth/change-password', data: {
      'current_password': currentPassword,
      'new_password': newPassword,
    });
  }

  // Appointments endpoints
  Future<Map<String, dynamic>> getAppointments({
    String? status,
    DateTime? startDate,
    DateTime? endDate,
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dio.get('/appointments', queryParameters: {
      if (status != null) 'status': status,
      if (startDate != null) 'start_date': startDate.toIso8601String(),
      if (endDate != null) 'end_date': endDate.toIso8601String(),
      'page': page,
      'limit': limit,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getAppointment(String id) async {
    final response = await _dio.get('/appointments/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createAppointment(Map<String, dynamic> data) async {
    final response = await _dio.post('/appointments', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<void> cancelAppointment(String id, String? reason) async {
    await _dio.post('/appointments/$id/cancel', data: {
      if (reason != null) 'reason': reason,
    });
  }

  Future<void> confirmAppointment(String id) async {
    await _dio.post('/appointments/$id/confirm');
  }

  Future<List<dynamic>> getProviders() async {
    final response = await _dio.get('/providers');
    return response.data as List<dynamic>;
  }

  Future<List<dynamic>> getLocations() async {
    final response = await _dio.get('/locations');
    return response.data as List<dynamic>;
  }

  Future<List<dynamic>> getAvailableSlots(String providerId, DateTime date) async {
    final response = await _dio.get('/providers/$providerId/availability', queryParameters: {
      'date': date.toIso8601String(),
    });
    return response.data as List<dynamic>;
  }

  // Medical Records endpoints
  Future<Map<String, dynamic>> getMedicalRecords({
    String? type,
    int page = 1,
    int limit = 20,
  }) async {
    final response = await _dio.get('/medical-records', queryParameters: {
      if (type != null) 'type': type,
      'page': page,
      'limit': limit,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMedicalRecord(String id) async {
    final response = await _dio.get('/medical-records/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getMedications() async {
    final response = await _dio.get('/medications');
    return response.data as List<dynamic>;
  }

  Future<List<dynamic>> getAllergies() async {
    final response = await _dio.get('/allergies');
    return response.data as List<dynamic>;
  }

  Future<Map<String, dynamic>> getLatestVitals() async {
    final response = await _dio.get('/vitals/latest');
    return response.data as Map<String, dynamic>;
  }

  // Messages endpoints
  Future<Map<String, dynamic>> getConversations({int page = 1, int limit = 20}) async {
    final response = await _dio.get('/messages/conversations', queryParameters: {
      'page': page,
      'limit': limit,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getMessages(String conversationId, {int page = 1, int limit = 50}) async {
    final response = await _dio.get('/messages/conversations/$conversationId/messages', queryParameters: {
      'page': page,
      'limit': limit,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> sendMessage(Map<String, dynamic> data) async {
    final response = await _dio.post('/messages', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<int> getUnreadCount() async {
    final response = await _dio.get('/messages/unread-count');
    return response.data['count'] as int;
  }

  // Payments endpoints
  Future<Map<String, dynamic>> getInvoices({String? status, int page = 1, int limit = 20}) async {
    final response = await _dio.get('/invoices', queryParameters: {
      if (status != null) 'status': status,
      'page': page,
      'limit': limit,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getInvoice(String id) async {
    final response = await _dio.get('/invoices/$id');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getPayments({int page = 1, int limit = 20}) async {
    final response = await _dio.get('/payments', queryParameters: {
      'page': page,
      'limit': limit,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> processPayment(Map<String, dynamic> data) async {
    final response = await _dio.post('/payments', data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getPaymentMethods() async {
    final response = await _dio.get('/payment-methods');
    return response.data as List<dynamic>;
  }

  Future<void> deletePaymentMethod(String id) async {
    await _dio.delete('/payment-methods/$id');
  }

  Future<void> setDefaultPaymentMethod(String id) async {
    await _dio.post('/payment-methods/$id/default');
  }

  Future<List<dynamic>> getInsurance() async {
    final response = await _dio.get('/insurance');
    return response.data as List<dynamic>;
  }

  // Notifications endpoints
  Future<Map<String, dynamic>> getNotifications({int page = 1, int limit = 20}) async {
    final response = await _dio.get('/notifications', queryParameters: {
      'page': page,
      'limit': limit,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<void> markNotificationRead(String id) async {
    await _dio.post('/notifications/$id/read');
  }

  Future<void> markAllNotificationsRead() async {
    await _dio.post('/notifications/read-all');
  }
}

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(dioProvider));
});
