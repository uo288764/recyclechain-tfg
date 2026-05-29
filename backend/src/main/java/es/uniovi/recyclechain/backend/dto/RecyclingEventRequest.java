package es.uniovi.recyclechain.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

/**
 * DTO for recording a new recycling event.
 * The qrPayload field carries the scanned QR code content,
 * which the backend validates via HMAC-SHA256 before processing.
 */
@Data
public class RecyclingEventRequest {

    @NotNull
    private Long stationId;

    @NotNull
    @Positive
    private Double weight;

    @NotBlank
    private String materialType;

    /**
     * Raw QR code payload scanned by the user at the recycling station.
     * Format: {stationId}:{timestampWindow}:{hmac}
     * Validated by QRValidationService before the recycling event is processed.
     */
    @NotBlank
    private String qrPayload;

    private String transactionHash;
}