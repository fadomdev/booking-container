<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reserva Anulada</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background-color: #ef4444;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }

        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
        }

        .info-box {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #ef4444;
        }

        .info-box p {
            margin: 8px 0;
        }

        .info-box strong {
            display: inline-block;
            width: 140px;
        }

        .comment-box {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Reserva Anulada</h1>
    </div>

    <div class="content">
        @if ($isAdminCancellation)
            <p>Estimado/a <strong>{{ $reservation->user->name }}</strong>,</p>
            <p>Le informamos que su reserva ha sido <strong>anulada por el administrador</strong> del sistema.</p>
        @else
            <p>Estimado/a Administrador,</p>
            <p>Le informamos que el usuario <strong>{{ $cancelledBy->name }}</strong> ha anulado su reserva.</p>
        @endif

        <div class="info-box">
            <h3 style="margin-top: 0;">Detalles de la Reserva</h3>
            <p><strong>Fecha:</strong> {{ $reservation->reservation_date->format('d/m/Y') }}</p>
            <p><strong>Hora:</strong> {{ $reservation->reservation_time }}</p>
            <p><strong>Transportista:</strong> {{ $reservation->transportista_name }}</p>
            <p><strong>Patente:</strong> {{ strtoupper($reservation->truck_plate) }}</p>
            <p><strong>Booking:</strong> {{ $reservation->booking->booking_number ?? 'N/A' }}</p>
            <p><strong>Cupos Reservados:</strong> {{ $reservation->slots_reserved }}</p>
            <p><strong>Anulada por:</strong> {{ $cancelledBy->name }}</p>
            <p><strong>Fecha de Anulación:</strong> {{ $reservation->cancelled_at->format('d/m/Y H:i') }}</p>
        </div>

        @if ($reservation->cancellation_comment)
            <div class="comment-box">
                <h4 style="margin-top: 0;">Motivo de la Anulación:</h4>
                <p>{{ $reservation->cancellation_comment }}</p>
            </div>
        @endif

        @if ($isAdminCancellation)
            <p>Si tiene alguna consulta sobre esta anulación, por favor contacte al administrador del sistema.</p>
        @else
            <p>Puede revisar los detalles completos en el sistema de reservas.</p>
        @endif

        <p>Gracias por utilizar nuestro sistema de reservas.</p>
    </div>

    <div class="footer">
        <p>Este es un correo automático, por favor no responder.</p>
        <p>Sistema de Reservas © {{ date('Y') }}</p>
    </div>
</body>

</html>
