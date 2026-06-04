package es.uniovi.recyclechain.backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO for recording a new recycling event.
 *
 * Sprint 8 — dual QR flow:
 * The weight and materialType fields are now optional. When containerId is
 * provided, both values are resolved from the ContainerBatch associated with
 * the container, preventing fraudulent manual weight declarations.
 *
 * If containerId is absent (legacy flow, kept for backwards compatibility
 * during the Sprint 8 transition), weight and materialType must be provided.
 *
 * The qrPayload field carries the station QR content, validated via
 * HMAC-SHA256 before the recycling event is processed (FR-06, FR-21, FR-22).
 */
@Data
public class RecyclingEventRequest {

    @NotNull
    private Long stationId;

    /**
     * ID of the container being deposited.
     * When present, weight and materialType are resolved from the ContainerBatch.
     * When absent, weight and materialType must be provided manually.
     */
    private Long containerId;

    /**
     * Weight in kilograms. Required only when containerId is absent.
     */
    @Positive
    private Double weight;

    /**
     * Material type key: plastic, metal, glass, paper, organic.
     * Required only when containerId is absent.
     */
    private String materialType;

    /**
     * Raw QR code payload scanned at the recycling station.
     * Format: {stationId}:{timestampWindow}:{hmac}
     * Validated by QRValidationService before processing.
     */
    @NotBlank
    private String qrPayload;

    private String transactionHash;
}