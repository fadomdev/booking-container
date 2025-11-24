<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BookingValidationService
{
    /**
     * Validate booking number with external API
     * 
     * @param string $bookingNumber
     * @return array ['valid' => bool, 'message' => string, 'data' => array|null]
     */
    public function validateBooking(string $bookingNumber): array
    {
        try {
            // Get API configuration from .env
            $apiUrl = config('services.booking_api.url');
            $apiKey = config('services.booking_api.key');
            $apiTimeout = config('services.booking_api.timeout', 10);

            // If API is not configured, reject validation
            if (!$apiUrl) {
                Log::warning('Booking API not configured');
                return [
                    'valid' => false,
                    'message' => 'Sistema de validación no configurado',
                    'data' => null
                ];
            }

            $requestData = [
                'booking_number' => $bookingNumber,
                'action' => 'valida_booking',
            ];

            Log::info('Validating booking with API', [
                'booking_number' => $bookingNumber,
                'api_url' => $apiUrl,
                'method' => 'POST',
                'params' => $requestData
            ]);

            // Make API request - send JSON to php://input
            $response = Http::timeout($apiTimeout)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($apiUrl, $requestData);

            Log::info('Booking API response', [
                'booking_number' => $bookingNumber,
                'status' => $response->status(),
                'body' => $response->body(),
                'headers' => $response->headers()
            ]);

            // Check response status
            if ($response->successful()) {
                $data = $response->json();

                Log::info('Booking API successful response', [
                    'booking_number' => $bookingNumber,
                    'data' => $data,
                    'raw_body' => $response->body()
                ]);

                // Check if response is empty or null
                if (empty($data) || $data === null) {
                    return [
                        'valid' => false,
                        'message' => "Booking no válido",
                        'data' => null
                    ];
                }

                // Expected response format: {"success": true/false, "status": "active", "exists": true/false}

                // First check: exists field (most important)
                if (isset($data['exists'])) {
                    if (!$data['exists']) {
                        return [
                            'valid' => false,
                            'message' => $data['message'] ?? "Booking no válido",
                            'data' => $data
                        ];
                    }

                    // Exists field validated - booking number is valid
                    return [
                        'valid' => true,
                        'message' => 'Booking válido',
                        'data' => $data
                    ];
                }

                // Fallback: check success and status without exists field
                $success = $data['success'] ?? false;
                $status = $data['status'] ?? null;

                if ($success && ($status === 'active' || $status === 'confirmed')) {
                    return [
                        'valid' => true,
                        'message' => 'Booking válido',
                        'data' => $data
                    ];
                }

                // Check if the API returned an error flag
                if (isset($data['error']) && $data['error']) {
                    return [
                        'valid' => false,
                        'message' => $data['message'] ?? "Booking no válido",
                        'data' => $data
                    ];
                }

                // Default to invalid if we can't determine the status
                return [
                    'valid' => false,
                    'message' => $data['message'] ?? "Booking no válido",
                    'data' => $data
                ];
            }

            // Handle different error responses
            if ($response->status() === 404) {
                return [
                    'valid' => false,
                    'message' => "Booking no válido",
                    'data' => null
                ];
            }

            // Other errors
            Log::error('Booking API validation failed', [
                'booking_number' => $bookingNumber,
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'valid' => false,
                'message' => 'Booking no válido',
                'data' => null
            ];
        } catch (\Exception $e) {
            // Log the error
            Log::error('Booking API validation exception', [
                'booking_number' => $bookingNumber,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Fail closed: reject reservations if API is down
            return [
                'valid' => false,
                'message' => 'No se pudo validar el booking. Por favor intente nuevamente.',
                'data' => null
            ];
        }
    }
}
