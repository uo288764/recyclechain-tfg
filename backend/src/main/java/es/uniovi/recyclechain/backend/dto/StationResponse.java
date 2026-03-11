package es.uniovi.recyclechain.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class StationResponse {

    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String walletAddress;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public StationResponse() {
    }

    public StationResponse(Long id, String name, String address, Double latitude, Double longitude, 
                          String walletAddress, Boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.walletAddress = walletAddress;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

}