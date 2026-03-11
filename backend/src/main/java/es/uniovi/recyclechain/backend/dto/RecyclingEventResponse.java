package es.uniovi.recyclechain.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class RecyclingEventResponse {

    private Long id;
    private Long userId;
    private String userName;
    private Long stationId;
    private String stationName;
    private Double weight;
    private String materialType;
    private Double tokensEarned;
    private String transactionHash;
    private LocalDateTime createdAt;

    public RecyclingEventResponse() {
    }

    public RecyclingEventResponse(Long id, Long userId, String userName, Long stationId, 
                                 String stationName, Double weight, String materialType, 
                                 Double tokensEarned, String transactionHash, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.stationId = stationId;
        this.stationName = stationName;
        this.weight = weight;
        this.materialType = materialType;
        this.tokensEarned = tokensEarned;
        this.transactionHash = transactionHash;
        this.createdAt = createdAt;
    }

}