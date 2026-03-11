package es.uniovi.recyclechain.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RecyclingEventRequest {

    @NotNull(message = "Station ID is required")
    private Long stationId;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weight;

    @NotNull(message = "Material type is required")
    private String materialType;

    private String transactionHash;

    public RecyclingEventRequest() {
    }

}